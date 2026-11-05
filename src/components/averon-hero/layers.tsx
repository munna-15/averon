import type { ReactNode } from "react";
import { averonHeroImages as IMG } from "../../data/averon-hero-images";
import s from "./averon-hero.module.css";
import { HeroImage } from "./HeroImage";
import { NEWSLETTER_PAN } from "./engine";
import type { Box, MotionSpec } from "./engine";

/* -------------------------------------------------------------------------- */
/*  Coordinates                                                               */
/*  Desktop: the reference was measured on a 1168 × 657 slide. `r()` converts */
/*  those pixel measurements to stage percentages.                            */
/*  Portrait: `m()` is a plain % box, designed on a 390 × 700 canvas (every   */
/*  scene re-composed for a tall, narrow stage: not a scaled desktop).        */
/* -------------------------------------------------------------------------- */
export const REF_W = 1168;
export const REF_H = 657;
/** Portrait design canvas aspect (390 × 700): used to cap type by stage height. */
export const PORTRAIT_DESIGN_ASPECT = 390 / 700;

const r = (x: number, y: number, w: number, h?: number): Box => [
  (x / REF_W) * 100,
  (y / REF_H) * 100,
  (w / REF_W) * 100,
  h === undefined ? undefined : (h / REF_H) * 100,
];
const m = (l: number, t: number, w: number, h?: number): Box => [l, t, w, h];
const centerOf = (b: Box): [number, number] => [
  b[0] + b[2] / 2,
  b[1] + (b[3] ?? 0) / 2,
];

export interface LayerDef extends MotionSpec {
  id: string;
  /** Stable paint order at rest. */
  stack: number;
  /** desktop / landscape box */
  d: Box;
  /** portrait box; `null` = hidden in portrait */
  m: Box | null;
  /** [desktop reference px, portrait cqw] */
  fs?: [number, number];
  cls?: string;
  node: ReactNode;
}

/* -------------------------------------------------------------------------- */
/*  Motion                                                                    */
/*  Flat 2D parallax: every layer shares one eased timeline and differs only  */
/*  in travel distance (stage widths) while entering (sIn) / exiting (sOut),  */
/*  MEASURED from the reference. Photos are the slowest layers; headlines     */
/*  and vertical text the fastest. The engine raises any distance that would  */
/*  leave a sliver on screen, and `group` makes related layers share one      */
/*  travel so their relative geometry never changes while they move.          */
/* -------------------------------------------------------------------------- */
type Kind = "shape" | "title" | "text" | "photo" | "fore";
const STACK: Record<Kind, number> = {
  shape: 0,
  photo: 10,
  fore: 20,
  title: 30,
  text: 40,
};

/** Default travel for pink shapes (not measured, kept from before). */
const SHAPE = { sIn: 1.0, sOut: 1.05 } as const;
const mv = (sIn: number, sOut: number) => ({ sIn, sOut });

/** T6 and the rewind are rigid pans, so Lookbook layers exit at the pan distance. */
const NL_OUT = NEWSLETTER_PAN;

const L = (
  slide: number,
  kind: Kind,
  id: string,
  d: Box,
  mb: Box | null,
  node: ReactNode,
  extra: Partial<LayerDef> = {},
): LayerDef => ({
  slide,
  id,
  stack: STACK[kind],
  d,
  m: mb,
  node,
  ...(kind === "shape" ? SHAPE : { sIn: 1.0, sOut: 1.0 }),
  ...extra,
});

/* ----------------------------- small building blocks ---------------------- */
const Arrow = ({ left = false }: { left?: boolean }) => (
  <span className={left ? s.arrowL : s.arrow} />
);

const Social = () => (
  <svg viewBox="0 0 200 200" className={s.badgeSvg} aria-hidden>
    <defs>
      <path
        id="avRing"
        d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0"
      />
    </defs>
    <text className={s.ringText}>
      <textPath href="#avRing" textLength="498" lengthAdjust="spacing">
        ★ FOLLOW US ON SOCIAL NETWORKS ★ FOLLOW US ON SOCIAL NETWORKS
      </textPath>
    </text>
    <path d="M91 70h18v21h21v18h-21v21H91v-21H70V91h21z" fill="currentColor" />
  </svg>
);

const SPECIAL = "THE LITTLE".split("");

/** Home of the carried Scene 2 circle: the centre of YOUR (Scene 3). */
const YOUR_D = r(293, 229, 90, 22);
const YOUR_M = m(7, 33, 30, 3);

/** Home of the carried Scene 5 circle: the gap between the Scene 6 photos. */
const GAP_D: [number, number] = [(336 / REF_W) * 100, (385 / REF_H) * 100];
const GAP_M: [number, number] = [48, 44.5];

/* -------------------------------------------------------------------------- */
/*  THE LAYER TABLE — DOM order == stacking order at rest                      */
/* -------------------------------------------------------------------------- */
export const LAYERS: LayerDef[] = [
  /* ============================ 01  AVERON ============================== */
  L(
    0,
    "photo",
    "s1-photo",
    r(0, 0, 733, 657),
    m(0, 0, 100, 58),
    <HeroImage
      src={IMG.slide01}
      alt="Model in profile, black and white"
      pos="62% 30%"
    />,
    { cls: s.photo, ...mv(1.0, 0.8) },
  ),
  L(
    0,
    "shape",
    "s1-circle",
    r(925, 318, 170),
    m(56, 64, 40),
    <i className={s.blush} />,
    { cls: s.round },
  ),
  L(
    0,
    "shape",
    "s1-bump-a",
    r(903, 433, 44),
    m(50, 77, 9),
    <i className={s.blush} />,
    { cls: s.round },
  ),
  L(
    0,
    "shape",
    "s1-bump-b",
    r(1068, 338, 22),
    m(91, 66.5, 5),
    <i className={s.blush} />,
    { cls: s.round },
  ),
  L(
    0,
    "text",
    "s1-little",
    r(576, 253, 467, 16),
    m(8, 60.5, 84, 2.6),
    <div className={s.spread}>
      {SPECIAL.map((c, i) => (
        <span key={i}>{c.trim()}</span>
      ))}
    </div>,
    { fs: [13, 3.1], cls: s.wide, ...mv(1.0, 1.24) },
  ),
  L(
    0,
    "title",
    "s1-vanity",
    r(558, 271, 520, 130),
    m(5, 63, 92, 13),
    <span className={s.display}>AVERON</span>,
    { fs: [120, 20.4], ...mv(1.0, 1.24) },
  ),
  L(
    0,
    "text",
    "s1-find",
    r(961, 396, 110, 18),
    m(10, 79, 40, 3),
    <span className={s.wide}>FIND YOURS</span>,
    { fs: [12.5, 3.2], group: "s1-find", ...mv(1.0, 1.09) },
  ),
  L(
    0,
    "text",
    "s1-find-arrow",
    r(1038, 418, 87, 8),
    m(44, 80.2, 46, 1),
    <Arrow />,
    { group: "s1-find", ...mv(1.0, 1.09) },
  ),
  L(
    0,
    "fore",
    "s1-badge",
    r(1056, 95, 70, 70),
    m(75, 48, 18),
    <div className={s.badge}>
      <span>
        SPECIAL
        <br />
        ISSUE
      </span>
    </div>,
    // Fades in place (opacity is driven in AveronHero); it does not travel.
    { cls: s.round, ...mv(1.0, 0) },
  ),
  L(
    0,
    "text",
    "s1-mouse",
    r(40, 598, 125, 24),
    null,
    <div className={s.mouse}>
      <svg viewBox="0 0 12 18" width="100%" height="100%" aria-hidden>
        <rect
          x="1"
          y="1"
          width="10"
          height="16"
          rx="5"
          fill="none"
          stroke="#fff"
          strokeWidth="1.2"
        />
        <rect x="5.4" y="4" width="1.2" height="3.5" rx=".6" fill="#fff" />
      </svg>
      <i />
    </div>,
    mv(1.0, 0.8),
  ),

  /* ============================ 02  EDITORIAL =========================== */
  L(
    1,
    "shape",
    "s2-rect",
    r(539, 329, 398, 194),
    m(24, 40, 60, 17),
    <i className={s.blush} />,
    { cls: s.rect },
  ),
  L(
    1,
    "shape",
    "s2-circle",
    r(1125, 158, 180),
    m(86, 18, 36),
    <i className={s.blush} />,
    {
      cls: s.round,
      // The ONE Scene 2 circle travels to the centre of YOUR (no duplicate).
      carry: {
        from: 1,
        to: 2,
        center: centerOf(YOUR_D),
        mCenter: centerOf(YOUR_M),
      },
    },
  ),
  L(
    1,
    "text",
    "s2-week-title",
    r(90, 251, 290, 44),
    m(8, 8, 84, 5),
    <>
      <i className={s.dash} />
      <span className={s.wide}>WEEK IN FASHION</span>
    </>,
    { fs: [22, 5.6], cls: s.weekHead, group: "s2-week", ...mv(1.13, 1.13) },
  ),
  L(
    1,
    "text",
    "s2-week-text",
    r(90, 302, 290, 56),
    m(8, 15, 84, 9),
    <p className={s.body}>
      Hae paginae proponent Musa adiuvante in lingua <br className={s.br} />
      Latina nunc etiam facta et ficta. non solum «arma <br className={s.br} />
      virumque» canunt, sed etiam «fullones ululamque».
    </p>,
    { fs: [12.4, 3.2], cls: s.paraA, group: "s2-week", ...mv(1.13, 1.13) },
  ),
  L(
    1,
    "photo",
    "s2-photo-small",
    r(92, 407, 303, 201),
    m(8, 66, 50, 20),
    <HeroImage
      src={IMG.slide02Secondary}
      alt="Model portrait, black and white"
      pos="70% 40%"
    />,
    { cls: s.photo, ...mv(1.01, 0.68) },
  ),
  L(
    1,
    "title",
    "s2-edit",
    r(608, 396, 78, 216),
    m(11, 35, 14, 26),
    <span className={s.vert}>EDIT</span>,
    { fs: [100, 14], cls: s.vertBox, group: "s2-edit", ...mv(1.29, 1.27) },
  ),
  L(
    1,
    "title",
    "s2-orial",
    r(696, 181, 78, 284),
    m(26, 27, 14, 26),
    <span className={s.vert}>ORIAL</span>,
    // Identical to EDIT: the reference moves them as one rigid group.
    { fs: [100, 14], cls: s.vertBox, group: "s2-edit", ...mv(1.29, 1.27) },
  ),
  L(
    1,
    "photo",
    "s2-photo-main",
    r(845, 154, 227, 337),
    m(52, 27, 42, 32),
    <HeroImage
      src={IMG.slide02Main}
      alt="Model with milkshake, black and white"
      pos="50% 25%"
    />,
    { cls: s.photo, ...mv(0.75, 0.89) },
  ),

  /* ====================== 03  UNLEASH YOUR SENSUALITY =================== */
  L(
    2,
    "shape",
    "s3-circle",
    r(1096, 139, 250),
    m(78, 15, 40),
    <i className={s.blush} />,
    { cls: s.round },
  ),
  L(
    2,
    "shape",
    "s3-bump",
    r(1070, 138, 54),
    m(66, 9, 9),
    <i className={s.blush} />,
    { cls: s.round },
  ),
  L(
    2,
    "title",
    "s3-unleash",
    r(366, 94, 450, 100),
    m(8, 13, 84, 9),
    <span className={s.display}>UNLEASH</span>,
    { fs: [99, 15], stack: 15, group: "s3-head", depth: 0, ...mv(1.07, 1.39) },
  ),
  L(
    2,
    "text",
    "s3-your",
    YOUR_D,
    YOUR_M,
    <span className={s.spacedLight}>YOUR</span>,
    { fs: [14, 3.4], group: "s3-head", depth: 1, ...mv(1.07, 1.39) },
  ),
  L(
    2,
    "title",
    "s3-sensuality",
    r(166, 285, 850, 150),
    m(3, 40, 96, 12),
    <span className={s.display}>SENSUALITY</span>,
    { fs: [135, 15], stack: 15, group: "s3-head", depth: 2, ...mv(1.07, 1.39) },
  ),
  L(
    2,
    "fore",
    "s3-figure",
    r(352, 118, 405, 540),
    m(16, 20, 74, 48),
    <HeroImage
      src={IMG.slide03}
      alt="Model crouching, cut out"
      cutout
      pos="50% 100%"
    />,
    { cls: s.cut, ...mv(1.46, 1.81) },
  ),
  L(
    2,
    "shape",
    "s3-ready-circle",
    r(174, 525, 84),
    m(2, 79, 18),
    <i className={s.blush} />,
    { cls: s.round },
  ),
  L(
    2,
    "text",
    "s3-tantra",
    r(85, 472, 260, 90),
    m(8, 70, 72, 9),
    <>
      <b className={s.body}>Tantra for beginners</b>
      <p className={s.body}>
        Ut nec ipsum sapien. Interdum et <br className={s.br} />
        malesuada fames ac ante ipsum primis in <br className={s.br} />
        faucibus. Integer id nisi nec nulla luctus.
      </p>
    </>,
    { fs: [12.4, 3.1], cls: s.paraB, ...mv(1.03, 1.23) },
  ),
  L(
    2,
    "text",
    "s3-ready",
    r(206, 556, 134, 40),
    m(8, 81, 44, 5),
    <>
      <span className={s.wide}>ARE YOU READY?</span>
      <Arrow />
    </>,
    { fs: [11.5, 3], cls: s.linkBlock, ...mv(1.03, 1.23) },
  ),

  /* ======================== 04  BE YOUR OWN MUSE ======================== */
  L(
    3,
    "shape",
    "s4-circle",
    r(157, 101, 328),
    m(0, 5, 64),
    <i className={s.blush} />,
    { cls: s.round },
  ),
  L(
    3,
    "shape",
    "s4-bump",
    r(158, 138, 58),
    m(1, 6, 11),
    <i className={s.blush} />,
    { cls: s.round },
  ),
  L(
    3,
    "photo",
    "s4-photo",
    r(129, 244, 216, 366),
    m(8, 35, 42, 38),
    <HeroImage
      src={IMG.slide04}
      alt="Model portrait, black and white"
      pos="50% 20%"
    />,
    { cls: s.photo, ...mv(0.7, 0.71) },
  ),
  L(
    3,
    "title",
    "s4-be",
    r(246, 140, 400, 90),
    m(8, 10, 84, 10),
    <span className={s.display}>BE YOUR</span>,
    { fs: [88, 15.5], group: "s4-head", depth: 0, ...mv(0.96, 1.27) },
  ),
  L(
    3,
    "title",
    "s4-own",
    r(302, 210, 260, 90),
    m(22, 17.5, 60, 10),
    <span className={s.display}>OWN</span>,
    { fs: [88, 15.5], group: "s4-head", depth: 1, ...mv(0.96, 1.27) },
  ),
  L(
    3,
    "title",
    "s4-muse",
    r(366, 282, 270, 90),
    m(38, 25, 56, 10),
    <span className={s.display}>MUSE</span>,
    { fs: [88, 15.5], group: "s4-head", depth: 2, ...mv(0.96, 1.27) },
  ),
  L(
    3,
    "text",
    "s4-bold",
    r(433, 402, 270, 96),
    m(54, 38, 40, 22),
    <p className={s.body}>
      Maecenas tincidunt, velit ac porttitor <br className={s.br} />
      pulvinar, tortor eros facilisis libero, <br className={s.br} />
      vitae commodo nunc quam et ligula <br className={s.br} />
      ut nec ipsum sapien.
    </p>,
    { fs: [14.2, 3.5], cls: s.paraBold, ...mv(0.7, 0.91) },
  ),
  L(
    3,
    "text",
    "s4-para",
    r(757, 402, 262, 100),
    null,
    <p className={s.body}>
      Anean eu enim justo. Vestibulum aliquam <br className={s.br} />
      hendrerit molestie. Mauris malesuada nisi sit <br className={s.br} />
      amet augue accumsan tincidunt. Maecenas <br className={s.br} />
      tincidunt, velit ac porttitor pulvinar, tortor <br className={s.br} />
      eros facilisis libero, <u>vitae commodo</u>.
    </p>,
    { fs: [12.4, 3.1], cls: s.paraA, ...mv(0.7, 0.91) },
  ),
  L(
    3,
    "fore",
    "s4-badge",
    r(934, 142, 190),
    m(60, 62, 32),
    <div className={s.social}>
      <Social />
    </div>,
    // Moves ≈0.87 W in T4 and is still visible at the left edge at the S5 hold,
    // then leaves in T5 (`persist`). On a narrow stage it only peeks.
    { cls: s.round, persist: 0.3, mm: { sOut: 0.85 }, ...mv(0.87, 0.87) },
  ),

  /* ===================== 05  DON'T HIDE YOURSELF ======================== */
  L(
    4,
    "shape",
    "s5-rect",
    r(133, 101, 463, 129),
    m(6, 9, 66, 12),
    <i className={s.blush} />,
    { cls: s.rect, ...mv(1.0, 1.0) },
  ),
  L(
    4,
    "shape",
    "s5-circle",
    r(880, 403, 80),
    m(34, 76, 16),
    <i className={s.blush} />,
    { cls: s.round, ...mv(1.0, 1.0) },
  ),
  L(
    4,
    "shape",
    "s5-circle-big",
    r(1073, 262, 340),
    m(76, 25, 58),
    <i className={s.blush} />,
    {
      cls: s.round,
      // The ONE big circle travels into the gap between the Scene 6 photos.
      carry: { from: 4, to: 5, center: GAP_D, mCenter: GAP_M },
      ...mv(1.0, 1.0),
    },
  ),
  L(
    4,
    "photo",
    "s5-photo",
    r(236, 156, 304, 452),
    m(10, 10, 48, 40),
    <HeroImage
      src={IMG.slide05}
      alt="Model behind translucent veil"
      pos="50% 30%"
    />,
    { cls: s.photo, ...mv(0.74, 0.68) },
  ),
  L(
    4,
    "title",
    "s5-dont",
    r(512, 340, 70, 256),
    m(61, 34, 11, 20),
    <span className={s.vert}>DON’T</span>,
    {
      fs: [88, 11],
      cls: s.vertBox,
      group: "s5-vert",
      depth: 0,
      ...mv(1.64, 1.44),
    },
  ),
  L(
    4,
    "title",
    "s5-hide",
    r(592, 402, 70, 196),
    m(72, 39, 11, 15),
    <span className={s.vert}>HIDE</span>,
    {
      fs: [88, 11],
      cls: s.vertBox,
      group: "s5-vert",
      depth: 1,
      ...mv(1.64, 1.44),
    },
  ),
  L(
    4,
    "title",
    "s5-yourself",
    r(666, 168, 70, 428),
    m(83, 23, 11, 31),
    <span className={s.vert}>YOURSELF</span>,
    {
      fs: [88, 11],
      cls: s.vertBox,
      group: "s5-vert",
      depth: 2,
      ...mv(1.64, 1.44),
    },
  ),
  L(
    4,
    "text",
    "s5-text",
    r(780, 280, 262, 180),
    m(8, 58, 84, 18),
    <>
      <b className={s.body}>Get self confident</b>
      <p className={s.body}>
        Sit amet, consectetur adipiscing elit. <br className={s.br} />
        Maecenas varius tortor nibh, sit amet <br className={s.br} />
        <u className={s.strong}>tempor</u> nibh finibus et.
      </p>
      <p className={s.body}>
        Aenean eu enim justo. Vestibulum aliquam <br className={s.br} />
        hendrerit molestie. Mauris malesuada nisi <br className={s.br} />
        sit amet augue accumsan tincidunt.
      </p>
    </>,
    { fs: [12.4, 3], cls: s.paraB, ...mv(1.31, 1.19) },
  ),
  L(
    4,
    "text",
    "s5-more",
    r(921, 430, 116, 34),
    m(8, 79, 44, 5),
    <>
      <span className={s.wide}>LEARN MORE</span>
      <Arrow />
    </>,
    { fs: [11.5, 3], cls: s.linkBlock, ...mv(1.31, 1.19) },
  ),

  /* ======================= 06  THE LOOKBOOK ============================= */
  /* sOut = NL_OUT everywhere: T6 is a rigid pan for the whole group.         */
  /* Photos A and B form ONE group: they enter with the same travel, so their */
  /* overlap never changes while they move (forward or backward).             */
  L(
    5,
    "photo",
    "s6-photo-a",
    r(104, 265, 269, 198),
    m(6, 27, 52, 22),
    <HeroImage
      src={IMG.slide06First}
      alt="Model in profile, dark background"
      pos="50% 30%"
    />,
    { cls: s.photo, stack: 10, group: "s6-photos", ...mv(0.74, NL_OUT) },
  ),
  L(
    5,
    "photo",
    "s6-photo-b",
    r(335, 352, 352, 258),
    m(40, 41, 54, 22),
    <HeroImage
      src={IMG.slide06Second}
      alt="Model lying down, black and white"
      pos="50% 40%"
    />,
    { cls: s.photo, stack: 11, group: "s6-photos", ...mv(0.74, NL_OUT) },
  ),
  L(
    5,
    "title",
    "s6-title-1",
    r(98, 134, 700, 100),
    m(5, 8, 92, 8),
    <span className={s.display}>THE LOOKBOOK</span>,
    { fs: [88, 11.2], ...mv(0.92, NL_OUT) },
  ),
  L(
    5,
    "title",
    "s6-title-2",
    r(400, 208, 560, 100),
    m(18, 14.5, 78, 8),
    <span className={s.display}>
      SEASON <span className={s.strike}>020</span>
    </span>,
    { fs: [88, 11.2], ...mv(0.67, NL_OUT) },
  ),
  L(
    5,
    "shape",
    "s6-circle-s",
    r(891, 416, 85),
    m(4, 77, 14),
    <i className={s.blush} />,
    { cls: s.round, ...mv(1.0, NL_OUT) },
  ),
  L(
    5,
    "text",
    "s6-text",
    r(787, 348, 225, 100),
    m(8, 66, 84, 10),
    <>
      <b className={s.body}>
        Some of the best suggestions <br className={s.br} />
        from the last collections
      </b>
      <p className={s.body}>
        Integer id nisi nec nulla luctus lacinia <br className={s.br} />
        non eu turpis. Etiam in ex imperdiet <br className={s.br} />
        justo tincidunt egestas.
      </p>
    </>,
    { fs: [12.6, 3.1], cls: s.paraC, ...mv(1.0, NL_OUT) },
  ),
  L(
    5,
    "text",
    "s6-check",
    r(924, 446, 112, 36),
    m(8, 79, 44, 5),
    <>
      <span className={s.wide}>CHECK THIS</span>
      <Arrow />
    </>,
    { fs: [11.5, 3], cls: s.linkBlock, ...mv(1.0, NL_OUT) },
  ),

  /* ========================= 07  NEWSLETTER ============================= */
  /* Part of the same rigid strip as slide 06 (see solveLayer in engine.ts).  */
  /* The panel spans the FULL hero height (top 0 → bottom 100 %). Content     */
  /* layers have auto height so they size to their own text and never clip.   */
  L(
    6,
    "shape",
    "nl-panel",
    r(650, 0, 518, 657),
    m(0, 0, 100, 100),
    <i className={s.panel} />,
    { cls: s.rect, ...mv(1.0, 1.0) },
  ),
  L(
    6,
    "text",
    "nl-rewind",
    r(938, 219, 92),
    m(58, 9, 36),
    <button type="button" data-rewind className={s.rewind}>
      <span className={s.wide}>REWIND</span>
      <Arrow left />
    </button>,
    { fs: [11.5, 3] },
  ),
  L(
    6,
    "title",
    "nl-heading",
    r(696, 443, 260),
    m(8, 52, 84),
    <>
      <i className={s.dashDark} />
      <span className={s.wide}>
        SUBSCRIBE
        <br />
        NEWSLETTER
      </span>
    </>,
    { fs: [23, 6.6], cls: s.nlHead },
  ),
  L(
    6,
    "text",
    "nl-form",
    r(696, 521, 440),
    m(8, 64, 84),
    <form onSubmit={(e) => e.preventDefault()} className={s.nlForm}>
      <label htmlFor="av-email" className={s.body}>
        Insert your email
      </label>
      <div>
        <input
          id="av-email"
          type="email"
          autoComplete="email"
          className={s.body}
        />
        <button type="submit" className={s.wide}>
          SEND
        </button>
      </div>
    </form>,
    { fs: [11.5, 3] },
  ),
  L(
    6,
    "text",
    "nl-foot",
    r(696, 625, 420),
    m(8, 92, 84),
    <span className={s.body}>
      © 2020 AVERON production. All rights reserved.
    </span>,
    { fs: [10.5, 2.7] },
  ),
];

export const SLIDE_COUNT = 6;
