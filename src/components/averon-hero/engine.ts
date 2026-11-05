/**
 * Pure motion maths for the AVERON hero. No DOM, no GSAP.
 *
 * Model: the hero has one continuous position `p` (0 … 6) driven by a single
 * eased tween.
 *  - T1–T5 (parallax): a layer of slide `i` has d = i − p and travels linearly
 *    in p at its own distance (sIn / sOut, in stage widths). All layers share
 *    ONE eased timeline; the only per-layer difference is travel distance (and,
 *    for three-line headings, the DEPTH table below).
 *  - T6 and the rewind (rigid pan): every layer sits on one strip and moves at
 *    the same speed (stripPos / stripSlide).
 * There is no perspective, yaw, pitch or scale: the experience is flat 2D.
 *
 * Scene isolation is decided in ONE place, solveLayer(): a layer is live only
 *  - inside its own slide window (|d| < 1),
 *  - while it is being carried between two homes (CarrySpec),
 *  - while it intentionally lingers after its slide (persist),
 *  - or as part of the rigid strip (Lookbook + Newsletter, and the rewind).
 */

export type Box = [l: number, t: number, w: number, h?: number];

export const TOTAL_STATES = 7; // 6 editorial slides + newsletter
export const LAST = TOTAL_STATES - 1;

/** Measured: Lookbook → Newsletter is a rigid pan of 0.446 stage widths. */
export const NEWSLETTER_PAN = 0.446;

/** Safety margin (stage widths) added to every off-screen travel guarantee. */
export const EDGE = 0.01;

export const clamp = (v: number, a: number, b: number) =>
  Math.min(b, Math.max(a, v));

/** CSS-style cubic-bezier(x1, y1, x2, y2) as a function of progress 0…1. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-6) return sampleY(t);
      const slope = slopeX(t);
      if (Math.abs(slope) < 1e-6) break;
      t -= err / slope;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    for (let i = 0; i < 24; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-6) break;
      if (err > 0) hi = t;
      else lo = t;
      t = (lo + hi) / 2;
    }
    return sampleY(t);
  };
}

/** Measured reference curve, shared by T1–T6 and the rewind. */
export const REF_EASE = cubicBezier(0.55, 0.02, 0.17, 1);

/* -------------------------------------------------------------------------- */
/*  Layered editorial typography depth (centralised, adjustable)              */
/* -------------------------------------------------------------------------- */

/** 0 = back line, 1 = middle line, 2 = front line of a three-line heading. */
export type DepthRank = 0 | 1 | 2;

export interface DepthSpec {
  /** Resting opacity: the back line is slightly recessed. */
  tone: number;
  /** Multiplier on the layer's parallax travel (front line moves a little more). */
  travel: number;
  /** Start delay, as a fraction of one slide of progress. Ends are unchanged. */
  delay: number;
  /** Extra opacity dip at mid-transition (0 at rest and when off-stage). */
  dip: number;
}

/**
 * The ONE place to tune (or switch off) the depth effect. It is a 2D illusion:
 * horizontal travel + opacity only. To disable: tone 1, travel 1, delay 0,
 * dip 0 for every rank.
 */
export const DEPTH: Record<DepthRank, DepthSpec> = {
  0: { tone: 0.9, travel: 0.96, delay: 0.04, dip: 0.1 },
  1: { tone: 0.95, travel: 1, delay: 0.02, dip: 0.06 },
  2: { tone: 1, travel: 1.04, delay: 0, dip: 0 },
};

/* -------------------------------------------------------------------------- */
/*  Layer motion description                                                  */
/* -------------------------------------------------------------------------- */

/** A layer that is carried from its own home on `from` to a new home on `to`. */
export interface CarrySpec {
  from: number;
  to: number;
  /** Centre of the new home, in stage % [x, y] (desktop / landscape). */
  center: [number, number];
  /** Centre of the new home, in stage % [x, y] (portrait). */
  mCenter?: [number, number];
}

export interface MotionSpec {
  slide: number;
  /** stage-widths travelled per slide while ENTERING */
  sIn: number;
  /** stage-widths travelled per slide while EXITING */
  sOut: number;
  /** portrait-only overrides of sIn / sOut */
  mm?: { sIn?: number; sOut?: number };
  /** layers of one group share the same (largest) travel, in and out */
  group?: string;
  /** three-line heading rank (see DEPTH) */
  depth?: DepthRank;
  /** declarative carry between two scenes (circles) */
  carry?: CarrySpec;
  /**
   * The layer stays alive this many slides' worth of distance AFTER its slide
   * (and is not forced fully off-stage at d = −1). Used by the Scene 4 badge.
   */
  persist?: number;
}

export interface Geometry {
  /** un-transformed left / top of the layer box, px, relative to the stage */
  left: number;
  top: number;
  /** un-transformed width of the layer including overflowing content, px */
  width: number;
}

export interface Travel {
  tIn: number;
  tOut: number;
}

export interface CarryDelta {
  dx: number;
  dy: number;
}

export const panFor = (portrait: boolean) => (portrait ? 1 : NEWSLETTER_PAN);

/* ---- rigid strip (T6 + rewind) ------------------------------------------ *
 * Slides 0…5 sit one stage width apart; the newsletter sits `pan` further
 * along than the Lookbook. Every layer is at x = (slideX − camera)·W.
 */
export const stripPos = (p: number, pan: number) =>
  p <= LAST - 1 ? p : LAST - 1 + pan * (p - (LAST - 1));

export const stripSlide = (slide: number, pan: number) =>
  slide >= LAST ? LAST - 1 + pan : slide;

/* ---- geometry helpers ---------------------------------------------------- */

const motionFor = (spec: MotionSpec, portrait: boolean) => {
  const o = portrait ? spec.mm : undefined;
  return { sIn: o?.sIn ?? spec.sIn, sOut: o?.sOut ?? spec.sOut };
};

/** Offset that moves a round carried layer from its own home to its new home. */
export function carryDelta(
  spec: MotionSpec,
  g: Geometry,
  W: number,
  H: number,
  portrait: boolean,
): CarryDelta {
  const c = spec.carry;
  if (!c) return { dx: 0, dy: 0 };
  const [cx, cy] = portrait && c.mCenter ? c.mCenter : c.center;
  // carried layers are circles (aspect-ratio 1): height === width
  return {
    dx: (cx / 100) * W - g.width / 2 - g.left,
    dy: (cy / 100) * H - g.width / 2 - g.top,
  };
}

/**
 * Effective parallax travel per layer (stage widths). The configured sIn / sOut
 * are used as-is whenever they already carry the layer fully off-stage;
 * otherwise they are raised to the minimum that does (accounting for the depth
 * travel multiplier). Layers of one group then share the largest value, so
 * their relative geometry (e.g. the Scene 6 photo overlap) never changes while
 * they move.
 */
export function computeTravel(
  specs: readonly MotionSpec[],
  geoms: readonly Geometry[],
  W: number,
  H: number,
  portrait: boolean,
): Travel[] {
  const w = Math.max(W, 1);
  const out: Travel[] = specs.map((spec, i) => {
    const g = geoms[i];
    const m = motionFor(spec, portrait);
    const f = spec.depth === undefined ? 1 : DEPTH[spec.depth].travel;
    const cd = carryDelta(spec, g, W, H, portrait);
    const needIn = (w - g.left) / w + EDGE;
    // a carried layer exits from its NEW home
    const needOut = (g.left + cd.dx + g.width) / w + EDGE;
    return {
      tIn: Math.max(m.sIn, needIn / f),
      tOut:
        spec.persist || m.sOut === 0 ? m.sOut : Math.max(m.sOut, needOut / f),
    };
  });

  const groups = new Map<string, number[]>();
  specs.forEach((spec, i) => {
    if (!spec.group) return;
    const list = groups.get(spec.group);
    if (list) list.push(i);
    else groups.set(spec.group, [i]);
  });
  groups.forEach((idx) => {
    const tIn = Math.max(...idx.map((i) => out[i].tIn));
    const tOut = Math.max(...idx.map((i) => out[i].tOut));
    idx.forEach((i) => {
      out[i] = { tIn, tOut };
    });
  });
  return out;
}

/* -------------------------------------------------------------------------- */
/*  The single place where position + visibility are decided                  */
/* -------------------------------------------------------------------------- */

export interface SolveCtx {
  W: number;
  H: number;
  pan: number;
  /** true during the rewind: every layer is part of the rigid strip */
  strip: boolean;
  travel: Travel;
  carry: CarryDelta;
}

export interface Solved {
  /** false → the layer must be hidden */
  live: boolean;
  x: number;
  y: number;
  /** multiplicative opacity (depth tone / dip); 1 for ordinary layers */
  alpha: number;
  /** true when the layer is moving as part of the rigid strip */
  rigid: boolean;
  /** clamped distance −1…1, for the inner crop shift */
  d: number;
}

const DEAD: Solved = { live: false, x: 0, y: 0, alpha: 1, rigid: false, d: 0 };

export function solveLayer(spec: MotionSpec, p: number, c: SolveCtx): Solved {
  const { W, pan, strip, travel, carry } = c;
  const dep = spec.depth === undefined ? null : DEPTH[spec.depth];
  let slide = spec.slide;
  let restX = 0;
  let restY = 0;

  if (spec.carry) {
    const { from, to } = spec.carry;
    if (p >= to) {
      // arrived: it now belongs to slide `to`, resting at its new home
      slide = to;
      restX = carry.dx;
      restY = carry.dy;
    } else if (p >= from) {
      // in transit between the two homes (same shared progress as everything)
      const t = (p - from) / (to - from);
      return {
        live: true,
        x: carry.dx * t,
        y: carry.dy * t,
        alpha: 1,
        rigid: false,
        d: 0,
      };
    }
  }

  const d = slide - p;

  // Rewind, and everything from the Lookbook onwards (T6), is a rigid pan.
  const rigid = strip || (slide >= LAST - 1 && p >= LAST - 1);
  if (rigid) {
    return {
      live: true,
      x: restX + (stripSlide(slide, pan) - stripPos(p, pan)) * W,
      y: restY,
      alpha: dep ? dep.tone : 1,
      rigid: true,
      d: clamp(d, -1, 1),
    };
  }

  // Parallax window: not yet arrived (d ≥ 1) or fully gone (d ≤ −1, unless the
  // layer persists on purpose).
  const goneAt = spec.persist ? -(1 + spec.persist) : -0.999;
  if (d >= 1 || d <= goneAt) return DEAD;

  const a = Math.abs(d);
  let aa = a;
  if (dep) {
    // Start delay only: both branches still end exactly at rest / fully gone.
    aa =
      d < 0
        ? clamp((a - dep.delay) / (1 - dep.delay), 0, 1)
        : clamp(a / (1 - dep.delay), 0, 1);
  }
  const dist = (d > 0 ? travel.tIn : travel.tOut) * (dep ? dep.travel : 1);

  return {
    live: true,
    x: restX + Math.sign(d) * aa * W * dist,
    y: restY,
    alpha: dep
      ? clamp(dep.tone - dep.dip * Math.sin(Math.PI * clamp(a, 0, 1)), 0, 1)
      : 1,
    rigid: false,
    d: clamp(d, -1, 1),
  };
}

/** True when the layer box lies completely outside the stage. */
export const isOffstage = (
  left: number,
  width: number,
  x: number,
  W: number,
): boolean => left + x >= W || left + x + width <= 0;

/**
 * Allow-list for the settled state `slide` (integer p). Used by the
 * development-only leak warning: anything visible that is not allowed here
 * has leaked from a neighbouring scene.
 */
export function mayBeVisibleAt(spec: MotionSpec, slide: number): boolean {
  if (spec.slide === slide) return true;
  if (spec.carry) {
    if (slide >= spec.carry.from && slide <= spec.carry.to) return true;
    // after the carry the layer rides with the Lookbook into the newsletter
    if (spec.carry.to === LAST - 1 && slide === LAST) return true;
  }
  if (spec.persist && spec.slide === slide - 1) return true;
  // the Lookbook stays (panned) in the newsletter state
  if (spec.slide === LAST - 1 && slide === LAST) return true;
  return false;
}
