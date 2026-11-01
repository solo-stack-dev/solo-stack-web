# Solo Stack design explorations

Open [the gallery](index.html) directly in a browser. Keep the folder structure intact. No build step, server, package installation, external font request or framework is needed.

These are **design explorations, not production pages**. All German copy, dates, durations, episode numbers, consent wording and article content are placeholders as requested. None should ship. Production visitor text must be generated with **gpt-6.1-sol**; actual legal information comes from the owner.

## Files

- `index.html`: gallery with descriptions and links.
- `01-nachtstudio/index.html`, `contact.html`, `blog-post.html`: chosen homepage, contact and article.
- `01-nachtstudio/demo-player.html`: local embedded player simulation.
- `01-nachtstudio/style.css`, `studio.js`, `contact.js`, `article.js`: styling and interactions.
- `02-kleiner-planet/index.html`, `style.css`, `loader.js`, `game.js`: editorial homepage and original game.
- `03-stack/index.html`, `style.css`, `stack.js`: layered paper system and toy.
- `04-episode/index.html`, `style.css`, `episode.js`: manga panels and opening.
- `assets/base.css`, `common.js`: shared typography, navigation, grain and components.
- `assets/Geist.woff2`, `profile.jpg`, `banner.jpg`, `video-ai.jpg`, `video-app.jpg`: local assets.
- `assets/SOURCES.md`: provenance.

## 01 — Nachtstudio

**Idea.** The existing banner becomes a web scene: pigment paper, moon, orbit lines and an original CSS laptop/cliff illustration. Strong typography leads into dark video cards; biography and socials return to light paper. Contact and article use quieter versions of the same materials.

**Interactive.** The hero follows local time: daytime is 07:00–18:59. This is a clock approximation, not astronomical sunrise or geolocation. The slider and Zeitraffer button demonstrate a full cycle. The moon toggles the hero with a circular View Transition reveal. A manual choice wins until Echtzeit is clicked, for the current page visit. Only the hero sky changes.

The lower moon and pigment edge use CSS view timelines; IntersectionObserver provides a moon-rise fallback. Without View Transitions, the button performs an ordinary theme update. Reduced motion removes transitions, reveals and scroll animation.

The contact form checks required fields, email and message length, presents inline errors and an error summary, and focuses the first invalid field. Success shows a paper plane heading toward a moon; reset repeats the flow. Company is required; budget and timeframe are optional. No data is sent or stored.

The article facade loads a local sandboxed iframe on click. Chapters seek to simulated timestamps and synchronize active chapter styling. The player has play/pause and a seek slider. It is clearly a simulation: no unrelated real video was substituted. Summary, takeaways, mentioned links and a native collapsible transcript show the intended hierarchy.

**Performance.** About 21.7 kB raw CSS including shared styles and all three page styles; 3.8 kB initial homepage JS including shared navigation. Contact adds 1.8 kB instead of the sky script; article adds 1.6 kB plus a 2.5 kB player document on interaction. In SvelteKit, split the contact/article CSS by route and keep the sky controller client-only. No per-frame scroll listener.

**Risks.** Visitors arriving at night will not see the bright opening first. SVG grain and View Transition snapshots need real-device profiling. The lightweight watercolor edge is less organic than the source artwork. Cross-visit theme persistence remains a product decision.

## 02 — Kleiner Planet

**Idea.** An editorial homepage puts the owner and videos first. A circular portrait introduces the orbit motif; a tiny planet game becomes a reward farther down the page.

**Interactive.** Click Spielen. Use arrows or A/D to run, Space to jump, or touch controls. The avatar rotates with the planet surface, jumps away from its center and falls back under radial gravity. Land on bugs to squash them and collect airborne stars. Collect every star and squash every bug to ship a feature and reset the world. Pause/Weiter is always available. All art and mechanics are original primitives.

**Performance.** About 13.7 kB raw CSS and 1.1 kB initial JS including shared code. The separate game is **7.35 kB raw**, loaded only after clicking Spielen. One Canvas 2D; no spritesheets, game engine, physics package or network. requestAnimationFrame targets the display refresh rate, with delta-time movement and a capped timestep. IntersectionObserver and document visibility stop the loop off screen or in a hidden tab. The poster is static. Reduced motion removes ambient animation; essential game movement starts only after explicit activation and can be paused.

For SvelteKit, mount on interaction and clean up observers, events and timers on component destruction. The standalone prototype uses full-document navigation for teardown.

**Risks.** This is a toy, not a balanced finished game. Collision windows, touch feel and accessible alternatives need playtesting. Sustained 60 fps and battery use were not benchmarked on physical devices. Never make the game primary navigation or a content gate.

## 03 — Stack

**Idea.** The name becomes a repeatable visual system: layered wordmark blocks, offset paper edges, a pile of video cards and a portrait print. It can extend into series covers and social graphics.

**Interactive.** Fan the cards out and back. Add Svelte, Cloudflare, Claude, GPT, Postgres or TypeScript blocks. Six layers is the limit; undo, reset and copy work. Clipboard API access has a selectable text fallback for restricted local contexts. Nothing is posted externally.

**Performance.** About 13.8 kB raw CSS and 2.9 kB raw JS including shared code. The small toy controller is included with the page; blocks are created only on interaction. No continuous loop or physics. Motion uses transforms. If the toy grows in SvelteKit, split its controller behind an interaction import.

**Risks.** The stacked state deliberately overlaps part of the second card; the fan control reveals it. Too much rotation across an archive would reduce scanning speed. Listed tools are toy options, not claims about the owner's actual stack. Sharing copies text rather than exporting an image.

## 04 — Episode

**Idea.** An anime nod through sequencing and graphic language: numbered episodes, project arcs, outlined type, manga panels, screentone and subtle speed lines. No copyrighted characters, logos or borrowed scenes.

**Interactive.** The opening lasts about 1.7 seconds, can be skipped immediately, and responds to Escape. Replay is optional. Reduced motion skips animation and leaves the static hero. The latest episode opens the shared example article; the arc panel jumps to the next entry.

**Performance.** About 14.1 kB raw CSS and 1.7 kB raw JS including shared code. CSS opacity/transforms for the opening, static gradients for screentone, no animation package. Render the full SvelteKit page immediately and treat the intro as an optional overlay with navigation cleanup.

**Risks.** An intro can become tiresome; production could show it only on request. Episode/arc taxonomy needs editorial meaning without implying a schedule. The graphic language can overpower the owner if used everywhere.

## Shared cost and asset notes

All numbers are approximate uncompressed source weights, not production bundle promises. Shared CSS is 8.6 kB and shared JS 0.7 kB. Local Geist is 69.6 kB. The portrait was resized from 1254 px PNG to 480 px JPEG, about 19.6 kB. Existing 1280 × 720 thumbnail examples are about 252 and 270 kB. The 1500 × 500 banner is 378 kB and appears only in the gallery's expandable reference.

No large bitmap is used as a page texture. Paper grain is a tiny tiled inline SVG turbulence filter; moon, cliff, plane, orbits, screentone and game art use CSS/Canvas. Production should generate responsive AVIF/WebP thumbnails, preload only real above-the-fold imagery, and consider font subsetting. The supplied thumbnails remain illustrative references.

No packages were installed. This task edited only `docs/mockups/`; no application routes or project configuration were changed.

## Verification and known limits

- Rendered all four homepages, contact, article and gallery in Chromium at 1280 px and 390 px with real assets and Geist. Completed visual runs reported no console messages. The long mobile Stack screenshot was capped at 4000 px; DOM width checks covered the page's overall layout.
- Checked mobile menu, form invalid/success/reset, card fanning, stack cap/undo/reset, day/night slider and manual moon state, opening skip/replay/Escape, article chapter seeking and transcript expansion.
- Verified lazy game startup, enabled controls, drawing changes from keyboard input, star scoring, pause stopping frames and offscreen cancellation. A deterministic simulated run collected seven stars without errors. This is functional testing, not a physical-device frame-rate benchmark.
- JS files parse successfully; local HTML links and asset references resolve. No horizontal document overflow was observed in the 390 px interaction checks.
- The preview tool cannot navigate Windows file URLs. Visual checks used inlined local pages with real assets. Interaction checks used a temporary browser document with the same scripts and lightweight image stand-ins. No server was started.
- Reduced-motion CSS and JS guards are implemented. System-level motion preference emulation, Safari/Firefox, physical touch devices, screen readers and sustained performance still need production checks.
- Form delivery, live channel data, real video playback, legal pages and the Discord invite are intentional placeholders. Supplied social handles link to their known destinations; Discord shows a notice rather than an invented invitation.
- The compact demo transcript represents the expansion pattern, not a real full transcript. All video cards intentionally open the same example article.

## Recommendation

Choose **Nachtstudio as the foundation**, borrow **Stack's restrained paper layering**, and consider **Kleiner Planet as an optional lower-page extra** once the main experience is fast and clear.

Nachtstudio already belongs to the brand, ties a memorable interaction to the owner's moon idea, and naturally supports readable articles and credible business contact. Stack is the strongest alternative when simplicity and a reusable visual system matter more than atmosphere. Episode works well as an occasional series treatment.

## Additional ideas

1. **Project constellation:** a few static dots link videos for one app; selecting a dot reveals its title. No force simulation needed.
2. **Paper build receipt:** end an article with what changed, what failed and the next open question, derived from the actual video.
3. **Studio bookmark:** locally remember the last article chapter, with a clear reset and no implication of synced history.
4. **Moon margin note:** a small developer observation beside a takeaway, rendered as ordinary accessible text.
5. **End-card stamp:** finishing a transcript or game round adds a small local visual stamp without accounts or invented visitor statistics.
