/**
 * AVERON HERO — CENTRAL IMAGE CONFIGURATION
 * ---------------------------------------------------------------------------
 * This is the ONLY place in the project where the hero's image paths live.
 * Nothing in the component, the layer table or the animation code contains a
 * hardcoded image path.
 *
 * To change a picture: overwrite the file in `public/images/campaigns/` using
 * the SAME filename. No code change is needed (hard-refresh to bypass the
 * browser cache).
 *
 * Where each file appears in the reference composition:
 *
 *   model-01.jpg  slide 01 "The Little Vanity"  – full-height portrait, left 63%
 *                 (landscape or portrait both work; it is cropped with cover)
 *   model-02.jpg  slide 02 "Editorial"          – tall portrait, upper right
 *                 (aspect ≈ 2 : 3, e.g. 1200×1800)
 *   model-03.jpg  slide 02 "Week in fashion"    – small landscape photo, lower left
 *                 (aspect ≈ 3 : 2, e.g. 1500×1000)
 *   model-04.jpg  slide 03 "Unleash your sensuality" – the model that stands IN FRONT
 *                 of the headline. Use a figure on a plain WHITE background
 *                 (aspect ≈ 3 : 4). The hero cuts the white away automatically
 *                 at runtime. A real transparent PNG also works – then change
 *                 this one line to the .png filename.
 *   model-05.png  slide 04 "Be your own muse"   – tall portrait (aspect ≈ 3 : 5)
 *   model-06.png  slide 05 "Don't hide yourself"– portrait (aspect ≈ 2 : 3),
 *                 the reference is soft/blurred and very light
 *   model-07.png  slide 06 "The Lookbook"       – small dark landscape photo (≈ 4 : 3)
 *   model-08.jpg  slide 06 "The Lookbook"       – larger landscape photo (≈ 4 : 3)
 *
 *   model-09.jpg  RESERVED – the reference newsletter screen contains no photo,
 *   model-10.jpg  RESERVED   so these two are declared (so the full set of 10
 *                 paths lives here) but are NOT rendered. See `reserved` below.
 */
export const averonHeroImages = {
  slide01: "/images/campaigns/model-01.jpg",
  slide02Main: "/images/campaigns/model-02.jpg",
  slide02Secondary: "/images/campaigns/model-03.jpg",
  slide03: "/images/campaigns/model-07.png",
  slide04: "/images/campaigns/model-11.jpg",
  slide05: "/images/campaigns/model-06.png",
  slide06First: "/images/campaigns/model-04.jpg",
  slide06Second: "/images/campaigns/model-08.jpg",
  newsletter: "/images/campaigns/model-09.jpg",
  extra: "/images/campaigns/model-10.jpg",
} as const;

export type AveronHeroImageKey = keyof typeof averonHeroImages;

/** Keys that exist in the config but are intentionally not drawn (not in the reference). */
export const averonHeroReservedImages: readonly AveronHeroImageKey[] = [
  "newsletter",
  "extra",
] as const;
