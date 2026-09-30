import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { config } from "../src/lib/server/config";

test("API validation and local feedback persistence", async (t) => {
  const cwd = process.cwd();
  const directory = await mkdtemp(path.join(tmpdir(), "northlens-audit-"));
  config.geminiKey = "";
  config.supabaseKey = "";
  process.chdir(directory);
  try {
    const store = await import("../src/lib/server/store");
    const ask = await import("../src/app/api/ask/route");
    const feedback = await import("../src/app/api/feedback/route");
    const review = await import("../src/app/api/feedback/[id]/route");
    const request = (body: unknown, method = "POST") =>
      new Request("http://localhost/api", {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    const file = path.join(directory, ".data", "feedback.json");

    await t.test("non-string questions return 400", async () => {
      for (const question of [42, {}, [], null]) {
        assert.equal((await ask.POST(request({ question, persona: "caregiver", concern: "accessibility" }))).status, 400);
      }
      assert.equal((await ask.POST(request({ question: "Station access", persona: "caregiver", concern: "accessibility" }))).status, 200);
    });

    await t.test("classifier rejects missing fields and strips unexpected model properties", async (context) => {
      const { getGemini } = await import("../src/lib/server/clients");
      const { classifyFeedback } = await import("../src/lib/server/classify");
      config.geminiKey = "test-key-no-network";
      const modelResult = {
        theme: "public_transport", stakeholder: "student", zone: "town_centre",
        sentiment: "neutral", concern: "Bus services", suggestedIssue: "Bus frequency",
      };
      const generate = context.mock.method(getGemini()!.models, "generateContent", async () => ({
        text: JSON.stringify({ ...modelResult, text: "Unexpected replacement", id: "unexpected-id" }),
      }));
      try {
        const valid = await classifyFeedback("Bus services", "student", []);
        assert.equal(valid.by, "gemini");
        assert.deepEqual(valid.result, modelResult);
        generate.mock.mockImplementation(async () => ({
          text: JSON.stringify({ ...modelResult, concern: null }),
        }));
        assert.equal((await classifyFeedback("Bus services", "student", [])).by, "rules");
      } finally {
        generate.mock.restore();
        config.geminiKey = "";
      }
    });

    const initial = await store.listFeedback();
    await t.test("priorities only accept known options and remove duplicates", async () => {
      assert.equal((await feedback.POST(request({ priorities: ["private@example.com"] }))).status, 400);
      const response = await feedback.POST(request({ priorities: ["accessibility", "accessibility", "private@example.com"] }));
      assert.equal(response.status, 201);
      assert.deepEqual((await response.json()).priorities, ["accessibility"]);
    });

    await t.test("invalid review fields never mutate persisted feedback", async () => {
      const before = await readFile(file, "utf8");
      for (const body of [null, [], { theme: "invalid" }, { stakeholder: "toString" }, { zone: 1 }, { sentiment: null }]) {
        const response = await review.PATCH(request(body, "PATCH"), { params: Promise.resolve({ id: initial[0].id }) });
        assert.equal(response.status, 400);
      }
      assert.equal(await readFile(file, "utf8"), before);
      const response = await review.PATCH(request({}, "PATCH"), { params: Promise.resolve({ id: initial[0].id }) });
      assert.equal(response.status, 200);
      assert.equal((await response.json()).reviewed, true);
    });

    await t.test("concurrent writes preserve every submission", async () => {
      await Promise.all(Array.from({ length: 15 }, (_, i) => store.addFeedback({ ...initial[0], id: `concurrent-${i}` })));
      const rows = await store.listFeedback();
      assert.equal(rows.filter((row) => row.id.startsWith("concurrent-")).length, 15);
    });

    await t.test("corrupt and incorrectly shaped files are preserved", async () => {
      for (const content of ["{broken", '{"unexpected":"object"}']) {
        await writeFile(file, content);
        await assert.rejects(store.listFeedback);
        await assert.rejects(() => store.addFeedback(initial[0]));
        assert.equal(await readFile(file, "utf8"), content);
      }
    });
  } finally {
    process.chdir(cwd);
    await rm(directory, { recursive: true, force: true });
  }
});
