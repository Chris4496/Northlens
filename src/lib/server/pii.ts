const PATTERNS: [RegExp, string][] = [
  [/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]"],
  [/\b[A-Z]{1,2}\d{6}\s?\(?[0-9A]\)?/g, "[ID number]"],
  [/(\+?852[\s-]?)?\b[2-9]\d{3}[\s-]?\d{4}\b/g, "[phone]"],
  [/\b(flat|room|rm)\s*\w+,?\s*(\d+\/?f|floor\s*\d+)[^,.]*/gi, "[address]"],
  [/\b([Mm]y name is)\s+[A-Z][a-z]+(?:[\s-][A-Z][a-z]+){0,3}/g, "$1 [name]"],
  [/(我叫|我的名字是)[\u4e00-\u9fff]{2,3}/g, "$1[姓名]"],
  [/[\u4e00-\u9fff\d]+(座|室|樓)[\u4e00-\u9fff\d]*(室|樓)/g, "[地址]"],
];

export function redactPII(text: string): { text: string; redacted: boolean } {
  let out = text;
  for (const [re, rep] of PATTERNS) out = out.replace(re, rep);
  return { text: out, redacted: out !== text };
}
