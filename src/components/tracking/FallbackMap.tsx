import { useMemo } from "react";
import { MAP_PALETTE } from "@/features/tracking/map-style";
import { locateOnRoute } from "@/features/tracking/route";
import type { TrackingShipment } from "@/features/tracking/types";
import styles from "./tracking.module.css";

const V = [70, 190, 310, 450, 590, 700, 830, 930];
const H = [80, 170, 280, 390, 480, 590, 650];
const LNG_SCALE = 0.915;

/** Static illustrative map in the same palette, used when the tile provider is unavailable. */
export function FallbackMap({
  shipment,
}: {
  shipment: TrackingShipment | null;
}) {
  const geo = useMemo(() => {
    if (!shipment) return null;
    const pts = shipment.route.map(
      ([lng, lat]) => [lng * LNG_SCALE, -lat] as const,
    );
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const scale = Math.min(520 / (maxX - minX || 1), 250 / (maxY - minY || 1));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const project = ([lng, lat]: readonly [number, number]) => {
      const x = 500 + (lng * LNG_SCALE - cx) * scale;
      const y = 280 + (-lat - cy) * scale;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    };
    const pos = locateOnRoute(shipment.route, shipment.progress);
    const parse = (p: string) => p.split(",").map(Number) as [number, number];
    return {
      done: pos.done.map(project).join(" "),
      remaining: pos.remaining.map(project).join(" "),
      origin: parse(project(shipment.route[0])),
      destination: parse(project(shipment.route[shipment.route.length - 1])),
      current: parse(project(pos.coordinates)),
      bearing: pos.bearing,
      showCurrent: shipment.progress < 1,
    };
  }, [shipment]);

  const blocks = [];
  for (let i = 0; i < V.length - 1; i += 1) {
    for (let j = 0; j < H.length - 1; j += 1) {
      if ((i * 5 + j * 3) % 4 === 0) {
        blocks.push(
          <rect
            key={`${i}-${j}`}
            x={V[i] + 8}
            y={H[j] + 8}
            width={V[i + 1] - V[i] - 16}
            height={H[j + 1] - H[j] - 16}
            rx={6}
            fill={(i + j) % 5 === 0 ? MAP_PALETTE.park : MAP_PALETTE.block}
          />,
        );
      }
    }
  }

  return (
    <svg
      viewBox="0 0 1000 700"
      preserveAspectRatio="xMidYMid slice"
      className={styles.fallbackSvg}
      role="img"
      aria-label="Illustrative route map"
    >
      <rect width="1000" height="700" fill={MAP_PALETTE.land} />
      {blocks}
      {H.map((y, i) => (
        <line
          key={`h${y}`}
          x1="0"
          x2="1000"
          y1={y}
          y2={y}
          stroke="#fff"
          strokeWidth={i % 3 === 0 ? 12 : 6}
        />
      ))}
      {V.map((x, i) => (
        <line
          key={`v${x}`}
          x1={x}
          x2={x}
          y1="0"
          y2="700"
          stroke="#fff"
          strokeWidth={i % 3 === 0 ? 12 : 6}
        />
      ))}
      <path d="M0 560 L1000 220" stroke="#fff" strokeWidth="9" />

      {geo ? (
        <g>
          <polyline
            points={geo.remaining}
            fill="none"
            stroke={MAP_PALETTE.routeRemaining}
            strokeWidth="7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <polyline
            points={geo.done}
            fill="none"
            stroke={MAP_PALETTE.routeDone}
            strokeWidth="7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle
            cx={geo.origin[0]}
            cy={geo.origin[1]}
            r="9"
            fill="#fff"
            stroke="#292823"
            strokeWidth="4"
          />
          <circle
            cx={geo.destination[0]}
            cy={geo.destination[1]}
            r="26"
            fill="#F26B4A"
            opacity="0.22"
          />
          <circle
            cx={geo.destination[0]}
            cy={geo.destination[1]}
            r="16"
            fill="#F26B4A"
          />
          <circle
            cx={geo.destination[0]}
            cy={geo.destination[1]}
            r="6"
            fill="#fff"
          />
          {geo.showCurrent ? (
            <g transform={`translate(${geo.current[0]} ${geo.current[1]})`}>
              <circle r="24" fill="#141413" />
              <polygon
                points="0,-10 9,10 0,5 -9,10"
                fill="#fff"
                transform={`rotate(${geo.bearing.toFixed(0)})`}
              />
            </g>
          ) : null}
        </g>
      ) : null}
    </svg>
  );
}
