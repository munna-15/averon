/**
 * AVERON — Our Story: editable content.
 * Every image path and every line of copy lives here, so you can restyle or
 * rewrite the page without touching the animation code.
 *
 * IMAGES: the files below are neutral SVG placeholders. Drop your real
 * photography into /public/images/story/ and change the paths here
 * (e.g. "/images/story/hero-portrait.jpg"). Any extension works.
 * Recommended: portraits 4:5 (min 1600×2000), landscapes 3:2 (min 2000×1333).
 *
 * COPY: all text marked [Placeholder] is intentionally generic. No brand
 * history, founders, materials or sustainability claims have been invented.
 */

export const SHOP_HREF = "/shop"; // where the closing call-to-action goes



export const IMG = {
  hero: "/images/story/story-12.jpg",
  beginningTall: "/images/story/story-02.jpg",
  beginningSmall: "/images/story/story-03.jpg",
  vision: "/images/story/story-16.jpg",
  craftA: "/images/story/story-05.jpg",
  craftB: "/images/story/story-04.jpg",
  identityA: "/images/story/story-13.jpg",
  identityB: "/images/story/story-08.jpg",
  identityC: "/images/story/story-09.jpg",
  closing: "/images/story/story-10.jpg",
} as const;

export const CHAPTERS = [
  "Opening",
  "Beginning",
  "Vision",
  "Craft",
  "Identity",
  "Closing",
] as const;

export const COPY = {
  opening: {
    eyebrow: "The House of",
    title: "AVERON",
    cta: "Begin the story",
    seal: ["Our", "Story"],
    alt: "AVERON editorial portrait, black and white",
  },
  beginning: {
    label: "Chapter 01 — Our Beginning",
    word: "Beginning",
    body: "[Placeholder] Tell the story of how AVERON began: the idea, the first piece, the question it set out to answer. Replace this paragraph with your own words.",
    altTall: "AVERON editorial portrait, tall crop",
    altSmall: "AVERON editorial detail, landscape crop",
  },
  vision: {
    label: "Chapter 02 — Our Vision",
    lines: ["Be seen", "in quiet", "light"],
    body: "[Placeholder] Describe what AVERON stands for: the kind of wardrobe, the kind of person, and the feeling a piece should leave behind.",
    badge: "AVERON ✦ OUR STORY ✦ AVERON ✦ OUR STORY ✦ ",
    alt: "AVERON editorial portrait, vision",
  },
  craft: {
    label: "Chapter 03 — Craftsmanship",
    lines: ["The craft", "& the detail"],
    items: [
      {
        k: "Material",
        v: "[Placeholder] Name the fabrics and where they come from.",
      },
      {
        k: "Cut",
        v: "[Placeholder] Describe the silhouette and how it is made.",
      },
      {
        k: "Finish",
        v: "[Placeholder] The small details a customer notices last.",
      },
    ],
    bridge: "Next — Our Identity",
    altA: "AVERON craft detail, dark crop",
    altB: "AVERON craft detail, light crop",
  },
  identity: {
    label: "Chapter 04 — Our Identity",
    ghost: "AVERON",
    lines: ["Quiet by design.", "Unmistakable by instinct."],
    altA: "AVERON identity portrait, left",
    altB: "AVERON identity portrait, centre",
    altC: "AVERON identity portrait, right",
  },
  closing: {
    label: "Chapter 05 — Continue",
    lines: ["Enter", "the collection"],
    body: "Step from the story into the season.",
    cta: "Shop AVERON",
    footer: "© AVERON. All rights reserved.",
    top: "Back to top",
    alt: "AVERON closing editorial portrait",
  },
};
