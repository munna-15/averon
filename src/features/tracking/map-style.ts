import type { Map as MapLibreMap } from "maplibre-gl";

export const MAP_PALETTE = {
  land: "#EDEDEB",
  landuse: "#EAEAE7",
  block: "#E4E4E1",
  park: "#E3E6E1",
  water: "#DEE1E2",
  road: "#FFFFFF",
  roadCasing: "#E1E1DE",
  routeDone: "#292823",
  routeRemaining: "#8C8B87",
} as const;

const STYLE_ID = process.env.NEXT_PUBLIC_MAPTILER_STYLE ?? "streets-v2-light";

export function getMapStyleUrl(key: string) {
  return `https://api.maptiler.com/maps/${STYLE_ID}/style.json?key=${key}`;
}

const HIDE_LINES =
  /boundary|admin|ferry|aeroway|rail|transit|contour|border|aerialway|ski/;
const ROAD_LINES =
  /road|street|motorway|trunk|primary|secondary|tertiary|bridge|tunnel|path|pedestrian|service|link|minor|major|highway|track/;
const PARK_FILLS =
  /park|wood|grass|forest|golf|cemetery|pitch|garden|wetland|scrub|sand|glacier|landcover|green/;

/**
 * Re-colours a loaded MapTiler style into the AVÉRON light-grey look:
 * hidden labels, white hairline roads, flat muted blocks.
 */
export function applyAveronMapTheme(map: MapLibreMap) {
  const layers = map.getStyle().layers ?? [];

  for (const layer of layers) {
    const sourceLayer = String(
      (layer as { "source-layer"?: string })["source-layer"] ?? "",
    ).toLowerCase();
    const tag = `${layer.id.toLowerCase()} ${sourceLayer}`;

    try {
      switch (layer.type) {
        case "symbol":
          map.setLayoutProperty(layer.id, "visibility", "none");
          break;

        case "background":
          map.setPaintProperty(layer.id, "background-color", MAP_PALETTE.land);
          break;

        case "fill": {
          let color: string = MAP_PALETTE.land;
          if (/water/.test(tag)) color = MAP_PALETTE.water;
          else if (/building/.test(tag)) color = MAP_PALETTE.block;
          else if (PARK_FILLS.test(tag)) color = MAP_PALETTE.park;
          else if (/landuse/.test(tag)) color = MAP_PALETTE.landuse;
          map.setPaintProperty(layer.id, "fill-color", color);
          map.setPaintProperty(layer.id, "fill-opacity", 1);
          break;
        }

        case "fill-extrusion":
          map.setPaintProperty(
            layer.id,
            "fill-extrusion-color",
            MAP_PALETTE.block,
          );
          map.setPaintProperty(layer.id, "fill-extrusion-opacity", 1);
          break;

        case "line": {
          if (HIDE_LINES.test(tag)) {
            map.setLayoutProperty(layer.id, "visibility", "none");
          } else if (/waterway|river|stream|canal/.test(tag)) {
            map.setPaintProperty(layer.id, "line-color", MAP_PALETTE.water);
          } else if (/casing|outline/.test(tag)) {
            map.setPaintProperty(
              layer.id,
              "line-color",
              MAP_PALETTE.roadCasing,
            );
          } else if (ROAD_LINES.test(tag)) {
            map.setPaintProperty(layer.id, "line-color", MAP_PALETTE.road);
            map.setPaintProperty(layer.id, "line-opacity", 1);
          } else {
            map.setLayoutProperty(layer.id, "visibility", "none");
          }
          break;
        }

        default:
          break;
      }
    } catch {
      // Some layers use property types that can't be overridden; skip them.
    }
  }
}
