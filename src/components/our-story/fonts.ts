import { Bodoni_Moda, Archivo } from "next/font/google";

/**
 * Display face: a high-contrast didone, matching the reference's
 * Didot/Bodoni-style headlines. Swap for AVERON's own display font
 * (keep the `variable` name so the CSS keeps working).
 */
export const display = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-story-display",
  style: ["normal", "italic"],
  display: "swap",
});

/**
 * Supporting face: a heavy grotesque for numerals, labels, nav and body.
 */
export const sans = Archivo({
  subsets: ["latin"],
  variable: "--font-story-sans",
  weight: ["400", "500", "700", "800"],
  display: "swap",
});
