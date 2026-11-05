"use client";

import { useEffect, useState } from "react";

/**
 * Turns a photo shot on a plain white background into a transparent cut-out,
 * at runtime, so the slide-03 model can stand IN FRONT of the headline while
 * the source file stays a normal .jpg that you can replace at any time.
 *
 * Flood-fills from the image border through near-white pixels, so white areas
 * INSIDE the subject (shirt, highlights) are kept. Returns an object URL, or
 * `null` while processing / on any failure (callers fall back to the original
 * image with `mix-blend-mode: multiply`).
 */
const MAX = 1400;
const WHITE = 238;

export function useCutout(src: string | null): string | null {
  const [result, setResult] = useState<{ source: string; url: string } | null>(null);

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    let made: string | null = null;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      try {
        const k = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * k));
        const h = Math.max(1, Math.round(img.naturalHeight * k));
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h);
        const px = data.data;
        const bg = new Uint8Array(w * h);
        const isWhite = (i: number) =>
          px[i * 4] >= WHITE && px[i * 4 + 1] >= WHITE && px[i * 4 + 2] >= WHITE;

        const stack: number[] = [];
        const push = (i: number) => {
          if (!bg[i] && isWhite(i)) {
            bg[i] = 1;
            stack.push(i);
          }
        };
        for (let x = 0; x < w; x++) {
          push(x);
          push((h - 1) * w + x);
        }
        for (let y = 0; y < h; y++) {
          push(y * w);
          push(y * w + w - 1);
        }
        while (stack.length) {
          const i = stack.pop() as number;
          const x = i % w;
          if (x > 0) push(i - 1);
          if (x < w - 1) push(i + 1);
          if (i >= w) push(i - w);
          if (i < w * (h - 1)) push(i + w);
        }
        // alpha + 1px soft edge
        for (let i = 0; i < w * h; i++) {
          if (bg[i]) {
            px[i * 4 + 3] = 0;
            continue;
          }
          const x = i % w;
          const edge =
            (x > 0 && bg[i - 1]) ||
            (x < w - 1 && bg[i + 1]) ||
            (i >= w && bg[i - w]) ||
            (i < w * (h - 1) && bg[i + w]);
          if (edge) {
            const lum = (px[i * 4] + px[i * 4 + 1] + px[i * 4 + 2]) / 3;
            px[i * 4 + 3] = Math.round(clampN((255 - lum) * 3.2, 90, 255));
          }
        }
        ctx.putImageData(data, 0, 0);
        c.toBlob((blob) => {
          if (!blob || cancelled) return;
          made = URL.createObjectURL(blob);
          setResult({ source: src, url: made });
        }, "image/png");
      } catch {
        /* keep fallback */
      }
    };
    img.onerror = () => undefined;
    img.src = src;
    return () => {
      cancelled = true;
      if (made) URL.revokeObjectURL(made);
    };
  }, [src]);

  return src && result?.source === src ? result.url : null;
}

const clampN = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
