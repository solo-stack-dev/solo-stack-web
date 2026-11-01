# 21:00 — WHAT I MAKE

Round 2 design handoff. Twelve final generated PNG mockups, created with the built-in image generation tool and visually reviewed. These are image concepts, not a running website or animation. No packages, application code, or sibling folders were changed.

**Main pick:** [Ink morph in context](01-ink-morph-desktop-context.png). The continuous drawing makes the four content pillars feel like steps in one creative process, while the pigment and moon keep it unmistakably Solo Stack.

## Files and interaction

### 01-ink-morph-desktop-context.png
Full desktop section in its night setting: 21:00, the active phone state, paper grain, painted cliff and moon. Scroll scrubs the central ink drawing while the surrounding landscape stays still; the small pillar controls offer direct navigation. Build with one inline SVG path, masked watercolor assets and CSS positioning; allow **3–5 development days for the complete ink direction**, including mobile, path cleanup and accessibility.

### 02-storyboard-01-lightbulb.png
First desktop state: a bulb, a small pigment bloom and AI active. The line rises from the section baseline into the bulb, then its loop widens toward the prompt state as scrolling continues. Build as the first matched-point SVG path with a clipped wash; **about half a day of drawing and tuning**, included in the ink estimate.

### 02-storyboard-02-chat-prompt.png
Second state: the bulb becomes a prompt bubble and AI remains active. Hold the recognisable outline briefly, let the wash appear, then stretch the bubble into the code form. Build as the second compatible SVG path and a separate clipped pigment mask; **about half a day**, included in the ink estimate.

### 02-storyboard-03-code.png
Third state: CODE becomes active and the line forms a connected handwritten code symbol. Fine retraced connections keep the less-than, slash and greater-than shapes part of one drawing rather than three isolated objects. Build with the same SVG point topology and test the intermediate silhouettes; **half to one day**, included in the ink estimate.

### 02-storyboard-04-phone.png
Fourth state: SIDE PROJECTS is active and the line becomes a phone with one app tile. The pigment blooms inside the screen, making this the strongest moment to pause or directly select the pillar. Build with the fourth SVG path, a phone-shaped clipping mask and a small opacity/scale reveal for the wash; **about half a day**, included in the ink estimate.

### 02-storyboard-05-chart.png
Fifth state: BUSINESS is active and the phone unfolds into a rising chart. This is a symbolic subject icon, not a claim about channel income, users or performance. Build with the fifth SVG path and a watercolor mask below the rising line; **about half a day**, included in the ink estimate.

### 02-storyboard-06-moon.png
Sixth state: the chart folds into a crescent and BUSINESS remains the last active pillar. The crescent is an exit transition toward the next hour, not a fifth content pillar; its label fades only after this storyboard frame. Build with the sixth SVG path and a short section handoff driven by the same scroll progress; **about half a day**, included in the ink estimate.

### 03-ink-morph-mobile.png
Tall mobile phone-state composition with a two-by-two pillar selector and six small state markers. Use ordinary vertical scrolling and large touch targets; selecting a pillar jumps to its state without requiring a precise swipe or long pinned scroll. Build with the same SVG and a mobile viewBox/layout, targeting at least 44 CSS-pixel controls; **half to one day**, included in the ink estimate.

### 04-constellations-desktop.png
Four star-linked icons occupy one painted sky, with SIDE PROJECTS selected and exactly two paper-note example video previews beneath it. Stars appear in sequence, their connecting strokes draw, and the pigment follows; hover, focus or click opens the two previews without making the pointer cross a dismissal gap. Build with four SVG groups, stroke-dashoffset, small opacity transitions and normal HTML video links; **2–4 development days for this direction**, including mobile and keyboard behavior.

### 05-constellations-mobile.png
All four constellations remain visible in a staggered two-by-two arrangement, with two vertically stacked paper-note previews. A tap selects the pillar and opens its notes inline; the close control collapses them, and another pillar replaces the same note region. Build with the same SVG groups and responsive HTML, with no hover dependency; **half to one day**, included in the constellation estimate.

### 06-paper-folio-desktop.png
Alternative: one bound folio of four painted paper layers opens above the night ridge, with SIDE PROJECTS sliding forward in warm light. Each pillar moves its corresponding sheet forward and separates the stack, so the physical layers express the channel's range. Build first with four textured planes in CSS perspective and baked shadow/light textures; **3–5 development days**, or **5–7 with optional lazy Threlte depth and lighting**.

### 07-paper-folio-mobile.png
The folio becomes a tall composition with every sheet and label visible, preserving the binding thread and active yellow page. Tapping a paper front selects the pillar; reduce the depth and travel distance so the moving sheet never obstructs adjacent controls. Build with responsive CSS transforms and static painted layers, avoiding WebGL on the mobile baseline; **half to one day**, included in the folio estimate.

## Motion specification for the main pick

Read the six storyboard frames in filename order: lightbulb → chat prompt → code → phone → chart → moon. Suggested normalized anchors are 0.00, 0.18, 0.38, 0.58, 0.78 and 1.00, subject to testing with the surrounding homepage. Allow a short recognisable hold at each state, then interpolate smoothly; reverse scrolling reverses the drawing.

Use one authored SVG path with a single initial move command and compatible cubic segments across all six states. Trace/retrace interior details within that path; do not animate six separate icons by crossfade. The generated frames are visual targets, not mathematically validated path data: final vector authoring must unify the decorative prompt marks and phone details as well as the silhouette.

Keep the watercolor separate from the stroke. Reveal a small prepainted wash through each shape's clipping mask after the outline has mostly settled, and fade it during the next morph. Leave the sky texture static; do not run animated full-screen turbulence or perpetual particle systems.

The repeated wordmark and clock in the storyboard represent the same fixed composition at different times, not six consecutive website sections. The contextual frame includes the moon/cliff surroundings; the storyboard suppresses the background moon to make each morph state easier to judge.

## Performance and access

- Observe section visibility and update animation only while visible and scroll progress changes. No animation library is assumed.
- Use a compact shared paper texture, responsive optimized art and lazy offscreen image loading. These PNGs are review masters, not production transfer-size targets.
- With reduced motion, show the four pillars together with direct controls and static drawings; omit pinning, morphing, parallax and automatic star drawing.
- Keep labels and controls as real HTML. Generate all final visitor copy, alt text and accessible labels with gpt-6.1-sol, then route UI strings through Paraglide.
- The only intended mockup text is the supplied wordmark, clock, existing pillar names and TODO(copy). Example video art is illustrative and does not assert real published videos.
- Estimates assume one selected direction, existing site shell and final artwork preparation. They are rough engineering effort, not a financial quote or measured runtime budget.

## Art and generation record

The Nachtstudio banner was the material reference. The profile photograph was inspected for brand context, but no mascot appears in this section. Round 1 screenshots were inspected for contrast; none was used as an image generation reference.

[PROMPTS.md](PROMPTS.md) contains the exact prompts and reference paths for every generation and targeted revision. [generation-records.json](generation-records.json) is the machine-readable record. One disconnected-code attempt is retained in rejects/; all top-level PNGs are final selections.

Desktop exports are 1672 × 941, approximately 16:9. Ink mobile is 852 × 1847 and constellation mobile is 852 × 1846, approximately 9:19.5; the folio is a slightly taller 831 × 1891 page crop. Actual generation resolution is recorded here rather than claiming the preferred prompt dimensions.
