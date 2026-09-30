"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import { KTN_CENTER, PLACES, type Place } from "@/lib/kb/places";
import type { Lang } from "@/lib/types";
import { KIND_COLOR, labelUrl, TILE_ATTR, TILE_URL } from "./map-style";

function FitTo({ places }: { places: Place[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = places.flatMap((p) => (p.point ? [p.point] : (p.line ?? [])));
    if (pts.length === 0) {
      map.flyTo(KTN_CENTER, 14, { duration: 0.8 });
      return;
    }
    const b = L.latLngBounds(pts);
    map.flyToBounds(b.pad(0.35), { maxZoom: 15, duration: 0.9 });
  }, [map, places]);
  return null;
}

export default function PlanMap({
  highlight,
  focus,
  lang,
}: {
  highlight: string[];
  focus?: string[];
  lang: Lang;
}) {
  const hi = new Set(highlight);
  const fo = new Set(focus ?? []);
  const anyHi = hi.size > 0;
  const targets = PLACES.filter((p) => (fo.size ? fo.has(p.id) : hi.has(p.id)));

  return (
    <MapContainer
      center={KTN_CENTER}
      zoom={14}
      scrollWheelZoom={false}
      className="h-full w-full"
      attributionControl
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTR} maxZoom={19} />
      <TileLayer key={lang} url={labelUrl(lang)} maxZoom={19} />
      <FitTo places={targets} />

      {PLACES.filter((p) => p.line).map((p) => {
        const on = hi.has(p.id) || fo.has(p.id);
        return (
          <Polyline
            key={`${p.id}-${on}`}
            positions={p.line!}
            pathOptions={{
              color: p.id === "nol-main" ? "#d2462a" : "#13203a",
              weight: on ? 5 : 3,
              opacity: anyHi && !on ? 0.35 : 0.9,
              dashArray: p.dashed ? "8 7" : undefined,
            }}
          >
            <Tooltip sticky>{lang === "zh" ? p.nameZh : p.name}</Tooltip>
          </Polyline>
        );
      })}

      {PLACES.filter((p) => p.point).map((p) => {
        const on = hi.has(p.id);
        const focused = fo.has(p.id);
        return (
          <CircleMarker
            key={`${p.id}-${on}-${focused}`}
            center={p.point!}
            radius={focused ? 13 : on ? 10 : 6}
            pathOptions={{
              color: "#13203a",
              weight: focused ? 3 : on ? 2 : 1,
              fillColor: KIND_COLOR[p.kind],
              fillOpacity: anyHi && !on && !focused ? 0.3 : 0.9,
              opacity: anyHi && !on && !focused ? 0.4 : 1,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} permanent={focused}>
              {lang === "zh" ? p.nameZh : p.name}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}