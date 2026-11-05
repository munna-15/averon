import { cormorant, manrope } from "@/lib/fonts";

/**
 * Closest Google-Fonts matches to the reference's three typefaces:
 *  - display: very high-contrast Didone serif  → Bodoni Moda
 *  - wide:    extended black grotesque         → Archivo (width axis, 125%)
 *  - body:    humanist grotesque               → Work Sans
 * The reference's exact (commercial) display face has custom ligatures/swashes
 * that no free font reproduces – swap `display` for your licensed font if you
 * have it; only this file changes.
 */
// Reuse the site's existing locally generated font variables instead of
// fetching three additional Google font families during the production build.
export const displayFont = cormorant;
export const wideFont = manrope;
export const bodyFont = manrope;

export const averonFontVars = [displayFont.variable, wideFont.variable].join(" ");
