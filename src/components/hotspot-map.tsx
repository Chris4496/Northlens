"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import type { Insights } from "@/lib/insights";
import { THEME_LABEL } from "@/lib/i18n";
import { KTN_CENTER, ZONES } from "@/lib/kb/places";
import type { Lang } from "@/lib/types";
import { labelUrl, TILE_ATTR, TILE_URL } from "./map-style";

function mix(share: number) {
  // wetland (low concern) → vermilion (high concern)
  const a = [44, 122, 104];
  const b = [210, 70, 42];
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * share));
  return `rgb(${c.join(",")})`;
}

export default function HotspotMap({ zones, lang }: { zones: Insights["byZone"]; lang: Lang }) {
  const max = Math.max(...zones.map((z) => z.count), 1);
  return (
    <MapContainer center={KTN_CENTER} zoom={15} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer url={TILE_URL} attribution={TILE_ATTR} maxZoom={19} />
      <TileLayer key={lang} url={labelUrl(lang)} maxZoom={19} />
      {zones.map((z) => {
        const zone = ZONES[z.zone];
        return (
          <CircleMarker
            key={`${z.zone}-${z.count}`}
            center={zone.point}
            radius={10 + 26 * Math.sqrt(z.count / max)}
            pathOptions={{ color: "#13203a", weight: 1.5, fillColor: mix(z.concernShare), fillOpacity: 0.55 }}
          >
            <Tooltip direction="top" permanent={z.count === max}>
              <strong>{zone[lang]}</strong> · {z.count}
              <br />
              {lang === "zh" ? "主要議題：" : "Top theme: "}
              {THEME_LABEL[z.topTheme][lang]}
              <br />
              {Math.round(z.concernShare * 100)}% {lang === "zh" ? "表達關注" : "express concern"}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
