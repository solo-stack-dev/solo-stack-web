# Night Shift + Night Radio — round 2

Eleven original generated raster mockups for the 01:00 and 02:00 sections. Created with the built-in image generation tool, using the supplied Nachtstudio banner and owner portrait. These are still images documenting proposed interaction states, not working Svelte/Threlte implementations or layered production assets.

All visible text is design-only placeholder, marked TODO(copy). Nothing here is approved visitor copy; replace public strings, accessibility labels and terminal examples with gpt-6.1-sol output before production. The terminal history is illustrative, not a claim about actual commits. The local music display uses SOLO STACK rather than inventing a song title; no owner audio was supplied or generated.

## Images and implementation handoff

### 01-night-shift-desktop.png
The primary fixed-view studio: moon window, owner mascot with headphones, terminal, steaming coffee, generic manga, handheld, bonsai and floor dumbbells. Build as an art-directed raster base plus SVG object masks and HTML terminal text; animate a short typing sequence and two steam paths only while visible, with a static reduced-motion state. Rough cost: 2–3 person-days for asset separation and the base scene; low runtime cost, no WebGL.

### 02-night-shift-bonsai-hover.png
The first hover/focus target turns the small bonsai into a glowing golden tree with a compact label. Use an isolated painted glow layer with CSS opacity plus a few SVG motes, triggered by pointer hover or keyboard focus; touch toggles the same state and reduced motion retains a static highlight. Rough cost: 0.5–1 additional day including clean object masking; low runtime cost.

### 03-night-shift-console-hover.png
The second hover/focus target gives the generic handheld a thin warm contour and a small label, leaving the bonsai idle. Use an SVG outline and semantic button overlay, with focus and tap equivalents; this mockup promises no game launch or external destination. Rough cost: 0.25–0.5 additional day once the desk interaction system exists; negligible idle runtime cost.

### 04-night-shift-mobile.png
A portrait, art-directed crop keeps the owner's face, monitor, coffee, console, bonsai and floor weights visible, with small rings identifying the two touch targets. Use a dedicated mobile picture source and separately positioned HTML/SVG hit areas rather than shrinking the whole desktop composition; the terminal may show fewer lines and all targets should have at least 44 CSS px hit areas. Rough cost: 0.5–1 additional day; low runtime cost and one mobile artwork download.

### 05-night-shift-isometric.png
An alternative orthographic floating room preserves the same owner and objects as a small painted diorama suspended in the night sky. Build with lazy-loaded Threlte, simple low-poly meshes, painted texture atlases, baked lighting, transparent steam planes and a fixed camera with only a tiny optional pointer tilt; show the static painting for reduced motion or unavailable WebGL. Rough cost: 4–7 person-days including modeling/texturing; the highest download and GPU cost of this set, so it replaces the flat desk concept rather than loading alongside it.

### 06-night-radio-desktop-idle.png
The warm wood radio sits against a dark landscape with a neutral dial, eight painted social station names, and a separate crescent-marked local music station. Use a layered raster/SVG radio with real HTML controls over the station markers, an accessible station selector and an explicit music play button; keep the horizon and stars static at rest. Rough cost: 2–3 person-days for the radio base and accessible tuning controls; low idle runtime cost, no 3D required.

### 07-night-radio-desktop-youtube.png
The dial needle points at YouTube, the cabinet display confirms the selection, and a separate external-link action appears. Rotate one SVG needle and update the display/link together, supporting keyboard selection as well as dial dragging; tuning must not open a site or start audio automatically. Rough cost: 0.5–1 additional day, shared by all eight social stations; negligible runtime overhead.

### 08-night-radio-desktop-playing.png
The crescent station is active, the owner's track is represented in the cabinet display, and the landscape horizon becomes a golden waveform while selected stars brighten on the beat. After explicit play, connect the supplied audio file through Web Audio to a lightweight SVG or canvas horizon and smoothed star opacity, cap updates around 30 fps, stop rendering when hidden, and keep a static horizon/stars under reduced motion. Rough cost: 1–2 additional days after the radio base, plus audio preparation; modest active rendering cost and no audio download before interaction.

### 09-night-radio-mobile-idle.png
The portrait radio uses an upright cabinet so all eight dial markers remain readable on a narrow screen, with the speaker and music control below. This is deliberate responsive art direction rather than a literal crop; use a separate mobile image source and preserve the same semantic control order and 44 CSS px target sizes. Rough cost: 0.5–1 additional day for mobile asset preparation and positioning; low idle runtime cost.

### 10-night-radio-mobile-youtube.png
The upright cabinet shows the selected YouTube needle and a distinct action beneath the radio, keeping the music control separate. Reuse desktop station state, provide keyboard/focus equivalents and a compact accessible selector when dial labels become too small; selecting a marker reveals the action before navigation. Rough cost: 0.25–0.5 additional day beyond the mobile base; negligible runtime overhead.

### 11-night-radio-mobile-playing.png
The portrait music state moves the visible waveform above the cabinet and captures soft star pulses, with the social dial returned to neutral. Reuse the desktop audio pipeline with fewer waveform samples on mobile and keep pause reachable; reduced motion freezes the visual response without preventing music playback. Rough cost: 0.5–1 additional day for responsive tuning and device checks; modest active rendering cost.

## Build boundaries and art notes

- Estimates are rough person-days for one experienced implementer, not quotes, benchmarks or additive totals; shared components reduce the total.
- The fixed-view desk is the recommended primary direction. The isometric room is an alternative requiring separate 3D asset work.
- The images are flattened review artifacts. Production needs clean text-free backgrounds and separated object/lighting masks; do not ship all state PNGs as animation frames.
- Use Paraglide for actual UI strings and semantic HTML controls over illustration. Provide visible focus and tooltips that dismiss on Escape; decorative art must not be the only navigation.
- The radio's three small desktop knobs are visual material detail, not three invented features. They can become volume/tuning controls only after behavior is defined.
- Prefer static images with lightweight overlays. Pause offscreen effects, avoid full-screen animated SVG filters, and reserve Threlte for the optional diorama.
- Social targets come from docs/PROJECT.md; the Discord invite still needs the owner's current URL.
- The waveform is a proposed response to the owner's actual track, not measured audio data in these images. Smooth amplitude and star brightness rather than flashing.
- Minor texture and geometry variation between generated states is illustrative; production should share one base asset per responsive layout.
- The tool chooses final raster dimensions despite requested target sizes. See SIZES.md for actual exports; mobile compositions target approximately 9:19.5.
- No production source files, package files, deployment settings or sibling mockup folders were changed.

## Favorite

02-night-shift-bonsai-hover.png: the tiny golden tree makes the owner's gaming interest feel like a discovered part of the room while keeping the human coding scene central.

Exact generation prompts and reference lineage are in PROMPTS.md.

