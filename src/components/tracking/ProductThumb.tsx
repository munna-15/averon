"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./tracking.module.css";

interface ProductThumbProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}

/** Fills its sized parent; falls back to a monogram if the image is missing. */
export function ProductThumb({
  src,
  alt,
  className,
  sizes = "160px",
}: ProductThumbProps) {
  const [failed, setFailed] = useState(false);

  return (
    <span className={`${styles.thumb} ${className ?? ""}`}>
      {failed ? (
        <span className={styles.thumbFallback} aria-hidden="true">
          AV
        </span>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={styles.thumbImg}
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
