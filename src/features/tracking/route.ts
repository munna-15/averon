import type { LngLat } from "./types";

/** cos(23.8°) — keeps distances roughly proportional at Dhaka's latitude. */
const LNG_SCALE = 0.915;

export type LineFeature = {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: { type: "LineString"; coordinates: LngLat[] };
};

export function toLine(coordinates: LngLat[]): LineFeature {
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates },
  };
}

/** Builds an illustrative stepped route (right-angle city-street look). */
export function elbowRoute(a: LngLat, b: LngLat): LngLat[] {
  const [x1, y1] = a;
  const [x2, y2] = b;
  const dx = x2 - x1;
  const dy = y2 - y1;
  return [
    a,
    [x1, y1 + dy * 0.28],
    [x1 + dx * 0.4, y1 + dy * 0.28],
    [x1 + dx * 0.4, y1 + dy * 0.66],
    [x2, y1 + dy * 0.66],
    b,
  ];
}

function segmentLength(a: LngLat, b: LngLat) {
  return Math.hypot((b[0] - a[0]) * LNG_SCALE, b[1] - a[1]);
}

export interface RoutePosition {
  coordinates: LngLat;
  bearing: number;
  done: LngLat[];
  remaining: LngLat[];
}

export function locateOnRoute(
  route: LngLat[],
  progress: number,
): RoutePosition {
  const t = Math.min(1, Math.max(0, progress));
  const lengths = route
    .slice(1)
    .map((point, i) => segmentLength(route[i], point));
  const total = lengths.reduce((sum, l) => sum + l, 0);

  let target = total * t;
  let i = 0;
  while (i < lengths.length - 1 && target > lengths[i]) {
    target -= lengths[i];
    i += 1;
  }

  const a = route[i];
  const b = route[i + 1];
  const f = lengths[i] === 0 ? 0 : Math.min(1, target / lengths[i]);
  const coordinates: LngLat = [
    a[0] + (b[0] - a[0]) * f,
    a[1] + (b[1] - a[1]) * f,
  ];
  const bearing =
    (Math.atan2((b[0] - a[0]) * LNG_SCALE, b[1] - a[1]) * 180) / Math.PI;

  return {
    coordinates,
    bearing,
    done: [...route.slice(0, i + 1), coordinates],
    remaining: [coordinates, ...route.slice(i + 1)],
  };
}

export function routeBounds(route: LngLat[]): [LngLat, LngLat] {
  const lngs = route.map((p) => p[0]);
  const lats = route.map((p) => p[1]);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}
