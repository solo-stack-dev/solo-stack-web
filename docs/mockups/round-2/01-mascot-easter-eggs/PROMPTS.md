# Generation prompts and references

Created 2026-11-01 using the built-in `image_gen.imagegen` tool. Every image used `transparent_background: false`. The tool exposes no explicit quality control; prompts request high-quality artwork. No HTML screenshots, image-editing scripts, external stock, or CLI/API fallback were used.

References were visually inspected before use. The shared brief and `docs/PROJECT.md` were read in full. The rejected round-one `docs/mockups/screenshots/01-nachtstudio_index.png` was inspected for contrast but was not passed as a generation reference.

Style B was selected after comparing the two explorations. Its stronger drawn facial structure and readable ink silhouette became the identity reference for the model sheet and all desktop scenes. The mobile composition uses the selected desktop bonsai scene plus style B. All prompts below are the exact submitted prompt strings; reference order is preserved. Generated images were inspected individually and copied unchanged into this folder. Text is limited to supplied brand/command tokens, error codes, clock labels, and browser UI; this is concept material, not approved publication copy.

## 01. 01-style-a-soft-watercolor.png

Reference images, in order:
- `D:/repos/Solo Stack/branding/final-branding-assets/profil-buttergelb.png`
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`

Exact prompt:

```text
Use case: stylized-concept. Asset: mascot exploration A for Solo Stack. Create a beautiful high-quality hand-painted character exploration on warm butter-yellow cotton watercolor paper, landscape 3:2, not a website. Image 1 is the owner's face identity reference; image 2 is the brand palette/material reference. Draw an ORIGINAL cozy storybook chibi adult man based closely on that photograph: short dark brown side-swept hair with trimmed sides, thick straight eyebrows, brown eyes, lightly stubbled adult jaw, friendly subtle asymmetric smile, black crew-neck tee, charcoal trousers, simple warm-white sneakers. Three-head-tall proportion, mature face simplified rather than baby/anime eyes. Softer exploration: delicate broken sepia ink, watercolor washes, soft bleeding edges, pigment granulation, lots of warm paper breathing space. Show one large full-body three-quarter standing mascot at left and two smaller vignettes at right: sitting with an open laptop on a small dark cliff; holding a ceramic coffee mug. Preserve identical face and proportions in all three. Natural hands and limbs. Calm, premium, affectionate. No text, labels, logos, copyrighted characters, frames, grids, shiny 3D render, or stock-art look. High detail visible paper, restrained butter-yellow light.
```

## 02. 02-style-b-crisp-ink.png

Reference images, in order:
- `D:/repos/Solo Stack/branding/final-branding-assets/profil-buttergelb.png`
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`

Exact prompt:

```text
Use case: stylized-concept. Asset: distinct mascot exploration B for Solo Stack. Image 1 is owner identity reference, image 2 brand palette and paper reference. Original DRAWN chibi adult man, NOT a photograph head pasted on cartoon. Bold lively variable-width dark ink lines, simplified shapes, expressive small almond eyes and brows, watercolor pigment fills on warm off-white paper with butter-yellow blooms. Keep recognizable short dark brown side-swept haircut with close sides, thick brows, modest nose, light stubble indicated with sparse ink dots, small friendly asymmetric smile. Three-head-tall compact silhouette, slightly oversized head but adult features. Black crew-neck tee, charcoal slim trousers, simple cream sneakers. Landscape 3:2 character study: large standing three-quarter figure at left; smaller vignette sitting on a cliff typing on laptop upper right; holding coffee lower right. Same character in all views. Crisper ink than soft storybook art, elegant handmade editorial illustration, clean readable silhouette suitable for a tiny game sprite, restrained hatch marks. Ink must visibly define face; no photoreal face or realistic portrait rendering. Natural hands, correct limbs. Warm paper everywhere. No labels, text, logos, copied characters, 3D, generic flat vectors, decorative framing.
```

## 03. 03-mascot-complete-model-sheet.png

Reference images, in order:
- `D:/repos/solo-stack-web/docs/mockups/round-2/01-mascot-easter-eggs/02-style-b-crisp-ink.png`

Exact prompt:

```text
Use case: stylized-concept. Create a complete professional character model sheet, high-resolution portrait 3:4, on warm ivory watercolor paper with subtle butter-yellow blooms. The input is the SELECTED mascot; preserve this EXACT drawn man's facial identity, short dark side-swept hair with close sides, thick eyebrows, almond brown eyes, light stubble, three-head-tall proportions, charcoal tee and trousers and cream sneakers. Original crisp ink and granular watercolor, absolutely no photoreal face. Four clearly separated rows with generous room, no boxes and NO TEXT:
Top row: FOUR full-body turnaround figures at equal scale and baseline: FRONT, LEFT SIDE profile, BACK, THREE-QUARTER front. Plain black crew-neck tee, charcoal trousers, cream shoes.
Second row: SIX expressive busts, left to right: calm small smile; focused coding brows with a laptop edge; thinking with finger at chin; laughing with closed smiling eyes; exhausted at 3am with half-lidded eyes holding coffee; determined with firm eyebrows, quiet confident smile. Keep same facial structure.
Third row: SIX full-body action poses, left to right: sitting on small dark cliff with laptop on lap; running with clear planted/pushing legs; airborne jumping with bent knees; holding ceramic coffee mug; lifting one small dumbbell with bent elbow, no exaggerated muscle; wearing over-ear dark headphones, relaxed with eyes closed. Each has correct hands and two arms/two legs.
Bottom row: TWO larger full-body variants: dark charcoal hooded sweatshirt with hood DOWN, same visible hair and face, warm moon rim light; GOLDEN SHINY variant of the same normal tee outfit, golden ochre tee/trousers and warm gold flecks, same dark hair and unchanged skin identity, delicate golden aura, no crowns or armor. These are rare palette variants, not new people.
Clean anatomy, uncluttered production layout, all 18 requested drawings visible and distinct, no objects cropped. Handcrafted premium character bible, ink edges readable at small size. No letters, captions, badges, logos, copyrighted characters or decorative symbols. Warm paper background throughout.
```

## 04. 04-egg-crescent-slash-desktop.png

Reference images, in order:
- `D:/repos/solo-stack-web/docs/mockups/round-2/01-mascot-easter-eggs/02-style-b-crisp-ink.png`
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`

Exact prompt:

```text
Use case: ui-mockup. Create one high-fidelity IMAGE-GENERATED desktop website screenshot concept, widescreen 16:9. Original art for Solo Stack personal developer homepage, one night in the studio. Reference image 1 locks the mascot design: use this EXACT crisp-ink chibi adult man with short side-swept dark hair, trimmed sides, thick brows, brown almond eyes, light stubble, black tee or dark hoodie, charcoal trousers, cream sneakers; identical friendly face and proportions. Reference image 2 locks the brand material: real watercolor pigment blooms and granular anthracite on warm cotton paper, butter-yellow light and ochre highlights. Art fills the entire screen edge to edge as a crafted scene; no card grids, vector landscape, flat dark background, generic landing page or glossy 3D. Readable minimal website chrome over the painting: small heavy geometric SOLO STACK wordmark top left; two quiet navigation marks and a three-line menu top right; tiny monospaced clock; a discreet arrow-only button where needed. Use ONLY supplied text/numbers; no invented prose, statistics, captions, or other logos. Preserve quiet usable negative space around UI. Original imagery only, no copied anime/game characters, symbols, costumes or famous compositions. All effects look hand-painted in ink and watercolor. High craft, beautiful composition, real paper visible, restrained warm moonlight, no neon or purple. Specific frame: crescent-moon secret at 20:00. A slim butter-yellow crescent hangs in the upper-right sky; a dramatic SINGLE sweeping BLACK CRESCENT ENERGY SLASH curves diagonally across the middle-upper night sky, sharply readable against a smoky warm gray watercolor cloud band, with thin warm gold edge, tapering ink tails and sparse droplets. It is a transient brushstroke through the sky, not a weapon or portal. Mascot small on a rugged cliff in lower right with laptop on lap, glancing upward, light from screen on his face. Layered torn painted cliffs and drifting clouds below, tiny stars. Left side is negative space with a large restrained SOLO STACK wordmark integrated into the sky, warm pale ink; top-left small brand mark optional only once, not duplicate giant titles. Clock "20:00" bottom left. Bottom center thin scroll cue. No other text. Balance cozy night atmosphere with a moment of manga ink energy, cinematic screenshot as a real homepage hero.
```

## 05. 05-egg-moon-presence-desktop.png

Reference images, in order:
- `D:/repos/solo-stack-web/docs/mockups/round-2/01-mascot-easter-eggs/02-style-b-crisp-ink.png`
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`

Exact prompt:

```text
Use case: ui-mockup. Create one high-fidelity IMAGE-GENERATED desktop website screenshot concept, widescreen 16:9. Original art for Solo Stack personal developer homepage, one night in the studio. Reference image 1 locks the mascot design: use this EXACT crisp-ink chibi adult man with short side-swept dark hair, trimmed sides, thick brows, brown almond eyes, light stubble, black tee or dark hoodie, charcoal trousers, cream sneakers; identical friendly face and proportions. Reference image 2 locks the brand material: real watercolor pigment blooms and granular anthracite on warm cotton paper, butter-yellow light and ochre highlights. Art fills the entire screen edge to edge as a crafted scene; no card grids, vector landscape, flat dark background, generic landing page or glossy 3D. Readable minimal website chrome over the painting: small heavy geometric SOLO STACK wordmark top left; two quiet navigation marks and a three-line menu top right; tiny monospaced clock; a discreet arrow-only button where needed. Use ONLY supplied text/numbers; no invented prose, statistics, captions, or other logos. Preserve quiet usable negative space around UI. Original imagery only, no copied anime/game characters, symbols, costumes or famous compositions. All effects look hand-painted in ink and watercolor. High craft, beautiful composition, real paper visible, restrained warm moonlight, no neon or purple. Specific frame: repeated full-moon clicking reveals an ambiguous dark presence at 01:00. Huge FULL butter-yellow watercolor moon upper center-right, about one third of the screen high. ON the moon's surface, partly blended with craters, a barely visible faint giant humanoid silhouette with bowed head and elongated shoulders; 12-percent charcoal opacity, ambiguous enough to be mistaken for lunar staining. NO face, eyes, veins, muscles, costume, identifiable character or horror gore. One much smaller drawn mascot on the lower-right cliff, wearing reference dark hoodie with hood down, hands resting on open laptop, looking up. Moonlit cloud layers fade into charcoal paper across the left half; studio window light glows faintly far below. Quiet screenshot header SOLO STACK, simple menu icon and small arrow button bottom left, tiny clock "01:00". Small cursor near the moon gives the discovery context. Allow the hidden figure to be discernible on inspection without dominating the moon. Tactile watercolor, ink linework, wistful and gently mysterious, restrained pale gold instead of bright orange. No other text.
```

## 06. 06-egg-arise-shadows-desktop.png

Reference images, in order:
- `D:/repos/solo-stack-web/docs/mockups/round-2/01-mascot-easter-eggs/02-style-b-crisp-ink.png`
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`

Exact prompt:

```text
Use case: ui-mockup. Create one high-fidelity IMAGE-GENERATED desktop website screenshot concept, widescreen 16:9. Original art for Solo Stack personal developer homepage, one night in the studio. Reference image 1 locks the mascot design: use this EXACT crisp-ink chibi adult man with short side-swept dark hair, trimmed sides, thick brows, brown almond eyes, light stubble, black tee or dark hoodie, charcoal trousers, cream sneakers; identical friendly face and proportions. Reference image 2 locks the brand material: real watercolor pigment blooms and granular anthracite on warm cotton paper, butter-yellow light and ochre highlights. Art fills the entire screen edge to edge as a crafted scene; no card grids, vector landscape, flat dark background, generic landing page or glossy 3D. Readable minimal website chrome over the painting: small heavy geometric SOLO STACK wordmark top left; two quiet navigation marks and a three-line menu top right; tiny monospaced clock; a discreet arrow-only button where needed. Use ONLY supplied text/numbers; no invented prose, statistics, captions, or other logos. Preserve quiet usable negative space around UI. Original imagery only, no copied anime/game characters, symbols, costumes or famous compositions. All effects look hand-painted in ink and watercolor. High craft, beautiful composition, real paper visible, restrained warm moonlight, no neon or purple. Specific frame: the Konami-code secret "ARISE" at 01:00. Small consistent mascot sitting with laptop on cliff at lower center-right. BEHIND him and further toward the right, three original featureless ink-shadow figures rise from liquid charcoal pools in the rock, tall slender irregular silhouettes, no armor, no weapons, no bright eyes, no crown. Their lower halves are watercolor ribbons dripping upward with a few ink droplets. They feel like the owner's own night-shift shadows becoming helpers, quiet and strange. The nearest figure leans curiously toward the laptop; the other two fade into the night. Pale warm moon rim-light makes their silhouettes readable against smoky gray-gold clouds. A crescent high left. At left middle, large original heavy geometric text "ARISE" in warm paper white, no other headline; top-left small SOLO STACK logo; clock "01:00". At bottom left a very small row of exact input glyphs "↑ ↑ ↓ ↓ ← → ← → B A" as restrained monospaced interaction feedback, no keycap cards. A small outlined circular close button with × top right. Dramatic but not violent, painted night environment, broad quiet dark negative space on left, mossy ink cliff below. The website remains visibly navigable behind the easter egg. No extra words.
```

## 07. 07-error-404-ink-void-desktop.png

Reference images, in order:
- `D:/repos/solo-stack-web/docs/mockups/round-2/01-mascot-easter-eggs/02-style-b-crisp-ink.png`
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`

Exact prompt:

```text
Use case: ui-mockup. Create one high-fidelity IMAGE-GENERATED desktop website screenshot concept, widescreen 16:9. Original art for Solo Stack personal developer homepage, one night in the studio. Reference image 1 locks the mascot design: use this EXACT crisp-ink chibi adult man with short side-swept dark hair, trimmed sides, thick brows, brown almond eyes, light stubble, black tee or dark hoodie, charcoal trousers, cream sneakers; identical friendly face and proportions. Reference image 2 locks the brand material: real watercolor pigment blooms and granular anthracite on warm cotton paper, butter-yellow light and ochre highlights. Art fills the entire screen edge to edge as a crafted scene; no card grids, vector landscape, flat dark background, generic landing page or glossy 3D. Readable minimal website chrome over the painting: small heavy geometric SOLO STACK wordmark top left; two quiet navigation marks and a three-line menu top right; tiny monospaced clock; a discreet arrow-only button where needed. Use ONLY supplied text/numbers; no invented prose, statistics, captions, or other logos. Preserve quiet usable negative space around UI. Original imagery only, no copied anime/game characters, symbols, costumes or famous compositions. All effects look hand-painted in ink and watercolor. High craft, beautiful composition, real paper visible, restrained warm moonlight, no neon or purple. Specific frame: 404 domain-like expansion, ORIGINAL infinite ink void. The website's warm paper surface tears and folds inward into vast nested rough-ink elliptical rings receding toward an off-center vanishing point; torn paper slivers and broken thin UI rules orbit slowly into the depth. A tiny lost mascot stands on the last floating piece of charcoal cliff at center-right, holds closed laptop at his side, looks around with puzzled thoughtful expression. His same familiar warm face and cream shoes remain visible. Giant crisp warm ivory "404" at left with one single butter-yellow outlined circular HOME-ICON button below; no explanatory prose. Small SOLO STACK header top-left remains intact on a stable strip, menu icon top-right, clock "03:00". The artwork evokes a page collapsing into infinite space, using black ink brush rings, screentone dust and tiny golden specks, NOT a sci-fi wormhole, blue vortex, eye, shrine, temple, borrowed anime scene or character. 80 percent warm anthracite and off-white paper with only tiny buttery-gold lighting. Dry-brush radial edges and wash granulation, peaceful bewilderment, arresting graphic composition with excellent recovery UI contrast. Original watercolor and ink only.
```

## 08. 08-error-500-giant-at-wall-desktop.png

Reference images, in order:
- `D:/repos/solo-stack-web/docs/mockups/round-2/01-mascot-easter-eggs/02-style-b-crisp-ink.png`
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`

Exact prompt:

```text
Use case: ui-mockup. Create one high-fidelity IMAGE-GENERATED desktop website screenshot concept, widescreen 16:9. Original art for Solo Stack personal developer homepage, one night in the studio. Reference image 1 locks the mascot design: use this EXACT crisp-ink chibi adult man with short side-swept dark hair, trimmed sides, thick brows, brown almond eyes, light stubble, black tee or dark hoodie, charcoal trousers, cream sneakers; identical friendly face and proportions. Reference image 2 locks the brand material: real watercolor pigment blooms and granular anthracite on warm cotton paper, butter-yellow light and ochre highlights. Art fills the entire screen edge to edge as a crafted scene; no card grids, vector landscape, flat dark background, generic landing page or glossy 3D. Readable minimal website chrome over the painting: small heavy geometric SOLO STACK wordmark top left; two quiet navigation marks and a three-line menu top right; tiny monospaced clock; a discreet arrow-only button where needed. Use ONLY supplied text/numbers; no invented prose, statistics, captions, or other logos. Preserve quiet usable negative space around UI. Original imagery only, no copied anime/game characters, symbols, costumes or famous compositions. All effects look hand-painted in ink and watercolor. High craft, beautiful composition, real paper visible, restrained warm moonlight, no neon or purple. Specific frame: original 500 error illustration at 03:00. At right, a little cozy glass-front timber coding studio on a rugged cliff, desk lamp and laptop inside, small same mascot in dark hoodie standing in the open doorway holding a coffee mug and looking up. Behind the studio a very tall ancient plain masonry wall stretches across the scene. Above the wall a HUGE FACELESS INK GIANT timidly peeks over it: smooth featureless rounded head and two hands resting on the wall, thin gentle butter-yellow rim light. Its head has NO eyes, nose, mouth, skin textures, exposed muscles, teeth or hair, and its silhouette is made of watercolor charcoal mist. It is an original curious shadow creature, not an actual titan and not a copied manga design. Show scale with tiny studio against monumental wall. Keep the giant's head visibly separated from the night with soft gray cloud wash. Left third: large warm ivory "500" and a clear round outlined RETRY-ARROW button below, ample empty dark sky. Header SOLO STACK top-left, simple menu top-right, tiny "03:00". Soft crescent moon partly behind cloud at upper left. Night feels cozy yet absurd, not violent or terrifying. Fine black ink linework for architecture and mascot; coarse painted granulation for wall and giant. No explanatory words or other lettering.
```

## 09. 09-egg-golden-bonsai-desktop.png

Reference images, in order:
- `D:/repos/solo-stack-web/docs/mockups/round-2/01-mascot-easter-eggs/02-style-b-crisp-ink.png`
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`

Exact prompt:

```text
Use case: ui-mockup. Create one high-fidelity IMAGE-GENERATED desktop website screenshot concept, widescreen 16:9. Original art for Solo Stack personal developer homepage, one night in the studio. Reference image 1 locks the mascot design: use this EXACT crisp-ink chibi adult man with short side-swept dark hair, trimmed sides, thick brows, brown almond eyes, light stubble, black tee or dark hoodie, charcoal trousers, cream sneakers; identical friendly face and proportions. Reference image 2 locks the brand material: real watercolor pigment blooms and granular anthracite on warm cotton paper, butter-yellow light and ochre highlights. Art fills the entire screen edge to edge as a crafted scene; no card grids, vector landscape, flat dark background, generic landing page or glossy 3D. Readable minimal website chrome over the painting: small heavy geometric SOLO STACK wordmark top left; two quiet navigation marks and a three-line menu top right; tiny monospaced clock; a discreet arrow-only button where needed. Use ONLY supplied text/numbers; no invented prose, statistics, captions, or other logos. Preserve quiet usable negative space around UI. Original imagery only, no copied anime/game characters, symbols, costumes or famous compositions. All effects look hand-painted in ink and watercolor. High craft, beautiful composition, real paper visible, restrained warm moonlight, no neon or purple. Specific frame: golden bonsai world-tree secret at 04:00. A small recognizable ceramic bonsai pot sits on the right-hand studio window ledge in foreground; roots and a gnarled miniature tree trunk grow from that clearly visible pot. Its luminous branching silhouette expands through the open window into an ENORMOUS ethereal golden canopy spanning the upper half of the night sky, as though a tiny bonsai projects the shadow of a whole world tree in LIGHT. Large airy intricate original branch geometry, cascading small warm-gold watercolor leaves, no copied game tree design, no sigils. Keep the small pot unmistakable so the scale transformation reads. Same mascot lower right at desk, wearing dark headphones around neck and black tee, one hand near pot and looking up with quiet wonder. Laptop on desk, coffee mug nearby, moon almost hidden far left behind pale cloud. Dark lake and cliff layers beyond studio, reflected fine gold leaf specks. Composition: canopy sweeping right to left through huge anthracite sky, painterly gray negative space at far left; small SOLO STACK top-left and "04:00", menu top-right, delicate circular arrow button bottom-left. Golden light is warm butter-yellow pigment and ochre, never neon or shiny metallic plastic. Tactile cotton paper, expressive ink architecture and botanical drawing, premium cozy original scene, no other text.
```

## 10. 10-egg-three-stars-desktop.png

Reference images, in order:
- `D:/repos/solo-stack-web/docs/mockups/round-2/01-mascot-easter-eggs/02-style-b-crisp-ink.png`
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`

Exact prompt:

```text
Use case: ui-mockup. Create one high-fidelity IMAGE-GENERATED desktop website screenshot concept, widescreen 16:9. Original art for Solo Stack personal developer homepage, one night in the studio. Reference image 1 locks the mascot design: use this EXACT crisp-ink chibi adult man with short side-swept dark hair, trimmed sides, thick brows, brown almond eyes, light stubble, black tee or dark hoodie, charcoal trousers, cream sneakers; identical friendly face and proportions. Reference image 2 locks the brand material: real watercolor pigment blooms and granular anthracite on warm cotton paper, butter-yellow light and ochre highlights. Art fills the entire screen edge to edge as a crafted scene; no card grids, vector landscape, flat dark background, generic landing page or glossy 3D. Readable minimal website chrome over the painting: small heavy geometric SOLO STACK wordmark top left; two quiet navigation marks and a three-line menu top right; tiny monospaced clock; a discreet arrow-only button where needed. Use ONLY supplied text/numbers; no invented prose, statistics, captions, or other logos. Preserve quiet usable negative space around UI. Original imagery only, no copied anime/game characters, symbols, costumes or famous compositions. All effects look hand-painted in ink and watercolor. High craft, beautiful composition, real paper visible, restrained warm moonlight, no neon or purple. Specific frame: fleeting three-star constellation secret, 02:00. Lots of quiet deep warm charcoal watercolor night sky with three brighter warm golden stars in upper middle-left. Each of the THREE STARS has just traced a thin incomplete triangular light trail; the three delicate OPEN OUTLINE triangles are vertically staggered, offset slightly left-right, of UNEQUAL sizes and irregular proportions, with large gaps between them. The three stars remain clearly visible at the ends of the trails. This should suggest stacked triangles fleetingly, NOT an emblem: NEVER three filled golden triangles, NEVER one triangle above two touching triangles, NEVER a Triforce logo. Three fragile hand-drawn astronomical paths like a constellation sketch fading into paper grain. Most other stars very faint and small. A small crescent moon high right. Same mascot sits far lower right with over-ear headphones and laptop on a low rugged cliff, looks up. Dim night studio nearby, misty landscape recedes lower left. Header SOLO STACK, "02:00", simple menu; tiny circular pause icon and a faint downward scroll arrow. Palette restrained: mostly dark charcoal paper, a narrow soft butter-gold horizon and delicate gold star trails; don't flood sky with yellow clouds. Calm premium night radio mood. No additional words or copyrighted symbols.
```

## 11. 11-egg-devtools-arise-console-desktop.png

Reference images, in order:
- `D:/repos/solo-stack-web/docs/mockups/round-2/01-mascot-easter-eggs/02-style-b-crisp-ink.png`
- `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`

Exact prompt:

```text
Use case: ui-mockup. Create one IMAGE-GENERATED desktop browser screenshot concept, landscape 16:9, with website left 58 percent and DevTools docked on RIGHT 42 percent. This is a designed screenshot, NOT a photograph of a monitor. Reference 1 locks the original crisp-ink chibi mascot identity (short dark side-swept hair, stubble, thick brows, black tee, charcoal trousers, cream shoes), reference 2 locks watercolor paper and butter-yellow/anthracite brand. LEFT: Solo Stack painted night homepage, small SOLO STACK wordmark top-left, menu icon and "01:00"; same mascot sits at laptop on a cliff near a glowing crescent, one small faceless ink shadow starting to rise behind him. Real pigment blooms, cozy paper grain and soft ochre light. RIGHT: sharp realistic browser developer console, flat charcoal interface, crisp pale-gray monospace UI with very restrained amber highlights. Tabs at top read exactly "Elements" "Console" "Sources", with Console selected by a thin underline. Small filter bar and tiny tool icons. Plenty of empty console space below.
In console output, use only the following lines: "SOLO STACK", then a five-line crescent made of monospaced asterisks with the silhouette shaped like this (preserve spaces and line breaks):
    ****
  ***
 ***
  ***
    ****
Then a blank line, then a clearly visible prompt "> arise()" and below it "undefined", then an empty prompt ">". The crescent is ASCII text made of asterisks, NOT a painted moon, emoji or solid icon. It must read as a left-side crescent. The typed arise() command has just caused the tiny shadow to start appearing in the page on left. No other logs, secrets, warnings, metrics or prose. Top browser address line "solo-stack.dev", small navigation icons. Console itself remains crisp untextured real UI, art only inside the page. Believable practical DevTools dock width. No copied characters, no third party logos.
```

## 12. 12-egg-golden-bonsai-mobile.png

Reference images, in order:
- `D:/repos/solo-stack-web/docs/mockups/round-2/01-mascot-easter-eggs/09-egg-golden-bonsai-desktop.png`
- `D:/repos/solo-stack-web/docs/mockups/round-2/01-mascot-easter-eggs/02-style-b-crisp-ink.png`

Exact prompt:

```text
Use case: ui-mockup. Recompose reference image 1 into a beautiful mobile website screenshot, exact tall PORTRAIT 9:19.5 aspect ratio (720 by 1560 or equivalent). Generate a new composition for phone, NOT a desktop screenshot pasted into a phone or crudely cropped. No device frame. Image 1 is the painted golden bonsai scene and image 2 is the exact drawn mascot identity. Preserve crisp ink chibi man, dark short side-swept hair, stubble, black tee, warm skin, headphones around neck. Top: small SOLO STACK wordmark left and menu icon right, tiny "04:00", ample safe-area margin. Upper two thirds: enormous delicate luminous golden bonsai canopy branching against granular charcoal night paper, sparse golden leaves, a small crescent through cloud, tactile watercolor. Lower third: the tiny ceramic bonsai pot and gnarled roots clearly visible on a studio windowsill, same mascot behind it at right, one hand close to pot, laptop and coffee in foreground. Show magical visual continuity from SMALL POTTED BONSAI into towering golden world-tree canopy, using original branch shapes. Its gold light fills the vertical composition. A clear circular arrow-only button at bottom left, well inset from bottom safe area, nothing else. Art dominates but nav and control remain readable. Same warm paper pigment, anthracite and butter yellow, original illustration. NO extra words, cards, stats, captions, browser chrome, logos, copied game iconography. High quality painterly mobile adaptation, complete pot, face and controls uncropped.
```
