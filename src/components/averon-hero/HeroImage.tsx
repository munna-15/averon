"use client";

import { useEffect, useRef, useState } from "react";
import s from "./averon-hero.module.css";
import { useCutout } from "./useCutout";

interface Props {
  /** Always comes from src/data/averon-hero-images.ts – never hardcode here. */
  src: string;
  alt: string;
  /** CSS object-position for the crop, e.g. "70% 30%" */
  pos?: string;
  /** Subject on white → transparent cut-out (slide 03). */
  cutout?: boolean;
}

/**
 * Plain <img> on purpose (not next/image): the file is replaced in /public by
 * the site owner, so there is nothing to optimise at build time and no stale
 * image-optimiser cache to fight. If the file is missing, a labelled
 * placeholder is rendered instead and the layout is unaffected.
 */
export function HeroImage({ src, alt, pos = "50% 50%", cutout = false }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const ref = useRef<HTMLImageElement>(null);
  const failed = failedSrc === src;
  const cut = useCutout(cutout && !failed ? src : null);

  useEffect(() => {
    // an error that fired before hydration never reaches React's onError
    const im = ref.current;
    if (im && im.complete && im.naturalWidth === 0) {
      const timeout = window.setTimeout(() => setFailedSrc(src), 0);
      return () => window.clearTimeout(timeout);
    }
  }, [src]);

  if (failed) {
    return (
      <div className={cutout ? s.fallbackCut : s.fallback} data-inner role="img" aria-label={alt}>
        <span>
          Add image
          <br />
          <b>{src}</b>
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={cut ?? src}
      alt={alt}
      draggable={false}
      onError={() => setFailedSrc(src)}
      className={cutout && !cut ? s.multiply : undefined}
      style={{ objectPosition: pos }}
      {...(cutout ? {} : { "data-inner": "" })}
    />
  );
}
