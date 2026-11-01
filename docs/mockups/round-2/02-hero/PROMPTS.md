# Hero image prompts

Engine: built-in image_gen.imagegen. No CLI fallback, package installs, HTML screenshots, or external image sourcing. transparent_background=false for every call. Quality requested in the prompt; the built-in tool exposes no separate quality setting.

References: the Nachtstudio banner supplies palette, pigment, wordmark and scene identity; profil-buttergelb.png supplies owner likeness. Generated images used as references maintain composition and character continuity. All references were visually inspected. No new public prose was generated.

## 01-paper-lightbox-desktop.png

Reference images, in tool order:
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
- `D:/repos/Solo Stack/branding/final-branding-assets/profil-buttergelb.png`

Exact generation prompt:

```text
Use case: ui-mockup. Create a highest-quality original raster image of a real website HERO for Solo Stack, 20:00 moonrise. Art direction based on the supplied Nachtstudio banner: tactile watercolor paper, butter-yellow light, warm anthracite pigments, ochre blooms, tiny cream stars. The portrait reference is identity guidance for a drawn adult owner with short dark hair, light stubble, calm friendly expression, black crew-neck tee. Original illustration only. Art dominates; no cards grid, no stock UI, no neon, no blue or purple. Beautiful visible paper fibers and imperfect pigment edges. Only approved existing text: "SOLO STACK" and "20:00"; no other words, captions, watermarks or invented copy. Minimal navigation uses a small two-line menu icon at upper right and discreet play-triangle link, with a thin downward arrow near the bottom. Wordmark in heavy geometric sans like the reference, crisply legible. This is a design concept, not a rendered production webpage.
Asset: 01-paper-lightbox-desktop.png. Exact 16:9 desktop composition, ideally 2560x1440. Full bleed landscape reconstructed as EIGHT layers of physically cut hand-painted watercolor paper, recessed into a shallow luminous paper theatre: rear star-sky; circular moon emitter; far jagged mountains; soft middle hills; angular projecting cliff; owner with open laptop; near grass; corner branches. Genuine bevel-free cut paper edges, narrow soft cast shadows, depth achievable by eight flat planes. Giant softly luminous moon at right-center behind landscape, moonlight catching fibers and tiny suspended dust, a single fine shooting star upper right. Owner seated naturally on cliff at right with laptop on knees, two arms and two legs, small warm laptop glow across his face. Cliff projects from lower right toward center. The upper left opens into deep warm charcoal sky with a broad butter-yellow wash at far left bleeding delicately into night. Extremely large two-line SOLO / STACK wordmark left-center in warm ivory, takes around 40% width; illustration still commands the screen. Tiny 20:00 upper left aligned to wordmark. Foreground branches only at outer edges, preserve legibility. Calm yet spectacular museum-quality paper lightbox, not a boxed product photo, no device frame.
```

Final correction input first: `C:/Users/peter/.codex/generated_images/01a194a5-19e4-7e92-81b5-5767b9325e6f/exec-5e7c2ed8-b981-4aef-a632-e16fd45c01d7.png`, followed by the two brand references above.

Exact corrective edit prompt:

```text
Change only the material treatment and character style while retaining this exact layout, typography, palette, moon position and UI. Replace photorealistic man with an unmistakably hand-drawn watercolor chibi-adult mascot of the reference owner: slightly oversized head, short dark hair, short stubble, black tee, ink contours, softly simplified face, two arms and two legs. Absolutely no photographic human skin or clothing. Replace realistic mountain forests, rocks, water and detailed 3D foliage with eight CLEARLY SEPARATED flat, die-cut painted paper silhouettes: straight flat cut faces with 1mm fibrous edges and soft gaps of shadow, simplified broad mountain and hill shapes. Cliff is one cut watercolor-paper plane. Foreground grass and branches are flat silhouettes. The entire landscape must look like a handmade eight-layer shadowbox achievable using flat textured planes, not a natural photography landscape. Tiny moonlit dust visible in front of moon. Keep wordmark readable, shrink 20:00 to a genuinely small monospace clock label. Output same 16:9 desktop image.
```

Retained original: `C:\Users\peter\.codex\generated_images\01a194a5-19e4-7e92-81b5-5767b9325e6f\exec-e678017e-2163-4611-9c93-5577285ac535.png`

## 02-paper-lightbox-mobile.png

Reference images, in tool order:
- `D:/repos/solo-stack-web/docs/mockups/round-2/02-hero/01-paper-lightbox-desktop.png`
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
- `D:/repos/Solo Stack/branding/final-branding-assets/profil-buttergelb.png`

Exact generation prompt:

```text
Use case: ui-mockup. Create a highest-quality original raster image of a real website HERO for Solo Stack, 20:00 moonrise. Art direction based on the supplied Nachtstudio banner: tactile watercolor paper, butter-yellow light, warm anthracite pigments, ochre blooms, tiny cream stars. The portrait reference is identity guidance for a drawn adult owner with short dark hair, light stubble, calm friendly expression, black crew-neck tee. Original illustration only. Art dominates; no cards grid, no stock UI, no neon, no blue or purple. Beautiful visible paper fibers and imperfect pigment edges. Only approved existing text: "SOLO STACK" and "20:00"; no other words, captions, watermarks or invented copy. Minimal navigation uses a small two-line menu icon at upper right and discreet play-triangle link, with a thin downward arrow near the bottom. Wordmark in heavy geometric sans like the reference, crisply legible. This is a design concept, not a rendered production webpage.
Character must always be an unmistakable drawn watercolor mascot with ink outlines, slightly enlarged head, simplified face and dark short hair/stubble, never a photographic man. No realistic skin photography. Keep soft yellow laptop-screen light on face. Clock is genuinely tiny.
Exact 9:19.5 portrait mobile composition, ideally 1080x2340. Recompose the eight-layer cut watercolor-paper theatre from the desktop concept for a narrow tall screen. Large two-line SOLO / STACK wordmark fills the upper quarter, beneath tiny 20:00, menu icon top right. A huge luminous butter moon occupies the middle third, far mountains and successive mid hills wrap below it. In the lower half the friendly owner sits on a projecting cliff from the right with a glowing laptop on his knees, face lit warmly; near grass and cut branches bracket the bottom corners. Separate thick paper contours and deep soft shadows, stars and dust, one shooting star. Foreground landscape and lettering must remain uncluttered, keep all navigation inside generous 7% safe margins. Desktop sibling is visual continuity input, not a layout to crop. IMPORTANT OUTPUT CANVAS: narrow tall 6:13 ratio, equivalent to 9:19.5. Output width 768 and height 1664 or proportionally larger. Not the usual 9:16 portrait. Extend generous sky and bottom artwork to make the taller ratio; do not stretch characters.
```

Retained original: `C:\Users\peter\.codex\generated_images\01a194a5-19e4-7e92-81b5-5767b9325e6f\exec-7148f01b-b30b-4a4c-a49e-53f2faafb988.png`

## 03-paper-lightbox-exploded.png

Reference images, in tool order:
- `D:/repos/solo-stack-web/docs/mockups/round-2/02-hero/01-paper-lightbox-desktop.png`
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
- `D:/repos/Solo Stack/branding/final-branding-assets/profil-buttergelb.png`

Exact generation prompt:

```text
Use case: ui-mockup. Create a highest-quality original raster image of a real website HERO for Solo Stack, 20:00 moonrise. Art direction based on the supplied Nachtstudio banner: tactile watercolor paper, butter-yellow light, warm anthracite pigments, ochre blooms, tiny cream stars. The portrait reference is identity guidance for a drawn adult owner with short dark hair, light stubble, calm friendly expression, black crew-neck tee. Original illustration only. Art dominates; no cards grid, no stock UI, no neon, no blue or purple. Beautiful visible paper fibers and imperfect pigment edges. Only approved existing text: "SOLO STACK" and "20:00"; no other words, captions, watermarks or invented copy. Minimal navigation uses a small two-line menu icon at upper right and discreet play-triangle link, with a thin downward arrow near the bottom. Wordmark in heavy geometric sans like the reference, crisply legible. This is a design concept, not a rendered production webpage.
Character must always be an unmistakable drawn watercolor mascot with ink outlines, slightly enlarged head, simplified face and dark short hair/stubble, never a photographic man. No realistic skin photography. Keep soft yellow laptop-screen light on face. Clock is genuinely tiny.
Use case: infographic-diagram, build reference. Wide 16:9 art-director exploded axonometric diagram of the eight layers used by the paper-cut desktop concept, on warm off-white paper. Eight distinct parallel portrait-less rectangular scene planes with natural cut silhouettes float separated in depth from rear upper-left to front lower-right, clearly visible gaps and registration guide lines. Layer 01 rear anthracite star sky rectangle; 02 glowing yellow moon disc in a transparent plane; 03 far mountains; 04 mid hills; 05 projecting dark cliff; 06 adult owner seated with laptop aligned to cliff; 07 near grasses; 08 edge branches. Render watercolor painted cutouts, transparent regions truly visually empty, all in a coherent aligned assembly. Add ONLY small technical numerals 01 through 08 adjacent to their corresponding layers; do not add normal navigation or wordmark, this is an internal exploded construction drawing. Small assembled scene inset top right showing how the layers make the hero. Large planes and unambiguous depth, realistic paper edge shadows. Technical interpretation: reference for Threlte planes, not fully modeled terrain.
```

Retained original: `C:\Users\peter\.codex\generated_images\01a194a5-19e4-7e92-81b5-5767b9325e6f\exec-fe89bb8f-d617-4e37-84d0-778f81cd74af.png`

## 04-paper-lightbox-mouse-tilt.png

Reference images, in tool order:
- `D:/repos/solo-stack-web/docs/mockups/round-2/02-hero/01-paper-lightbox-desktop.png`
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
- `D:/repos/Solo Stack/branding/final-branding-assets/profil-buttergelb.png`

Exact generation prompt:

```text
Use case: ui-mockup. Create a highest-quality original raster image of a real website HERO for Solo Stack, 20:00 moonrise. Art direction based on the supplied Nachtstudio banner: tactile watercolor paper, butter-yellow light, warm anthracite pigments, ochre blooms, tiny cream stars. The portrait reference is identity guidance for a drawn adult owner with short dark hair, light stubble, calm friendly expression, black crew-neck tee. Original illustration only. Art dominates; no cards grid, no stock UI, no neon, no blue or purple. Beautiful visible paper fibers and imperfect pigment edges. Only approved existing text: "SOLO STACK" and "20:00"; no other words, captions, watermarks or invented copy. Minimal navigation uses a small two-line menu icon at upper right and discreet play-triangle link, with a thin downward arrow near the bottom. Wordmark in heavy geometric sans like the reference, crisply legible. This is a design concept, not a rendered production webpage.
Character must always be an unmistakable drawn watercolor mascot with ink outlines, slightly enlarged head, simplified face and dark short hair/stubble, never a photographic man. No realistic skin photography. Keep soft yellow laptop-screen light on face. Clock is genuinely tiny.
Exact 16:9 desktop interaction frame of the same paper-cut lightbox hero in its mouse-tilt parallax state. Preserve wordmark and tiny 20:00 fixed and perfectly upright in screen space. Cursor small white arrow near right edge. Scene behind type tilts very subtly approximately 4 degrees toward cursor; distinct eight flat watercolor-paper layers shift different amounts, foreground cliff and branches shift most while moon and sky shift least. Show visible revealed gaps and offset soft shadows between foreground grass, cliff, hills and mountains, without changing illustration identity or removing the owner and glowing laptop. Large moon glows behind owner on right, dust in shafts, shooting star. This is a single finished website screen with believable restrained depth, NOT exploded, not diagrams, no instructional words or arrows besides navigation and cursor.
```

Retained original: `C:\Users\peter\.codex\generated_images\01a194a5-19e4-7e92-81b5-5767b9325e6f\exec-b789520d-aeb2-4075-8a35-6c951e20533f.png`

## 05-painted-moon-desktop.png

Reference images, in tool order:
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
- `D:/repos/Solo Stack/branding/final-branding-assets/profil-buttergelb.png`

Exact generation prompt:

```text
Use case: ui-mockup. Create a highest-quality original raster image of a real website HERO for Solo Stack, 20:00 moonrise. Art direction based on the supplied Nachtstudio banner: tactile watercolor paper, butter-yellow light, warm anthracite pigments, ochre blooms, tiny cream stars. The portrait reference is identity guidance for a drawn adult owner with short dark hair, light stubble, calm friendly expression, black crew-neck tee. Original illustration only. Art dominates; no cards grid, no stock UI, no neon, no blue or purple. Beautiful visible paper fibers and imperfect pigment edges. Only approved existing text: "SOLO STACK" and "20:00"; no other words, captions, watermarks or invented copy. Minimal navigation uses a small two-line menu icon at upper right and discreet play-triangle link, with a thin downward arrow near the bottom. Wordmark in heavy geometric sans like the reference, crisply legible. This is a design concept, not a rendered production webpage.
Character must always be an unmistakable drawn watercolor mascot with ink outlines, slightly enlarged head, simplified face and dark short hair/stubble, never a photographic man. No realistic skin photography. Keep soft yellow laptop-screen light on face. Clock is genuinely tiny.
Exact 16:9 desktop hero. Art direction A Painted night. An enormous three-dimensional spherical moon shaded entirely in real watercolor washes enters from the RIGHT: its center is almost at the right screen edge so about half of the sphere is off-screen, diameter larger than viewport height. Its visible crescent of shadow wraps with convincing volume, craters are pigment blooms and tide marks, never realistic gray lunar photography, never smooth plastic CGI. The warm butter-yellow illuminated body dominates 65% of image. Huge dark anthracite SOLO / STACK wordmark runs across the middle in FRONT of the moon, with lettering over dark sky rendered ivory so fully readable. A small drawn owner with short dark hair and stubble sits naturally on upper-left moon rim, black tee, open laptop glowing warmly, small enough to reveal monumental scale, clear anatomy. Sparse hand-inked stars and a single shooting star in left dark watercolor sky. At lower left integrate a tiny tasteful torn-paper painted portrait cameo from the reference owner, not a generic UI card; optional only if composition remains clean. Tiny 20:00 at top left; icon navigation, one simple four-dot phase indicator at lower right. Almost poster-like scale and dramatic asymmetric typography; calm premium material.
```

Retained original: `C:\Users\peter\.codex\generated_images\01a194a5-19e4-7e92-81b5-5767b9325e6f\exec-e5a4a25e-6d96-4ebd-8b11-d5d7881cce0d.png`

## 06-painted-moon-mobile.png

Reference images, in tool order:
- `C:\Users\peter\.codex\generated_images\01a194a5-19e4-7e92-81b5-5767b9325e6f\exec-e5a4a25e-6d96-4ebd-8b11-d5d7881cce0d.png`
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
- `D:/repos/Solo Stack/branding/final-branding-assets/profil-buttergelb.png`

Exact generation prompt:

```text
Use case: ui-mockup. Create a highest-quality original raster image of a real website HERO for Solo Stack, 20:00 moonrise. Art direction based on the supplied Nachtstudio banner: tactile watercolor paper, butter-yellow light, warm anthracite pigments, ochre blooms, tiny cream stars. The portrait reference is identity guidance for a drawn adult owner with short dark hair, light stubble, calm friendly expression, black crew-neck tee. Original illustration only. Art dominates; no cards grid, no stock UI, no neon, no blue or purple. Beautiful visible paper fibers and imperfect pigment edges. Only approved existing text: "SOLO STACK" and "20:00"; no other words, captions, watermarks or invented copy. Minimal navigation uses a small two-line menu icon at upper right and discreet play-triangle link, with a thin downward arrow near the bottom. Wordmark in heavy geometric sans like the reference, crisply legible. This is a design concept, not a rendered production webpage.
Character must always be an unmistakable drawn watercolor mascot with ink outlines, slightly enlarged head, simplified face and dark short hair/stubble, never a photographic man. No realistic skin photography. Keep soft yellow laptop-screen light on face. Clock is genuinely tiny.
Exact 9:19.5 mobile hero, ideally 1080x2340. Tall canvas not device photo. Huge watercolor-shaded moon enters the RIGHT edge, center near right edge, half offscreen; moon occupies middle/lower two-thirds of screen. REAL pigment-bloom craters and curved soft spherical shade. Dark warm watercolor sky, sparse stars, single shooting star. Heavy two-line SOLO / STACK wordmark upper/middle foreground in warm ivory, readable where it overlaps the moon via a restrained dark ink backing wash. A drawn adult owner matching photo, short dark hair, stubble, black tee, sits on moon rim below lettering with glowing laptop. Tiny 20:00 upper left, simple menu top right, minimal play icon lower left and four tiny moon-phase dots near bottom, generously spaced touch targets. Recompose desktop moon concept for tall screen, no cards, no device frame. IMPORTANT OUTPUT CANVAS: narrow tall 6:13 ratio, equivalent to 9:19.5. Output width 768 and height 1664 or proportionally larger. Not the usual 9:16 portrait. Extend generous sky and bottom artwork to make the taller ratio; do not stretch characters.
```

Retained original: `C:\Users\peter\.codex\generated_images\01a194a5-19e4-7e92-81b5-5767b9325e6f\exec-a7e3fc9e-824c-4e4d-9d44-2b80f7da5fbf.png`

## 07-painted-moon-phase-strip.png

Reference images, in tool order:
- `C:\Users\peter\.codex\generated_images\01a194a5-19e4-7e92-81b5-5767b9325e6f\exec-e5a4a25e-6d96-4ebd-8b11-d5d7881cce0d.png`

Exact generation prompt:

```text
Create an INTERNAL ART-DIRECTION CONTACT SHEET, not a single hero. A warm off-white landscape 16:9 sheet containing EXACTLY FOUR SMALL SEPARATE WEBSITE SCREENSHOTS in ONE HORIZONTAL ROW through its center, with broad blank paper margins above and below. Each of the four small frames is 16:9. Each frame has a thin border and clear white gutter; all four must be visible. Use supplied image as reference for painting style and website identity. Same giant watercolor moon cropped by right edge of each little frame, same tiny laptop owner, same SOLO STACK wordmark across center and tiny 20:00. Change the moon phase left to right: FRAME ONE thin yellow crescent with 85% of moon dark; FRAME TWO half moon with 50% dark; FRAME THREE gibbous with 20% dark; FRAME FOUR full moon with 0% dark. A small curved arrow in the blank gutter between frames indicates repeated clicking. Tiny technical numerals 01,02,03,04 under corresponding frames allowed. Absolutely must show FOUR DISTINCT PANELS, not one wide continuous moon. Palette only butter yellow, warm anthracite and cotton paper. Pigment-bloom crater texture. Main objective is comparing four clearly different illumination states.
```

Retained original: `C:\Users\peter\.codex\generated_images\01a194a5-19e4-7e92-81b5-5767b9325e6f\exec-f21a04ee-034b-41aa-a2db-882140450bcc.png`

## 08-painted-live-desktop.png

Reference images, in tool order:
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
- `D:/repos/Solo Stack/branding/final-branding-assets/profil-buttergelb.png`

Exact generation prompt:

```text
Use case: ui-mockup. Create a highest-quality original raster image of a real website HERO for Solo Stack, 20:00 moonrise. Art direction based on the supplied Nachtstudio banner: tactile watercolor paper, butter-yellow light, warm anthracite pigments, ochre blooms, tiny cream stars. The portrait reference is identity guidance for a drawn adult owner with short dark hair, light stubble, calm friendly expression, black crew-neck tee. Original illustration only. Art dominates; no cards grid, no stock UI, no neon, no blue or purple. Beautiful visible paper fibers and imperfect pigment edges. Only approved existing text: "SOLO STACK" and "20:00"; no other words, captions, watermarks or invented copy. Minimal navigation uses a small two-line menu icon at upper right and discreet play-triangle link, with a thin downward arrow near the bottom. Wordmark in heavy geometric sans like the reference, crisply legible. This is a design concept, not a rendered production webpage.
Character must always be an unmistakable drawn watercolor mascot with ink outlines, slightly enlarged head, simplified face and dark short hair/stubble, never a photographic man. No realistic skin photography. Keep soft yellow laptop-screen light on face. Clock is genuinely tiny.
Exact 16:9 desktop hero, final frame of a live painted-on-load concept. A wet-in-wet watercolor landscape from the banner emerges directly in cotton paper: glowing yellow moon low behind a black ink cliff on right; warm anthracite pigment night spreads from right toward buttery paper left in gorgeous cauliflower blooms and backruns, with dry-brush white flecks and ink stars. Friendly drawn owner matching supplied portrait sits on cliff with open glowing laptop. Large two-line SOLO / STACK wordmark at left center in deep charcoal on warm yellow paper. Thin hand-drawn rock contour lines contrast soft washes. FINAL cursor-pigment-trail state: tiny arrow cursor near center-bottom leaves a delicate short arcing trail of semi-transparent ochre pigment puddles blooming in paper, 3-5 fading soft marks only, do not obscure type or face. Tiny 20:00 upper left, icon menu upper right, play symbol and scroll arrow. Exuberant real brushwork, strong banner identity, no 3D paper layering in this variant.
```

Retained original: `C:\Users\peter\.codex\generated_images\01a194a5-19e4-7e92-81b5-5767b9325e6f\exec-69f0aac4-e8ba-48a3-ad75-d52cae29477a.png`

## 09-painted-live-mobile.png

Reference images, in tool order:
- `C:\Users\peter\.codex\generated_images\01a194a5-19e4-7e92-81b5-5767b9325e6f\exec-69f0aac4-e8ba-48a3-ad75-d52cae29477a.png`
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
- `D:/repos/Solo Stack/branding/final-branding-assets/profil-buttergelb.png`

Exact generation prompt:

```text
Use case: ui-mockup. Create a highest-quality original raster image of a real website HERO for Solo Stack, 20:00 moonrise. Art direction based on the supplied Nachtstudio banner: tactile watercolor paper, butter-yellow light, warm anthracite pigments, ochre blooms, tiny cream stars. The portrait reference is identity guidance for a drawn adult owner with short dark hair, light stubble, calm friendly expression, black crew-neck tee. Original illustration only. Art dominates; no cards grid, no stock UI, no neon, no blue or purple. Beautiful visible paper fibers and imperfect pigment edges. Only approved existing text: "SOLO STACK" and "20:00"; no other words, captions, watermarks or invented copy. Minimal navigation uses a small two-line menu icon at upper right and discreet play-triangle link, with a thin downward arrow near the bottom. Wordmark in heavy geometric sans like the reference, crisply legible. This is a design concept, not a rendered production webpage.
Character must always be an unmistakable drawn watercolor mascot with ink outlines, slightly enlarged head, simplified face and dark short hair/stubble, never a photographic man. No realistic skin photography. Keep soft yellow laptop-screen light on face. Clock is genuinely tiny.
Exact 9:19.5 mobile hero final frame, ideally 1080x2340. Hand-painted live watercolor composition: top half butter-yellow cotton paper with big charcoal SOLO / STACK wordmark, tiny 20:00 top left and menu icon top right. An irregular diagonal ink-and-pigment tide edge bleeds across center into warm anthracite night in lower half; luminous moon rises behind a cliff at lower right, adult owner matching portrait sits with laptop and warm glow. Real fine ink drawing, pigment granulation, a few stars and one shooting star. Small touch point low center with a short fading ochre watercolor trail, showing optional tap pigment response instead of a mouse. Art fills screen, safe margins, no card or device frame, one minimal play icon and down arrow. Same identity as desktop but intentional vertical layout. IMPORTANT OUTPUT CANVAS: narrow tall 6:13 ratio, equivalent to 9:19.5. Output width 768 and height 1664 or proportionally larger. Not the usual 9:16 portrait. Extend generous sky and bottom artwork to make the taller ratio; do not stretch characters.
```

Retained original: `C:\Users\peter\.codex\generated_images\01a194a5-19e4-7e92-81b5-5767b9325e6f\exec-1bdd2633-ac5f-4cf9-a3a1-8b7c3a92fba9.png`

## 10-painted-live-storyboard-desktop.png

Reference images, in tool order:
- `C:\Users\peter\.codex\generated_images\01a194a5-19e4-7e92-81b5-5767b9325e6f\exec-69f0aac4-e8ba-48a3-ad75-d52cae29477a.png`
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
- `D:/repos/Solo Stack/branding/final-branding-assets/profil-buttergelb.png`

Exact generation prompt:

```text
Use case: ui-mockup. Create a highest-quality original raster image of a real website HERO for Solo Stack, 20:00 moonrise. Art direction based on the supplied Nachtstudio banner: tactile watercolor paper, butter-yellow light, warm anthracite pigments, ochre blooms, tiny cream stars. The portrait reference is identity guidance for a drawn adult owner with short dark hair, light stubble, calm friendly expression, black crew-neck tee. Original illustration only. Art dominates; no cards grid, no stock UI, no neon, no blue or purple. Beautiful visible paper fibers and imperfect pigment edges. Only approved existing text: "SOLO STACK" and "20:00"; no other words, captions, watermarks or invented copy. Minimal navigation uses a small two-line menu icon at upper right and discreet play-triangle link, with a thin downward arrow near the bottom. Wordmark in heavy geometric sans like the reference, crisply legible. This is a design concept, not a rendered production webpage.
Character must always be an unmistakable drawn watercolor mascot with ink outlines, slightly enlarged head, simplified face and dark short hair/stubble, never a photographic man. No realistic skin photography. Keep soft yellow laptop-screen light on face. Clock is genuinely tiny.
Use case: illustration-story. Three-frame animation storyboard as a horizontal triptych, each panel exactly landscape 16:9, overall 16:3 strip. Same fixed composition and typography in each frame: desktop hero wordmark SOLO / STACK at left, tiny 20:00 at top left, fixed menu at top right, cliff and owner will be on right. Frame 1: cotton paper and butter pigment blooms spreading out from the left, first soft anthracite water edges at far right, wordmark already visible and functional. Frame 2: anthracite pigment spreads across right half; a thin black ink stroke is visibly halfway through tracing cliff contour and owner with laptop, some forms are unfinished linework; lower half of moon first appears at horizon. Frame 3: completed watercolor night, yellow moon now fully raised behind cliff, owner fully painted with glowing laptop, stars appearing. Beautiful progressive continuity, exactly the SAME scene, camera, typography and alignment in all frames. Do not add frame captions or timers. Clearly show three separate stages rather than three unrelated illustrations.
```

Retained original: `C:\Users\peter\.codex\generated_images\01a194a5-19e4-7e92-81b5-5767b9325e6f\exec-fa07926e-fcdf-41ab-a892-50501276cf34.png`

## 11-painted-live-storyboard-mobile.png

Reference images, in tool order:
- `C:\Users\peter\.codex\generated_images\01a194a5-19e4-7e92-81b5-5767b9325e6f\exec-1bdd2633-ac5f-4cf9-a3a1-8b7c3a92fba9.png`
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
- `D:/repos/Solo Stack/branding/final-branding-assets/profil-buttergelb.png`

Exact generation prompt:

```text
Use case: ui-mockup. Create a highest-quality original raster image of a real website HERO for Solo Stack, 20:00 moonrise. Art direction based on the supplied Nachtstudio banner: tactile watercolor paper, butter-yellow light, warm anthracite pigments, ochre blooms, tiny cream stars. The portrait reference is identity guidance for a drawn adult owner with short dark hair, light stubble, calm friendly expression, black crew-neck tee. Original illustration only. Art dominates; no cards grid, no stock UI, no neon, no blue or purple. Beautiful visible paper fibers and imperfect pigment edges. Only approved existing text: "SOLO STACK" and "20:00"; no other words, captions, watermarks or invented copy. Minimal navigation uses a small two-line menu icon at upper right and discreet play-triangle link, with a thin downward arrow near the bottom. Wordmark in heavy geometric sans like the reference, crisply legible. This is a design concept, not a rendered production webpage.
Character must always be an unmistakable drawn watercolor mascot with ink outlines, slightly enlarged head, simplified face and dark short hair/stubble, never a photographic man. No realistic skin photography. Keep soft yellow laptop-screen light on face. Clock is genuinely tiny.
Use case: illustration-story. Internal animation storyboard of THREE tall MOBILE 9:19.5 frames side by side, thin warm off-white gutters, overall approximately 18:13 landscape sheet. Every frame identical mobile arrangement: SOLO / STACK near upper quarter, small 20:00 top left, menu top right, lower-half moon and cliff. Stage 1 left: butter paper and soft spreading pigment blooms, type already visible. Stage 2 middle: charcoal pigment tide spreading down, ink pen line drawing cliff from right, owner and laptop partially outlined, lower moon edge emerging behind horizon. Stage 3 right: finished dark lower night with moon risen, fully painted owner with laptop on cliff, a short optional tap-pigment bloom at lower center. Same composition across all three. Paper grain and watercolor backruns visible. No captions or extra text, not device mockups.
```

Retained original: `C:\Users\peter\.codex\generated_images\01a194a5-19e4-7e92-81b5-5767b9325e6f\exec-f6417f37-198f-409a-808d-4017182b1006.png`

## 12-bonus-moon-tear-desktop.png

Reference images, in tool order:
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
- `D:/repos/Solo Stack/branding/final-branding-assets/profil-buttergelb.png`

Exact generation prompt:

```text
Use case: ui-mockup. Create a highest-quality original raster image of a real website HERO for Solo Stack, 20:00 moonrise. Art direction based on the supplied Nachtstudio banner: tactile watercolor paper, butter-yellow light, warm anthracite pigments, ochre blooms, tiny cream stars. The portrait reference is identity guidance for a drawn adult owner with short dark hair, light stubble, calm friendly expression, black crew-neck tee. Original illustration only. Art dominates; no cards grid, no stock UI, no neon, no blue or purple. Beautiful visible paper fibers and imperfect pigment edges. Only approved existing text: "SOLO STACK" and "20:00"; no other words, captions, watermarks or invented copy. Minimal navigation uses a small two-line menu icon at upper right and discreet play-triangle link, with a thin downward arrow near the bottom. Wordmark in heavy geometric sans like the reference, crisply legible. This is a design concept, not a rendered production webpage.
Character must always be an unmistakable drawn watercolor mascot with ink outlines, slightly enlarged head, simplified face and dark short hair/stubble, never a photographic man. No realistic skin photography. Keep soft yellow laptop-screen light on face. Clock is genuinely tiny.
Exact 16:9 desktop HERO. Bonus concept: THE NIGHT TEARS OPEN. A monumental vertical jagged tear through butter-yellow watercolor paper reveals a recessed anthracite night world; the exposed bright paper curls outward into the form of a vast luminous crescent moon, moonlight glowing through its fibrous torn edge. The tear stretches diagonally from upper center to lower right, asymmetrical sculptural gesture occupying two-thirds of screen. Inside the dark opening, a tiny original watercolor adult owner with short dark hair and stubble calmly codes on laptop on a thin ink cliff/ledge, laptop lights his face. Stars and sparse moonlit dust tucked into the opening; a shooting star crosses the tear. Huge heavy geometric charcoal SOLO / STACK wordmark fills left foreground on the butter paper, edge of K overlaps opening in ivory. Tiny 20:00 elegant top left; minimal menu top right, discreet play and down arrow. Original artistic poster crossed with tactile web hero, more daring than the basic moon. No generic portal ring, no sci-fi, no blue, no ornate frame. Visible irregular raw fibers and ochre watercolor blooms, warm and cozy despite monumental scale. Three to five plausible sculptural planes, no arbitrary complex city.
```

Retained original: `C:\Users\peter\.codex\generated_images\01a194a5-19e4-7e92-81b5-5767b9325e6f\exec-44574004-54ec-4c6b-850d-e503eca7fe99.png`

## 13-bonus-moon-tear-mobile.png

Reference images, in tool order:
- `C:\Users\peter\.codex\generated_images\01a194a5-19e4-7e92-81b5-5767b9325e6f\exec-44574004-54ec-4c6b-850d-e503eca7fe99.png`
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
- `D:/repos/Solo Stack/branding/final-branding-assets/profil-buttergelb.png`

Exact generation prompt:

```text
Use case: ui-mockup. Create a highest-quality original raster image of a real website HERO for Solo Stack, 20:00 moonrise. Art direction based on the supplied Nachtstudio banner: tactile watercolor paper, butter-yellow light, warm anthracite pigments, ochre blooms, tiny cream stars. The portrait reference is identity guidance for a drawn adult owner with short dark hair, light stubble, calm friendly expression, black crew-neck tee. Original illustration only. Art dominates; no cards grid, no stock UI, no neon, no blue or purple. Beautiful visible paper fibers and imperfect pigment edges. Only approved existing text: "SOLO STACK" and "20:00"; no other words, captions, watermarks or invented copy. Minimal navigation uses a small two-line menu icon at upper right and discreet play-triangle link, with a thin downward arrow near the bottom. Wordmark in heavy geometric sans like the reference, crisply legible. This is a design concept, not a rendered production webpage.
Character must always be an unmistakable drawn watercolor mascot with ink outlines, slightly enlarged head, simplified face and dark short hair/stubble, never a photographic man. No realistic skin photography. Keep soft yellow laptop-screen light on face. Clock is genuinely tiny.
Exact 9:19.5 MOBILE HERO, ideally 1080x2340. Bonus NIGHT TEARS OPEN, adapted to tall screen. Warm butter-yellow pigment cotton paper fills screen; enormous ragged crescent-shaped tear opens from middle-left toward bottom-right, curling illuminated fibrous paper edge around a deep warm anthracite watercolor night. Huge charcoal SOLO / STACK wordmark in upper quarter, tiny 20:00 upper left and menu upper right. In the lower two-thirds inside torn crescent opening, tiny friendly adult owner matching supplied portrait sits on a cliff ledge with warm glowing laptop. A handful of stars, one shooting star and fine floating dust. Torn-paper moon is dramatically cropped by side edge and feels monumental, no bland centered circle. Subtle play icon at bottom left and down arrow clear of tear, safe margins. Same tactile material and moon-tear identity as desktop; original bold hand-crafted art, not a card or phone mockup. IMPORTANT OUTPUT CANVAS: narrow tall 6:13 ratio, equivalent to 9:19.5. Output width 768 and height 1664 or proportionally larger. Not the usual 9:16 portrait. Extend generous sky and bottom artwork to make the taller ratio; do not stretch characters.
```

Retained original: `C:\Users\peter\.codex\generated_images\01a194a5-19e4-7e92-81b5-5767b9325e6f\exec-d415f146-7ef2-4d7c-948b-e4b811ca9b72.png`

