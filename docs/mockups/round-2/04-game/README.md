# GAME · 22:00 · Round 2

Nine final generated image mockups for two alternative games, integrated into the painted Nachtstudio night. These are visual design studies, not implemented or playable screenshots. Built-in image generation was used with the actual banner and owner portrait as references; exact prompts and correction passes are in [PROMPTS.md](PROMPTS.md).

All headings, controls, glyph scores and block labels are provisional layout content. Dashes stand in for scores; dots illustrate game state, not channel or business statistics. Before anything ships, generate final visitor-facing German copy and accessibility labels with gpt-6.1-sol following docs/PROJECT.md, then place strings in Paraglide.

## Concept 1: Moon Planet

A miniature cratered moon supports a continuous orbital track. Gravity points toward its center and the owner's local up direction always points outward; the camera stays stable so orbiting is readable. A/D or left/right moves along the tangent, up/Space jumps outward, and down stomps inward.

Original game loop: collect a short constellation of star shards to seal and send a paper feature envelope. Moving between the lit rim and shadow exposes different paths; successful stomps replenish the outward hop, while a rare segmented beetle requires hitting its currently illuminated stitch target. Use deterministic encounter cadence with a cooldown rather than spawning the rare boss randomly on top of the player.

### 01-moon-planet-idle-desktop.png

[Open image](01-moon-planet-idle-desktop.png)

The before-play poster places the mascot, beetles and collectible trail directly into the page's night scene. Start activates the miniature world; the poster itself remains still until requested, with the clock anchoring it in the homepage's timeline.

Build: responsive image poster, real DOM heading/button and small SVG icons; Threlte code imported only on play. Rough cost: 0.5–1 developer day for poster integration, excluding shared game work.

### 02-moon-planet-orbit-stomp-desktop.png

[Open image](02-moon-planet-orbit-stomp-desktop.png)

The corrected action screen shows a sideways inward stomp at the moon's right rim, with boots toward the moon center and head outward. Collected stars feed the envelope; the tiny HUD gives the scene room to breathe.

Build: Threlte low-poly moon with baked crater texture/normal detail, painted toon material, rigged mascot, shared beetle mesh and analytic radial collision. Rough cost: 4–6 developer days for the shared movement, collision, collectible and shipping loop, including basic animation.

### 03-moon-planet-rare-boss-desktop.png

[Open image](03-moon-planet-rare-boss-desktop.png)

A larger beetle interrupts the ordinary loop, with three shell stitches providing readable sequential stomp targets. Brief ink impact strokes emphasize the encounter while the rest of the scene keeps its quiet painted treatment.

Build: reuse moon and mascot; add a segmented beetle rig, explicit encounter state machine and pooled impact sprites. Rough cost: 1.5–2.5 additional developer days.

### 04-moon-planet-mobile-touch.png

[Open image](04-moon-planet-mobile-touch.png)

The full portrait viewport preserves the complete moon and clearly demonstrates radial orientation on its right edge. Independent left/right pads and jump/stomp pads sit below the action, allowing simultaneous movement and jumping without covering the character.

Build: responsive Threlte camera framing, DOM pointer controls with independent pointer IDs and capture, 56 CSS-pixel minimum targets and bottom safe-area padding. Rough cost: 1–1.5 additional developer days including real-device input checks.

## Concept 2: Stack to the Moon

Paper blocks swing over a rising tower; release timing determines their offset, and brief left/right counterlean inputs help settle the pile. The visible plumb line communicates whether the center of mass lies over the support footprint. A rescue drop on the opposite side can recover a near-collapse, giving this toy more agency than simply tapping to align rectangles.

Tool names are material labels, not brand power rankings or factual claims about the tools. The camera follows the top with a slow dead zone; the moon becomes the physical goal, and the final paper flap folds out into a landing bridge.

### 05-stack-to-moon-idle-desktop.png

[Open image](05-stack-to-moon-idle-desktop.png)

The poster introduces the thick painted paper blocks, suspended next piece and moon destination before play. The owner sits with his laptop on the crag, tying the game to the studio narrative.

Build: static responsive poster plus real DOM play control and clock; use this as the non-WebGL fallback too. Rough cost: 0.5–1 developer day, sharing poster scaffolding with the other concept if both are prototyped.

### 06-stack-to-moon-midgame-desktop.png

[Open image](06-stack-to-moon-midgame-desktop.png)

The camera has climbed above the ground, leaving the tower's lower layers outside the viewport. A swing arc, projected landing bracket and height rail make the next move readable while the physical paper faces carry the dev-tool labels.

Build: Threlte orthographic/slight-perspective view, reusable box meshes with folded edge details, label texture atlas and a lightweight constrained 2D balance simulation. Rough cost: 3–4 developer days for the shared stacking loop, drop projection and rising camera.

### 07-stack-to-moon-near-collapse-desktop.png

[Open image](07-stack-to-moon-near-collapse-desktop.png)

The corrected stack leans sharply right above a narrow support contact, with the plumb line outside the lower block. The incoming Drizzle piece aims toward the left edge to suggest a recoverable counterweight move; restrained ink arcs show the wobble.

Build: shared tower simulation with center-of-mass/support tests, spring-damped rotation and a short rescue window; SVG/DOM indicators remain legible independently of the texture. Rough cost: 1–2 additional developer days for tuning, readable feedback and collapse/recovery states.

### 08-stack-to-moon-reached-moon-desktop.png

[Open image](08-stack-to-moon-reached-moon-desktop.png)

The tower physically reaches the moon and the terminal block unfolds into a small landing bridge. A grounded mascot celebrates amid a restrained burst of paper scraps, while the filled height rail and replay control make completion obvious.

Build: one folded-plane flap animation, short mascot celebration clip, pooled paper particles and explicit complete/replay state. Rough cost: 0.75–1.25 additional developer days.

### 09-stack-to-moon-mobile-touch.png

[Open image](09-stack-to-moon-mobile-touch.png)

The portrait view turns the tower's height into the main composition and keeps the drop path clear. Two lower-left pads control counterlean, and the wide lower-right release button supports comfortable thumb play.

Build: same scene and logic with mobile framing, DOM multi-pointer controls and a reserved control zone; add an explicit accessible pause control in the final UI, which this generated frame omitted. Rough cost: 0.75–1.25 additional developer days.

## Shared production notes

These estimates are planning ranges, not quotes or benchmarks; they assume an experienced Svelte/Three.js developer and reusable assets. A polished custom mascot rig, final textures, audio, copy generation and wider accessibility/device QA are additional work; rough totals before that polish are 7–12 developer days for Moon Planet or 6–10 for Stack to the Moon. Do not add the two alternative implementations together unless both are selected.

- Render the chosen poster immediately; load the game and WebGL only after explicit play. Keep a static fallback available on WebGL failure.
- Keep page paper grain and scene-edge washes continuous with neighboring hours. The yellow cloud bands belong low in the scene, not in rectangular section containers.
- Production HUD, clock, buttons and tool names should be real DOM/SVG or controlled texture labels, not text baked into a final full-screen illustration. Share the site navigation component; the generated pictograms vary slightly between frames and are not a navigation specification.
- Animate only while playing and visible. Pause on focus loss, offscreen exit or page visibility changes, and release captured pointers on cancel/blur.
- Reduced motion defaults to the still poster; if the visitor explicitly plays, suppress parallax, shake, pulsing and particle trails, and use immediate or gentle camera steps.
- Target one lightweight scene, a texture atlas, reusable low-poly meshes, baked shadows where possible and pooled particles. Proposed targets, not measured results: 1–3 MB compressed game art after activation, capped device pixel ratio, and 30 fps on modest phones / 60 fps where available; profile before promising these.
- Moon Planet uses analytic radial physics rather than a general physics dependency. Stack uses a constrained balance model; a full rigid-body engine is optional only after cost review and owner approval for a heavy dependency.
- Keyboard equivalents: Moon A/D, Space or up to jump, down to stomp; Stack A/D to counterlean, Space to release; Escape pauses either. Provide visible instructions, accessible names, focus indicators and state announcements through final approved German strings.
- Art direction preserves short dark hair, stubble and black tee across both games. The images are painted 3D targets; final meshes should retain soft paper grain rather than reproduce every high-frequency painted fleck as geometry.

## Validation and retained drafts

Every generated image was visually inspected for composition, text, character anatomy and brand consistency. Two targeted edits corrected the desktop radial stomp and increased the near-collapse lean; the initial versions are retained only in rejects/. File decoding verified all nine PNGs: seven desktop images are 1672 × 941 (approximately 16:9); Moon mobile is 853 × 1844 and Stack mobile is 852 × 1846 (approximately 9:19.5).

This handoff does not change site code, install dependencies or deploy anything. The final screens still require implementation-time UI alignment, final copy replacement and device testing.

## Favorite

[08-stack-to-moon-reached-moon-desktop.png](08-stack-to-moon-reached-moon-desktop.png): the unfolded paper bridge makes the win condition tangible while naturally connecting the dev-tool stack to the brand's moon.

