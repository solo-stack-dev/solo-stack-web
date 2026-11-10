# Exact image-generation prompts

Mode: built-in image_gen. No CLI/API fallback, no HTML screenshots, no raster edits with shell or Python. Every call used transparent_background: false. The tool exposes no separate quality/size controls; quality and requested dimensions were expressed in the prompts. Generated results were visually inspected before keeping them.

## Original references

- Brand banner: D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg
- Owner portrait: D:/repos/Solo Stack/branding/final-branding-assets/profil-buttergelb.png

Both were opened with view_image before generation. Round-one 01-nachtstudio_index.png and 02-kleiner-planet_index.png were inspected for contrast only, never supplied as generative references.

All text in these design drafts is placeholder under BRIEF.md and is explicitly marked TODO(copy). Do not use it as approved public copy.

## 01-night-shift-desktop.png

Reference/edit inputs: brand banner; owner portrait.

Original generated file: ~\.codex\generated_images\01a194a5-6008-7e43-95fb-2067bff6367b\exec-ce601449-5582-491b-b5ef-252b0516ddf4.png

Exact prompt:

```text
Use case: ui-mockup. Create a highest-quality original raster website section mockup, 16:9 landscape, target 2560x1440. Reference 1 is the Solo Stack brand material/palette guide: match its physical watercolor granulation, buttery yellow light, warm charcoal washes and raw pigment edges. Reference 2 is the owner identity guide, translate into a friendly watercolor chibi man with short dark brown hair, light stubble, black crewneck tee and large headphones. THIS IS A DESIGN DRAFT, all text placeholders, not publication copy. One fixed frontal three-quarter camera viewing a cozy desk, never a walkable room. The scene fills the screen, with exquisite hand painted watercolor and fine ink contours, tactile cold press paper everywhere, original animated-film warmth without copying any artist or frame. Top left small SOLO STACK wordmark, top right understated 01:00 and simple hamburger strokes. Upper left bold geometric sans heading NACHTSCHICHT and small mono 01:00. Window left-center contains large textured butter-yellow moon and few tiny stars, warm moonlight washes desk. Owner sits center-right in profile typing with two anatomically clean hands on keyboard, both forearms sensible. Monitor on desk center angled toward viewer, screen readable with exactly these monospace code lines: '$ git log --oneline', 'c72a91f fix: await query()', 'a81bf03 feat: add sitemap', '$ git commit -m "fix: cache key"', and a small cursor. Warm desk lamp, cream coffee cup with thin rising ink-wash steam at left, small dark bonsai with ochre leaves at far right, generic handheld game console front left on desk with no logos, shelf high right with generic monochrome manga spines and no titles, two dumbbells clearly on floor below desk. Restrained sparse interface, illustration occupies 85 percent. No cards, no panel grid, no flat vector illustration, no shiny CGI, no neon blue or purple, no invented stats, no official logos, no excess prose. Room edges dissolve naturally into textured charcoal paper. Bottom tiny down-chevron and unobtrusive draft marker TODO(copy). Idle state: bonsai is not yet glowing and no tooltips. Make this feel like a premium crafted actual website viewport, not a concept sheet or framed painting.
```

## 02-night-shift-bonsai-hover.png

Reference/edit inputs: 01-night-shift-desktop.png.

Original generated file: ~\.codex\generated_images\01a194a5-6008-7e43-95fb-2067bff6367b\exec-a171a541-6c1e-4e4c-89d3-6f4941420c97.png

Exact prompt:

```text
Use case: precise-object-edit. Edit the provided Night Shift desktop website image. Keep the fixed camera, owner face and hands, all typography, code, furniture, moon, palette, texture and all object positions exactly the same. Only show the bonsai hover/focus interaction: the bonsai at far right now emits delicate luminous golden leaf light, a restrained halo warming the adjacent desk, with a few tiny drifting golden motes. It evokes an original miniature golden world tree, no franchise symbols. Add one tiny understated off-white tooltip directly above the bonsai, text exactly 'Bonsai', charcoal ink, not a giant UI card; add small cursor arrow at the pot. Other objects remain unhighlighted. Maintain the TODO(copy) draft marker. 16:9 landscape single desktop viewport.
```

## 03-night-shift-console-hover.png

Reference/edit inputs: 01-night-shift-desktop.png.

Original generated file: ~\.codex\generated_images\01a194a5-6008-7e43-95fb-2067bff6367b\exec-73a244e3-63cd-4058-ade6-4953c0771308.png

Exact prompt:

```text
Use case: precise-object-edit. Edit the provided fixed-view Night Shift desktop website mockup. Keep absolutely all scene geometry, owner identity, code, watercolor paper grain, typography, window, moon, bonsai and camera unchanged. Only add the SECOND object's hover state: the handheld game console on the front-left desk has a subtle warm-ivory contour highlight, a faint warm screen reflection, a small cursor near its right control, and one tiny off-white tooltip above it with text exactly 'Konsole'. The bonsai must remain in its original non-glowing idle state. No other tooltips. Preserve TODO(copy) draft mark. Single landscape 16:9 desktop viewport, highest-quality watercolor.
```

## 04-night-shift-mobile.png

Reference/edit inputs: 01-night-shift-desktop.png.

Original generated file: ~\.codex\generated_images\01a194a5-6008-7e43-95fb-2067bff6367b\exec-6db8b5c1-bb17-46e8-9923-06e6e70fec32.png

Exact prompt:

```text
Use case: ui-mockup, responsive adaptation. Adapt this exact Night Shift watercolor desktop website scene into one tall MOBILE website screenshot, 9:19.5 aspect ratio, target 1080x2340. No phone hardware frame, no collage. Preserve fixed front three-quarter viewpoint and the same chibi owner with short dark hair, light stubble, dark hoodie, headphones, hands typing; keep tactile watercolor and ink detail, moonlit buttery yellow and warm anthracite. Reframe for a narrow portrait viewport: small SOLO STACK top left and hamburger top right; heading NACHT / SCHICHT in two clean bold geometric sans lines and small 01:00 above scene. Moon window behind monitor upper-left, owner at right, use a slightly wider view of desk to preserve both, monitor readable at mid-height with '$ git log --oneline', 'c72a91f fix: await query()', 'a81bf03 feat: add sitemap'. Coffee and elegant rising steam lower-left, generic handheld in front, small bonsai right, shelf with generic untitled manga high right, dumbbells visible on the floor at bottom. This must feel like the same single room and same desk, framed taller, not a different environment or a walkable room. Mobile crop art can bleed beyond sides but do not cut off the owner's face or bonsai. Two unobtrusive small ivory ring markers on console and bonsai hint tap targets, no tooltip open. Bottom down-chevron, tiny TODO(copy) draft marker. Illustration dominates with organic uneven pigment edges, no card containers.
```

## 05-night-shift-isometric.png

Reference/edit inputs: 01-night-shift-desktop.png; brand banner.

Original generated file: ~\.codex\generated_images\01a194a5-6008-7e43-95fb-2067bff6367b\exec-53a54e12-a431-4f50-b6da-f7bc1c53e4d3.png

Exact prompt:

```text
Use case: ui-mockup. Generate an alternative Night Shift website section as a cozy ISOMETRIC FLOATING LOW-POLY ROOM in the night sky, painted watercolor texture on every visible polygon. Desktop 16:9 target 2560x1440, premium highest-quality raster design mockup. First reference is the approved fixed-view painted studio and owner design; second reference is exact brand material. Match the same owner short dark hair/light stubble/black hoodie/headphones, moon and warm butter yellow/anthracite palette. DIFFERENT composition: a self-contained floating open-front room diorama on a thick angular charcoal rock/paper slab in a vast grainy charcoal night sky, two cutaway walls, desk against back wall, large moon window, friendly small owner coding at monitor with two sane hands. Coffee with thin steam, small golden-leaved bonsai, handheld console on desk, generic manga shelf, pair of floor dumbbells, chair, ochre rug. Low-poly faceted wall and floor geometry, hand-painted texture maps, visible pigment and paper fibers, soft baked moonlight and warm desk lamp. Should look achievable with a modest Threlte scene of simple boxes and planes, NOT glossy clay or photoreal ray-tracing, NOT a walkable environment. Room occupies 65 percent width centered-right; generous negative space left for small SOLO STACK at top, heading NACHTSCHICHT in two lines, mono 01:00. Sparse stars, floating dust, no planets or extra scene objects. Tiny TODO(copy) draft marker, hamburger top right, down-chevron bottom. Fixed orthographic isometric camera, beautiful layered depth with grounded small-object proportions. No tooltip, no cards, no official logos.
```

## 06-night-radio-desktop-idle.png

Reference/edit inputs: initial radio generation, documented below.

Original generated file: ~\.codex\generated_images\01a194a5-6008-7e43-95fb-2067bff6367b\exec-61d960eb-c87a-4965-b0e3-bf56df706153.png

Exact prompt:

```text
Use case: lighting-weather and precise-object-edit. Edit this exact radio website mockup. Preserve the beautiful watercolor radio, all eight correctly spelled station markers and their positions, landscape composition, typography placement, and high quality pigment texture. Change the large bright butter-yellow upper-left sky to a deep warm anthracite midnight watercolor wash, with subtle charcoal granulation; change SOLO STACK and NACHTRADIO to warm ivory for contrast. It is 02:00, well before dawn: no daylight, no bright yellow sky field. Only the moon, dial and distant thin horizon provide buttery yellow light. Retain the 02:00 label in warm ivory. Make idle unambiguous: replace the long needle pointing at X with a short inactive central needle not reaching any station mark, and retain the '—' display. Keep the crescent music button separate. No other changes. Single 16:9 desktop screenshot, no panels.
```

## 07-night-radio-desktop-youtube.png

Reference/edit inputs: 06-night-radio-desktop-idle.png.

Original generated file: ~\.codex\generated_images\01a194a5-6008-7e43-95fb-2067bff6367b\exec-182bebcc-8ad5-4ec6-94c4-8c10b4ee3e1f.png

Exact prompt:

```text
Use case: precise-object-edit. Edit this exact Night Radio desktop watercolor website screenshot into the TUNED TO YOUTUBE state. Preserve all image geometry, dark night sky, moon, radio, all eight station names and positions, heading, clock, pigment and paper texture. On the large tuning dial add a delicate brass needle from center pointing exactly to YouTube at 12 o'clock; add a small butter-yellow glow behind YouTube only. Change small black radio display from dash to exact text 'YouTube'. Add one small cream painted-paper action label below the radio, exact 'YouTube ↗', to show that selection offers an external link. No automatic playing: retain play triangle, no waveform, no extra bright stars. Avoid cards or redesign. Keep TODO(copy). Highest-quality 16:9 desktop viewport.
```

## 08-night-radio-desktop-playing.png

Reference/edit inputs: 06-night-radio-desktop-idle.png.

Original generated file: ~\.codex\generated_images\01a194a5-6008-7e43-95fb-2067bff6367b\exec-907010ff-2ad9-4c3f-937f-9dde46b34f45.png

Exact prompt:

```text
Use case: precise-object-edit. Edit this exact Night Radio desktop watercolor website viewport into the LOCAL MUSIC PLAYING state. Preserve original radio shape, scene position, eight correctly spelled social station markers, heading, 02:00, moon, all textures and dark night palette. The local crescent music station below the main dial is softly glowing gold; no social station selected, dial has no long needle. Radio's small black display now reads exactly 'SOLO STACK' with a tiny musical note, representing the owner's own lo-fi/sad rap track without inventing a track title. Physical music play triangle becomes a PAUSE symbol (two strokes), and bottom player also shows pause plus a small thin progress line without timestamps. MAIN visual change: the distant horizontal ridge line itself morphs into a luminous hand-painted AUDIO WAVEFORM, asymmetric organic varying peaks and troughs in golden ink extending from left screen edge to right behind radio, clearly visible on both sides. It must feel landscape becoming sound, not a disconnected chart or equalizer overlay. A handful of stars have slightly expanded soft concentric watercolor halos suggesting a captured beat, others remain faint. Warm restraint, no strobe, no neon. Keep TODO(copy) marker. Single high fidelity 16:9 desktop screenshot.
```

## 09-night-radio-mobile-idle.png

Reference/edit inputs: 10-night-radio-mobile-youtube.png.

Original generated file: ~\.codex\generated_images\01a194a5-6008-7e43-95fb-2067bff6367b\exec-bbef8a41-7bb1-472e-b020-b17bfc8ed2c6.png

Exact prompt:

```text
Use case: precise-object-edit. Return this mobile radio screenshot to IDLE while preserving this exact tall 9:19.5 portrait composition and canvas, all radio geometry, landscape, sky, moon, type, texture. Remove the long thin needle that connects center knob to YouTube: fill that path with cream dial paper, retaining center knob and outer short station tick. Remove the glow behind YouTube. Replace the radio black display's YouTube text with a single dash '—'. Remove the cream YouTube external-link button below cabinet and fill with contiguous painted rock. All eight station names remain and physical music button remains play triangle. Keep bottom player as play triangle and music note, calm stars and quiet natural ridge without waveform. No other changes.
```

## 10-night-radio-mobile-youtube.png

Reference/edit inputs: 09-night-radio-mobile-idle.png.

Original generated file: ~\.codex\generated_images\01a194a5-6008-7e43-95fb-2067bff6367b\exec-4e66276a-dadd-439a-9bf6-484d22e29bd4.png

Exact prompt:

```text
Use case: precise-object-edit. Edit the provided MOBILE Night Radio image, preserving its tall portrait canvas and all art exactly. Only change idle to tuned YouTube: add a thin brass needle from center of large cream dial straight up to YouTube marker at 12 o'clock, add subtle warm glow behind that label, replace dash in speaker's black display with exact 'YouTube'. Add small cream painted-paper external action label 'YouTube ↗' in space directly beneath wooden cabinet, above bottom player. Music stays paused with triangle buttons. Natural horizon unchanged, calm stars, no waveform. Preserve every other station label, night sky, moon, wood grain, paper texture, heading, clock, TODO(copy). Single portrait mobile website screenshot, no device frame. Use a 9:19.5 tall canvas, extend only rocky foreground/sky if extra height is needed; do not distort radio.
```

## 11-night-radio-mobile-playing.png

Reference/edit inputs: intermediate mobile music state, see lineage.

Original generated file: ~\.codex\generated_images\01a194a5-6008-7e43-95fb-2067bff6367b\exec-21aa9ae1-aab0-4822-8735-5e76246b51b1.png

Exact prompt:

```text
Precise local edit ONLY. This is the music-playing state, so YouTube must NOT be selected. ERASE the thin vertical brass needle running from the central black knob upward toward the word YouTube. Fill its entire former path with the same plain cream watercolor dial texture as adjacent blank dial. Keep the black center knob and the short outer YouTube station tick at top, but NO connecting line between them. All eight names stay. Do not change anything else whatsoever: preserve the portrait canvas, waveform horizon, lit stars, pause buttons, SOLO STACK music display, art, text, colors, composition.
```

# Intermediate lineage and exact prompts

Intermediate outputs are not final deliverables. Their original generator paths are recorded for traceability; they are not duplicated into the output folder.

## radioResult

Initial radio image had too much yellow sky, suggesting sunrise. radioRefinePrompt produced final 06 from this input.

References: Brand banner.

Generated file: Generated images are saved to ~\.codex\generated_images\01a194a5-6008-7e43-95fb-2067bff6367b as ~\.codex\generated_images\01a194a5-6008-7e43-95fb-2067bff6367b\exec-14953c0f-7488-4fb6-844c-fc002675e2b8.png

```text
Use case: ui-mockup. Highest-quality original generated raster, actual desktop website section viewport, landscape 16:9 target 2560x1440. Reference image supplies Solo Stack brand palette and physical watercolor pigment texture. Design draft only: every UI text is placeholder. Build NIGHT RADIO at 02:00: a breathtaking warm vintage tabletop radio on a rough charcoal rocky ledge in a painted night landscape. The radio is the large foreground centerpiece occupying 65 percent screen width, hand painted rounded warm ochre wooden casing, charcoal woven speaker grille on its left, one LARGE circular buttery ivory tuning dial on its right, small tactile brass knobs along bottom. The dial has eight clear small painted station names around its perimeter with one small mark each: YouTube, Twitch, TikTok, Instagram, X, Bluesky, GitHub, Discord. Spell each perfectly once, spaced legibly around dial, no logos, no invented frequencies. A separate small crescent-marked local music detent below dial connects to a physical play triangle button. The radio display has just '—' in idle state. Behind radio: wide soft watercolor hills, quiet horizontal fine golden horizon line, moon upper right, a few warm white stars. Dry pigment granulation, bleeding edges, ink outlines, paper texture, amber reflected moonlight, excellent artistic craft. Warm charcoal and muted butter yellow only with off-white, no purple or neon. Fine drawn line from distant horizon subtly aligns with radio, ready to become an audio waveform in another state, but IDLE here: hills natural and no waveform, stars calm, needle at neutral bottom position. Small SOLO STACK wordmark top left, hamburger strokes top right, spacious heading NACHTRADIO in heavy geometric sans upper left, tiny mono 02:00. At bottom centered tiny play triangle and music note, no extra sentences or cards. Tiny TODO(copy) bottom right. Make it usable website art, not a product ad, not a UI dashboard, not a board of multiple screens. No physical phone frame or computer mockup.
```

## radioMobile

Initial mobile radio established upright cabinet. It was input to 10; final 09 then restores idle from 10 to match its taller composition.

References: 06-night-radio-desktop-idle.png.

Generated file: Generated images are saved to ~\.codex\generated_images\01a194a5-6008-7e43-95fb-2067bff6367b as ~\.codex\generated_images\01a194a5-6008-7e43-95fb-2067bff6367b\exec-9f5ec84e-80d4-40d6-8905-06dc1ed650d6.png

```text
Use case: ui-mockup, responsive art direction. Create a tall MOBILE counterpart of this exact Night Radio design, 9:19.5 portrait target 1080x2340, one actual website viewport without a phone frame. Maintain tactile hand-painted watercolor, paper grain, warm anthracite midnight, buttery moon, rocky foreground, layered hills and same vintage radio materials. Adapt radio for mobile as a compact upright model with large circular cream tuning dial occupying nearly full available width in upper half of casing, charcoal woven speaker and little black status display beneath it, and brass music play button near bottom. Keep the soft rounded wood housing, hand painted edges and ochre warmth; this is an art-directed narrow composition of the same product family. The eight station markers are clearly legible around dial in EXACT same order clockwise: YouTube at top, Twitch upper-right, TikTok right, Instagram lower-right, X bottom, Bluesky lower-left, GitHub left, Discord upper-left. No official logos. Neutral idle center hub without needle reaching a station. Display just '—'. Small crescent local-music station by physical play button, not a ninth social platform. Top small SOLO STACK and hamburger, bold heading NACHT / RADIO across two lines, small 02:00. Large moon upper right but not behind text, natural calm golden horizontal ridge above radio, calm sparse stars, no waveform. Radio fills portrait width with sensible margins and enough surrounding painted sky for atmosphere. Tiny bottom play triangle and music note, tiny TODO(copy) marker. All text draft placeholder. Premium illustration-led website, no cards, no dashboard. Preserve idle state throughout.
```

## musicMobile

Initial music edit retained YouTube needle incorrectly. musicMobileFixPrompt removes it for final 11.

References: 10-night-radio-mobile-youtube.png.

Generated file: Generated images are saved to ~\.codex\generated_images\01a194a5-6008-7e43-95fb-2067bff6367b as ~\.codex\generated_images\01a194a5-6008-7e43-95fb-2067bff6367b\exec-8b4b8a57-1e21-4856-9e55-11df04abe7ab.png

```text
Use case: precise-object-edit. Edit this exact tall portrait mobile Night Radio website screenshot into LOCAL MUSIC PLAYING. Keep identical canvas 9:19.5, composition, cabinet, all eight social station labels, heading, 02:00, moon, wood grain, watercolor texture and pigment. Remove YouTube needle and YouTube label glow: social dial neutral. Change black display to exact 'SOLO STACK' plus small musical note, representing the owner's own lo-fi/sad rap track with no invented title. Make the crescent music station glow softly; physical play button becomes pause with two vertical strokes. Remove the YouTube external link below cabinet, replace bottom play triangle with pause and a thin music progress line, no timestamps. Behind cabinet, the high landscape ridge directly above radio turns into a beautiful golden ink audio waveform of organic varied amplitude, continuous edge-to-edge and visibly connected to the mountain silhouette; smaller portions visible either side of cabinet. Several stars gain soft watercolor halos captured on a beat. Not neon, no strobe, no disconnected chart overlay. Keep night dark and intimate. Keep tiny TODO(copy). One highest-quality mobile screenshot.
```


