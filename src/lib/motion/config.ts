/** Shared motion constants. Safe to import from server or client code. */
export const MOTION = {
  duration: { fast: 0.3, base: 0.7, slow: 1.1 },
  ease: { standard: "power2.out", emphasized: "power3.inOut" },
  stagger: { tight: 0.06, base: 0.12 },
} as const;

/**
 * Media queries for gsap.matchMedia(). Every scroll or entrance animation
 * should live under `allowed`, with a static or minimal fallback under
 * `reduced`.
 */
export const MOTION_QUERIES = {
  allowed: "(prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 64rem)",
  mobile: "(max-width: 63.99rem)",
} as const;
