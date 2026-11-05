I stopped at the tool-use limit before finishing everything, so this is the consolidated Phase 1 state. Everything is measured unless marked (est.). Coordinates are full-resolution pixels (1280×960). I only wrote scratch files to /tmp and touched no project files, server or app.

1. Video metadata (measured)
Property	Value
Container / codec	MP4, H.264 High, yuv420p, BT.709, Elemental encoder
Resolution	1280×960 (4:3)
Frame rate / frames	60 fps constant, 996 frames, 16.600 s
Timestamps	Every one of the 995 frame intervals is exactly 16.667 ms
Bitrate	2.49 Mbps
GOP	Keyframes every 120 frames (IBBP pattern)
Audio	An AAC track is present (16.44 s); I did not analyze it

All 996 frames were decoded and analyzed. Motion energy covers every consecutive pair. Layer tracking runs on all frames at 640×480, giving roughly ±0.2–0.5 px at full resolution.

Canvas: the grey background (
#CECECE) is static. A 16:9-ish white “card” sits on it, spanning x≈56→1224 (about 1169 px wide) from y≈151 down to about 804 (±5). The card edges never move. A curved soft shadow sits below it and is also static.

Loop: f995 is effectively identical to f0 (only 73 pixels differ by more than 24 levels), so the loop is seamless.

2. Timeline

Times are f/60 s. T1–T5 and T6 start/end are from fits; the visible motion ends about 2 frames before the fitted end because the tail drops below the threshold.

Segment	Frames	Time	Notes
Hold S1 (VANITY, *01)	0–29	0–0.48 s	483 ms
T1 S1→S2	start 28.75	0.479 s	duration 1825 ms
Hold S2 (Editorial, *02)	136–158	2.27–2.63 s	367 ms
T2 S2→S3	start 157.75	2.629 s	1825 ms
Hold S3 (Unleash Sensuality, *03)	265–285		333 ms
T3 S3→S4	start 284.75	4.746 s	1825 ms
Hold S4 (Be Your Own Muse, *04)	392–419		450 ms
T4 S4→S5	start 418.75	6.979 s	1825 ms
Hold S5 (Don’t Hide Yourself, *05)	525–554		483 ms
T5 S5→S6	start 553.75	9.229 s	1825 ms
Hold S6 (Lookbook, *06)	661–682		350 ms
T6 S6→S7 (Newsletter)	start 681.7	11.36 s	1522 ms (91.3 frames)
Hold S7	769–826	12.82–13.77 s	click disc appears at f813→814
T7 Rewind S7→S1	start 826.7	13.78 s	2400 ms (144 frames), ends ≈ f970.7
Hold S1	971–995	16.18–16.58 s	400 ms
3. Depth and 3D
No 3D camera is present. I found no measurable scale change (VANITY letter spacing stays at 192.0 px and SEN→ITY at 365.0 px at 640-scale, constant to ±0.1 px). Vertical drift is below 0.3 px wherever the match score exceeds 0.95. Template matches stay near NCC 1.0 with unrotated templates, so I found no sign of rotationX or rotationY, though I can’t rigorously exclude tiny rotations.
Depth is 2D parallax plus stacking order. The static curved shadow is the only pseudo-3D cue.
Stacking observed: nav and logo stay above everything, with 0.0 px offset in 89–100% of frames. In S3 the model cut-out sits in front of the UNLEASH and SENSUALITY text. Pink circles sit behind text and photos.
4. Parallax and easing

Easing, same family across everything: T1, T6 and the rewind fit cubic-bezier ≈ (0.55, 0.02, 0.17, 1) (T1 fit (0.545, 0.025, 0.163, 1.01), T6 (0.552, 0.02, 0.169, 1.00), rewind (0.554, 0.023, 0.174, 0.992); fit RMS 6×10⁻⁵ on T1 and 2×10⁻⁵ on the rewind). It starts slowly with exponential-like acceleration, peaks at about 38–40% of the duration, then has a long decelerating tail. Peak speed is about 3.3× the mean. In T1, 50% progress is at f72 and 90% at f98.

T1–T5 (staggered parallax):

All layers share one timeline and one curve, differing only in travel distance.
The best fit has a common start and no measurable per-layer stagger (delay 0–1 frame, within indexing error).
Per-frame velocity fits have RMS 0.05–0.15 px/frame at 640-scale.
Slowest layers are photos (about 0.5–0.75× card width); fastest are headline and vertical text (about 1.1–1.3×).
EDIT and ORIAL move rigidly as one group.
Distances are (est.) where a layer’s off-screen portion is extrapolated along the curve. Layers seen only in the tail (photo2, small photo, S4 photo incoming) are lower confidence.
T1 layer (full-res px)	Distance	× card width
S1 photo (out)	≈598	0.51
VANITY (out)	≈1446	1.24
FIND YOURS (out)	≈1269	1.09
WEEK IN FASHION (in)	≈1321	1.13
EDITORIAL (in)	≈1503	1.29
small photo (in)	≈1177	1.01
S2 photo (in)	≈877	0.75

Peak T1 speeds are about 44 px/frame (VANITY) and 41 px/frame (WEEK), both at f69–70.

Other transitions, exit or entry distances in px:

T2: EDIT/ORIAL ≈1480, S3 model ≈1712 in, SEN/ITY ≈1248, S2 photo ≈1046 out
T3: model ≈2112 out, SEN/ITY ≈1625, S4 head ≈1118, S4 photo ≈815
T4: S4 head ≈1489, vertical text ≈1922, S5 text ≈1537, S5 photo ≈864
T5: vertical text ≈1688, S5 text ≈1397, LOOK ≈1077, SEASON ≈781

T6 and T7 are rigid pans (no parallax):

T6: all layers move at the same velocity, travel 522 px (0.446 card width), peak ≈19.4 px/frame at f717.
T7 (rewind): inter-layer velocity spread is within 2.4 px/frame (640-scale, measurement noise). Total travel is 6374 px, which equals 5.45 card widths, roughly 5×1169 plus the 522 px newsletter offset. Peak is about 147 px/frame (about 8,800 px/s) at f881 (14.683 s), then it decays smoothly to about 0 by f962–971.
5. Smoothness
Timestamps are perfectly regular. Within motion windows there are no zero-energy (duplicate) frames and no jumps.
Velocity rises and falls monotonically. The only accel sign flips are ≤0.2 px/frame quantization at the rewind tail (f940–945, 969–970). Largest jerk is at the rewind peak (f880), which is expected.
One anomaly: at f66 (a B-frame) the grey background brightens by about 1.9 levels for a single frame. This is most likely a codec artifact, but I can’t prove it.
The perfect smoothness suggests this was rendered offline rather than screen-captured in a live browser (inference, not measured).
6. Secondary animations
Progress bar: its width equals n/6 of the card (194 px per scene) and uses the same easing. In the rewind it goes from 583 back to 97 (640-scale).
SPECIAL ISSUE badge (T1): fades from f≈33 to f≈57 (about 400 ms) with a slow-fast-slow profile.
Pager number: “01” slides up and out while “02” slides in from below behind a mask, roughly f35–50. The * stays put.
Capsule outline left of the pager arrows: appears around f31–33, shrinks f57–81, gone by f83 (approximate, partly occluded by sliding photos).
Click disc (S7): appears instantly at f813→814, about 96 px diameter, centred near (1043, 381). It stays solid f814–819, opens into a ring f820–824, and fades out f820–838 while the rewind starts.
Circular “FOLLOW US” badge: rotates continuously at 0.367°/frame (≈22°/s, clockwise). Over S4→S5 this adds up to about 47.7°, which explains the “+” becoming an “×”.
7. Composition (approximate)

Eyeballed coordinates have about ±6 px full-res error. I did not measure object-fit and cropping behavior, and there is no responsive evidence (a single viewport).

Element	Approx. position / size
S1 photo	x 56–790, full card height (≈63% of card width)
S1 VANITY word	x≈626–1106, y≈424–526
S2 photo	x≈904–1130, y≈304–670
S3 model	x≈424–810, y≈280–780
S6 photoB	x≈390–740, y≈500–760
S7 newsletter panel	x≈706–1224, y≈250–804 (page shifted left 522 px)

The pager and number disappear in S7.

8. Unmeasured or uncertain
Low-contrast pink circles and rectangles weren’t tracked (motion and opacity unknown).
Opacity changes on photos (e.g. the S1 photo washing out around f66) aren’t quantified.
The S5 photoA and photoB T5 fits were unreliable and excluded.
Whether T2–T5 truly have zero per-layer stagger below about 0.5 frame is unresolved.
Exact card bottom edge (±5 px) and the capsule’s full geometry are uncertain.
Audio and text content were not analyzed.
9. How the reference hero is constructed

It’s a flat 2D editorial slider inside a static letterboxed card. Each slide is a set of layers (photos, headline, vertical text, pink gradient shapes, pager). During T1–T5 every layer follows one 1825 ms timeline with one ease, cubic-bezier ≈ (0.55, 0.02, 0.17, 1), at a layer-specific distance, which creates the parallax. T6 and the rewind use the same ease as rigid pans, at 1522 ms and 2400 ms. Nav, card and shadow never move. Pager number, badge fade, progress bar, rotating badge and click disc run alongside as secondary animations.

I can turn this into a downloadable report file and a CSV of per-frame layer tracks for Phase 2 if you want.

Phase 2: current code vs Phase 1 reference
No code was modified, generated, or run. I read the four files statically (AveronHero.tsx, engine.ts, layers.tsx, averon-hero.module.css) and compared them to the video measurements. I did not run or verify the component in a browser. Code-side numbers below are computed from the source formulas. The only new reference work is the S1 photo measurement, the pager/pink-shape/colour checks, and overlays of your layer boxes on the reference hold frames. All of it was done in /tmp.

Two Phase 1 statements need refining:

“No scale change” holds for text and layer frames. The S1 photo’s content does zoom inside a stationary-scale frame.
My earlier S1 photo template-tracking distance (≈598 px) was biased by that zoom. Use the values in item C10 instead.
Units and caveats:

W means the hero/card width: 1168 in code, 1170 in the video.
“p” is the shared timeline progress, anchored so VANITY travels 1.24 W (code uses 1.28 W for it, so the two p scales agree within about 3%).
Distances that include off-screen portions are model-derived (est.). Ratios between layers are more reliable than absolutes.
1. Confirmed mismatches
#	Feature	Reference measurement	Current code behavior	Difference	Recommended correction	Confidence
C1	T1–T5 duration	1.825 s nominal (109.5 frames); the same joint fit holds for all five	AveronHero.tsx → goTo(): duration = … : 1.7	−0.125 s (−7%)	1.825 s	High
C2	T6 duration	1.522 s (91.3 frames)	goTo(): newsletterEntry ? 1.2	−0.322 s (−21%)	1.522 s	High
C3	Easing curve	cubic-bezier ≈ (0.55, 0.02, 0.17, 1) in T1, T6 and T7; peak speed at u≈0.37–0.40; peak/mean 3.36	goTo(): "power3.inOut" (T1–T6), "power2.inOut" (rewind), "power2.out" (retarget). Peak at u=0.50; peak/mean 3.0 and 2.0	T1–T5 time to 25/50/90%: ref 0.57/0.72/1.16 s, code 0.67/0.85/1.20 s. T7 time to 50/90%: ref 0.94/1.52 s, code 1.20/1.86 s	One shared ease, via a small bezier solver in engine.ts or GSAP CustomEase	High
C4	Do layers share one timeline?	Yes, one normalised curve per transition, scaled by per-layer distance. Fit RMS 0.05–0.15 px/frame; no stagger measurable	Single tween on state.p ✓, but engine.ts layerPose() applies Math.pow(a, m.k ?? 1). layers.tsx MOTION.k: shape 1.12, title 0.94, text 0.88, fore 0.92 (photo 1.0; k:1 on S5 layers and s6-circle-s)	Layers drift off the shared curve by up to about 4–6% of their travel mid-transition (text at	d	=0.5: 0.543 vs 0.5, about 66 px)
C5	Depth hierarchy (sIn/sOut)	Photos are the slowest layers (0.5–0.75 W); headline and vertical text are fastest (1.1–1.6 W). See the detail table below	layers.tsx MOTION: photo 1.42/1.0, fore 1.55/1.5, text 1.26/1.32, title 1.12/1.2, shape 1.0/1.05. Photos are treated as the fastest foreground plane	Hierarchy inverted for photos. EDIT/ORIAL are rigid in the reference (gap constant ±0.7 px), but code gives s2-edit sIn 1.12 and s2-orial sIn 1.2	Retune per-layer values from the Phase 1 per-layer fit (CSV); make EDIT/ORIAL identical	Ratios high; absolute values medium
C6	S5 exit	Parallax: photo 0.68, vertical text 1.44, text 1.19 W	All S5 layers have sOut: 1, k: 1 (rigid)	S5 exits as a rigid group; reference does not	Use per-layer sOut	Medium-high
C7	T6 (S6→Newsletter): rigid?	Yes. Pure pan of 0.446 W (522 px) over 1.522 s. s7_SUB velocity equals s6_text velocity to within 0.1 px/frame; y drift 0.04 px	layers.tsx NL_OUT = 0.398 (+0.004/+0.008/−0.002 per layer; title k 0.94, text k 0.88). nl-* layers enter at sIn 1.0 (panel), 1.26 (rewind), 1.18 (heading), 1.3 (form), 1.36 (foot)	Scene 6 moves 56 px short (photo B’s right edge rests at x≈222 vs reference ≈165). Newsletter layers travel 2.5–3.4× faster than the Lookbook layers instead of in lockstep	One shared pan of 0.446 W for every S6 and newsletter layer	High
C8	Newsletter heading vertical motion	None (y range 0.04 px)	AveronHero.tsx render(): newsletterY = H * 0.035 * (1 - progress) ** 2 (about 23 px at start)	Extra vertical rise not in the reference	Remove	High
C9	T7 rewind: rigid?	Yes. Inter-layer velocity spread ≤2.4 px/frame vs 73.7 peak (≈3%). Total 6374 px = 5.45 W (5 × 1.0 W + 0.446 W). Peak ≈147 px/frame at f881	goTo(0, true) tweens p 6→0 with power2.inOut. Each layer moves at its own sIn/sOut/k (1.0–1.55 W per slide) plus 3D terms	Rewind has parallax and different speeds per layer; reference is a rigid strip pan	Strip-mode pan (design needs your approval, see plan)	High
C10	S1 photo zoom model	Zoom confined inside a frame that translates linearly: frame edge ≈ −935·p px (0.80 W), measured directly for p≤0.23 and consistent with the visual exit time. Content scale = 1 + 0.526·p (ratio constant ±1% for p 0.02–0.71; rotation 0°; 99% inliers early). Inner pivot ≈ −26% x, 50.6% y of the photo box	AveronHero.tsx: SCENE_ONE_ZOOM = 0.61, SCENE_ONE_ORIGIN = "-16% 50%", scale 1 + 0.61·clamp(p,0,1). layers.tsx s1-photo sOut: 0.92. Inner xPercent = −4·c adds +29 px·p	Slope +16%, frame travel +15%, pivot −16% vs about −26%. (The combined similarity pivot happens to match: ≈1652 vs 1646 px abs.) In time, code lags mid-transition: at 700 ms scale 1.170 vs 1.247, frame edge −300 vs −439 px	Re-derive after the easing fix: slope 0.526, frame sOut ≈0.80, origin ≈ −26% 50%	Medium-high
C11	Comment vs formula (S1 zoom)	n/a	Comment says “scale 1.000 → 1.345 by the time the photo has left” and the ratio holds “0.05…0.57”. The formula reaches 1.61 at p=1. In code the photo is culled at	d	≈0.683, where scale = 1.417. The “p ≥ 1 held at max” branch can never be seen	Comment and formula disagree. My own measurement gives 0.526, not 0.61
C12	3D rotation and drift	Text spans constant to ±0.1 px (VANITY 192.0, SEN→ITY 365.0); y drift <0.3 px; no rotation detected	engine.ts layerPose(): rotationY = −ry·bump, rotationX, z, y = dy·H·bump. Values in MOTION: shape ry 9/rx −2, title 6, text 5 + dy 0.012, photo 13/rx 2.5, fore 16/rx 3; badge 24	Horizontal squish at mid-transition: title 0.55%, shape 1.2%, photo 2.6%, fore 3.9%, badge 8.7%. Text drifts ≈7.9 px vertically. z is visually inert (perspective 500000 px)	Set rx/ry/z/dy to 0 (keep S6’s existing zeros)	High for text; photos medium
C13	Pointer tilt	None (it’s a video)	AveronHero.tsx: quickTo on scene rotationY ±0.55°, rotationX ±0.35°	Not in reference. Visually negligible, but non-reference	Remove or gate behind a prop (your call)	High (that it’s absent)
C14	Autoplay holds	Hold from nominal end of one transition to the next start: S1 0.90 (loop), S2 0.325, S3 0.292, S4 0.408, S5 0.425, S6 0.307, S7 0.895 s	AUTOPLAY_HOLDS = [0.9, 1.2, 1.8, 0.8, 1.1, 0.9, 1.1]	S1 ✓. Others too long by +0.875, +1.51, +0.39, +0.68, +0.59, and +0.2 s. Start-to-start: code 2.9/3.5/2.5/2.8/2.6 s vs ref 2.15/2.12/2.23/2.25/2.13 s	Use the new hold values with the new durations. They’re only valid together with C1–C3	High (definition-dependent)
C15	FOLLOW US rotation	0.367°/frame = 22°/s clockwise (16.4 s/rev), linear over 15 frames	CSS .social: animation: avSpin 24s linear infinite (15°/s)	Code 32% slower	16.4s	Medium-high (single window)
C16	Pager number swap	Discrete “01”→“02” swap in about 12 frames (f≈36–47, ≈0.2 s), near the start of the transition, independent of progress	strip yPercent = −(100/6)·min(p, 5): continuous reel across the whole eased transition	Different timing and character	Short time-based swap triggered at transition start	Medium-high
C17	Pager fade, T6	* glyph fades 0.96→0.07 over f682–697 (≈230 ms), at the start of T6	ui = 1 − clamp(p − 5, 0, 1) via data-ui-fade: fades across the whole of T6 (still ≈97% at 230 ms)	Late and slow	Time-based fade at T6 start	High
C18	Pager fade, rewind	Re-appears late: alpha 0.5@f932, 0.82@f948, 0.98@f964 (1.7–2.4 s after rewind start)	Same ui formula: begins immediately, full by 0.69 s	Appears ≈1 s too early	Fade in during the final deceleration	High
C19	SPECIAL ISSUE badge	Fades in place, f33→57 (≈0.4 s; luminance 116→255)	layers.tsx s1-badge: fore, sOut 1.5, ry 20; no opacity animation anywhere (autoAlpha is only 0/1)	Code moves it 1.5 W; reference fades it	Opacity fade, no travel	Medium-high
C20	Progress bar thickness	≈5–6 px (rows 804–809 at f145)	CSS .progress: height: 3px	About half	≈5.5 px (consider scaling with cqw)	High
C21	S4 badge persistence	Ring is still visible at the left edge at S5 rest (centre ≈ x 18, y 233 card-relative); moves ≈0.87 W in T4	s4-badge: sOut 1.5 → gone when d ≤ −0.999 → hidden at S5 hold	Missing at S5 hold	sOut ≈0.87 W, exits in T5	Medium-high
C22	S3 right-edge pink circle	Present: bbox x≥1071, y 127–401 (large circle capped at the card edge, with the bump on it)	layers.tsx S3 draws only s3-bump (54 px at 1070,138)	Large circle missing	Add a circle (≈250 px, left edge ≈1096)	Medium-high
C23	S4 big pink circle	≈326–330 px circle behind “BE YOUR OWN MUSE” (bbox x 157, y 101–427)	S4 draws only s4-bump (58 px at 158,138); nothing else ≈330 px	Large circle missing	Add circle (unless omitted deliberately)	Medium-high
C24	S2→S3 circle size	Travels ≈884 px on the shared curve; lands centred ≈(331, 239) with diameter ≈176–180 (bbox lower bound)	Carried s2-circle: r(1125,158,150), target centre = YOUR box centre (338, 240)	Centre ✓, diameter 150 vs ≈180 (+20%)	Enlarge to ≈180, preserving the left-edge start	Medium
C25	S5 rect and left-group offset	Rect left edge x≈133 (blob)	s5-rect r(150,101,463,129)	Rect 17 px right	x ≈ 133	Medium-high (rect); photo/text are in section 2
Layer distance detail (×W: reference vs code sIn/sOut). Items marked “(low n)” are least reliable.

Transition	Layer	Ref	Code
T1 out	S1 photo frame / VANITY / FIND YOURS	0.80 / 1.24 / 1.09	0.92 / 1.28 / 1.32
T1 in	WEEK / EDIT / ORIAL	1.13 / 1.29 / 1.28	1.26 / 1.12 / 1.20
T1 in	small photo / main photo	1.01 / 0.75	1.42 / 1.52
T2 out	EDIT·ORIAL / main photo / small photo	1.27 / 0.89 / 0.68	1.20 / 1.0 / 1.0
T2 in	SEN·ITY / model / Tantra	1.07 / 1.46 / 1.03	1.12 / 1.55 / 1.26
T3 out	SEN·ITY / model / Tantra	1.39 / 1.81 / 1.23	1.20 / 1.50 / 1.32
T3 in	S4 photo / BE YOUR / paragraphs (low n)	0.70 / 0.96 / ≈0.70	1.42 / 1.12 / 1.26–1.34
T4 out	S4 photo / heading / paras	0.71 / 1.27 / 0.90–0.92	1.0 / 1.2 / 1.32
T4 in	S5 photo / vertical words / text	0.74 / 1.64 / 1.31	1.38 / 1.12–1.28 / 1.26
T5 out	S5 photo / vertical / text	0.68 / 1.44 / 1.19	1.0 / 1.0 / 1.0
T5 in	LOOKBOOK / SEASON / text	0.92 / 0.67 / 1.00	1.12 / 1.2 / 1.26
2. Potential mismatches requiring visual verification
Feature	Reference measurement	Current code behavior	Difference	Recommended correction	Confidence
S5 photo and vertical words	Photo left ≈218 (code 236); words ≈17–20 px left of code boxes (overlay)	s5-photo r(236,…), s5-dont/hide/yourself x 512/592/666	≈17–20 px right	Verify by pixel overlay at S5 hold, then shift	Medium
S5 big circle at rest	Visible cap 63 px, left edge ≈1107, diameter ≈315	s5-circle-big r(1073,262,340)	≈34 px farther left, ≈7% larger	Verify visually	Low-medium
S5 rect peeking at S4	Rect sliver at x≥1144, y 100–233 at S4 rest (entry offset ≈0.87 W)	s5-rect sIn 1.0 → fully off-screen	No peek in code	Verify, then sIn ≈0.87	Medium
Pager “pill”	Capsule, ≈44 px tall, left edge ≈720 px; appears f≈31–33, narrows f≈57–81, gone by f≈83–96 (partly occluded)	.pill: left 63.3% (≈739 px), 3.9cqw circle, static; opacity min(1, sin(π·frac(p))·3.2) pulses every unit of p, including T6 and all six rewind units; transform-origin: 100% 50% unused	Height ✓; ≈19 px right; no capsule-to-circle narrowing; pulses where the reference shows none (sampled frames only)	Verify before touching	Low-medium
Progress-bar colour	Samples: (252,197,251)→(254,202,238)	linear-gradient(90deg,#f1b6f2,#f8cfe6 60%,#fbd9cf)	Code darker at the start (~11–15 levels), peachier at the end	Verify visually (also unknown if the gradient spans bar or track)	Low
S2 circle path	y moves 165→149	Carried circle: x uses `	d	^1.12`, y is linear in (p−1), y target +7 px	Slightly curved path
Non-16:9 heroes	Reference is a single 16:9 viewport	Boxes are % of width and height; fonts are cqw (width); root height calc(100svh − 64/120px)	Typical desktops are 1.85–2.0:1, so the vertical layout stretches while type does not	Check at real viewport sizes	Medium
Click disc	96 px black disc at f814–819, ring fades f820–838, then the rewind starts	None	Absent	Product call: optional press feedback	High (measurement), n/a (need)
3. Already matching
Feature	Evidence	Confidence
Rewind duration	REWIND_DURATION = 2.4 vs ref 2.4 s	High
Post-rewind hold (S1)	AUTOPLAY_HOLDS[0] = 0.9 vs 0.9 s	High
One shared timeline	Single tween on state.p, retarget-safe, matches the “one curve” finding	High
No layer scale	pose.scale / scaleBump never applied; gsap.set scale 1 on layers	High
S1 zoom confined to the inner image	vars.scale set on [data-inner] (the img); .photo { overflow: hidden }; ref frame edge does not scale. Scale 1 at p=0 ✓	High
S1 photo leaves at the same moment	Ref frame fully left at 0.95 s (scale 1.413), code at 0.97 s (1.417)	Medium
S2 circle → YOUR centre, no duplicate	One s2-circle layer; centre (338,240) vs ref ≈(331,239)	Medium-high
S5 big circle → S6 gap	Target centre (336,385) vs ref ≈(325–336, 377–385); behind photos	Medium
S6 photos and stacking	Overlay: A r(104,265,269,198) and B r(335,352,352,258) match within ≈2 px; B over A; circle behind both	High
CTA circle in S6	s6-circle-s box matches the faint circle	Medium-high
S1/S2/S7 geometry	Overlay agrees; newsletter panel r(650,100,518,557) vs ref x 650.5, y 99	High
S1 circle y and bump x	Ref bbox y 319–489, x 904 vs code 318–488, 903	Medium
Progress-bar width	(p+1)/6 vs measured n/6 (16.7% → 100%) and tied to p	High
Rotation direction	Clockwise in both	High
Pill height	3.9cqw ≈ 45 px vs ≈44 px	Medium
Aspect	1168×657 reference frame = 16:9 vs card 1170×658.5	High
Vertical-text/EDIT-ORIAL box geometry	Overlay agrees at rest	Medium
4. Uncertain measurements
Distances for off-screen portions: distances are model-derived, and tail-only layers (photos in, S4 paragraphs) are less reliable. Photos A/B in T5 were unreliable and are excluded.
Unmeasured motion: travel of non-circle pink shapes (rects, bumps), mouse icon and text-box heights.
Pink-blob thresholds: these under-estimate faint gradient edges. All circle sizes are lower bounds.
Stagger: I can’t rule out per-layer stagger below about 0.5 frame.
Photo 3D: yaw foreshortening on photos was not separately quantified; the “ref has none” conclusion rests mainly on text layers.
FOLLOW US rate: measured in one 15-frame window. It is consistent with the plus→× rotation over S4→S5, but not independently checked elsewhere.
Hold definitions: “hold” is measured from the nominal bezier end. Perceptual holds (energy-based) differ.
Card and shadow: the code is deliberately full-bleed with no card, shadow or grey backdrop (CSS header comment), so I treat it as an intentional deviation, not a defect.
Responsive behavior: nothing to compare, because the reference shows only one viewport.
Prioritized implementation plan (awaiting your approval)
Timeline core (AveronHero.tsx goTo, plus a shared ease helper in engine.ts): bezier (0.55, 0.02, 0.17, 1); durations 1.825 / 1.522 / 2.4 s; new holds. Keep retarget logic and every approved behaviour.
Flatten motion (engine.ts, layers.tsx): k = 1, zero rx/ry/z/dy, remove or gate pointer tilt, remove newsletterY.
Per-layer distances (layers.tsx): retune sIn/sOut from the table above, with photos slowest, EDIT/ORIAL identical, and S5 exiting with parallax. The carried circles derive their travel from deltas, so they’re unaffected apart from k.
Rigid pans: T6 (0.446 W for all S6 and newsletter layers) and the rewind (strip mode, pitch 1.0 W per slide plus the 0.446 W offset). This is the one structural change and needs your design sign-off.
S1 photo: slope 0.526, frame sOut ≈0.80, origin ≈ −26% 50%, comments corrected. This must come after step 1.
Secondary animations: pager swap (~0.2 s), pager fades (T6 start, rewind end), badge fade, bar thickness, FOLLOW US 16.4 s.
Composition: NL_OUT to 0.446, S5 rect and group offsets, S3/S4 missing circles, S4 badge persistence, S2 circle diameter.
Verification (only after approval): deterministic browser renders at fixed state.p and timed captures compared against the Phase 1 tracks, plus an overlay pass for the “visual verification” items.
Decisions I need from you:

Remove 3D entirely, or keep a subtle version?
Remove the pointer tilt, or gate it behind a prop?
Approve the strip-mode design for T6 and the rewind?
Should the missing S3/S4 circles (C22, C23) and the S4 badge persistence (C21) be added, or were they omitted on purpose?
Include the click-disc feedback, or skip it?
I won’t change anything until you approve.