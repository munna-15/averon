"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MOTION } from "./config";

// Register once, in the browser only. Registration is idempotent, so importing
// this module from many client components is safe.
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
  gsap.defaults({
    ease: MOTION.ease.standard,
    duration: MOTION.duration.base,
  });
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, useGSAP };
