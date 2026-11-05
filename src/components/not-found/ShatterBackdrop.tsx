import type { CSSProperties } from "react";
import { desktopShards, mobileShards } from "./shatter-geometry";
import styles from "./not-found.module.css";

type Shards = typeof desktopShards | typeof mobileShards;

function ShardArt({ shards, variant }: { shards: Shards; variant: "desktop" | "mobile" }) {
  const origin: CSSProperties = { transformOrigin: shards.origin };

  return (
    <svg
      className={`${styles.art} ${variant === "desktop" ? styles.artDesktop : styles.artMobile}`}
      viewBox={shards.viewBox}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {/* hairline cracks continuing beyond the spike tips */}
      <g className={styles.cracks}>
        {shards.cracks.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      <g className={styles.core} style={origin}>
        <polygon points={shards.core} />
      </g>

      {shards.spikes.map((points, i) => (
        <g
          key={points}
          className={styles.spike}
          style={{ ...origin, ["--i" as string]: i } as CSSProperties}
        >
          <polygon points={points} />
        </g>
      ))}

      {/* cream fragments biting back into the dark rim */}
      <g className={styles.fragments}>
        {shards.fragments.map((points) => (
          <polygon key={points} points={points} />
        ))}
      </g>
    </svg>
  );
}

/**
 * Decorative shattered centerpiece. Two separately composed SVGs; CSS shows
 * exactly one per breakpoint, so mobile is a re-composition, not a scale-down.
 */
export function ShatterBackdrop() {
  return (
    <>
      <ShardArt shards={desktopShards} variant="desktop" />
      <ShardArt shards={mobileShards} variant="mobile" />
    </>
  );
}
