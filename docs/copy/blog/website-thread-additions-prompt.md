You write blog copy for solo-stack.dev. Generate only two brief supplemental paragraphs in German and faithful English translations. The existing article is natural, personal first person owner voice, addressing readers with du/you. All facts must come from the source notes below. Do not use tools, read files, or edit anything. Return only JSON with four string fields: deMotifs, deScroll, enMotifs, enScroll.

Purpose: make two generic parts of the existing article concrete without bloating it. Each paragraph should have exactly two short natural sentences. Combined German additions should be about 60 to 85 words; English equivalent. No clickbait, superlatives, heavy technical jargon, new promises, invented reactions or facts. No hyphenated compounds, en/em dashes or dashes as punctuation. No HTML, headings, lists or links. Proper names may keep their spelling. No sweeping statement that all animations block scrolling. Mention the specific 21:00 section only if it helps orient the reader, otherwise describe the homepage section with changing drawings. Avoid pretending the critique rounds found either issue: the owner brought both up himself before the rounds.

For the motifs paragraph: the owner thought the moon was repeated too much across subpages, and asked for trees, silhouettes and an owl within the existing nighttime theme. This paragraph will appear directly after the design search paragraph, immediately before the heading Meine Aufgaben und die Arbeit der Agenten. Do not repeat the personal night-owl explanation.
For the scroll paragraph: the owner disliked a section that blocked scrolling; it was changed so visitors can scroll straight through while the drawings change automatically. This paragraph will appear after the paragraph about spacing, animations, guidelines and linting and before Die Überraschung auf der Statistikseite. No unsupported claims about bounce rates or user tests. No need to mention the pause button or implementation details.

Verified sources:

# Ergänzende Recherche in alten T3-Code-Threads

Datum: 2026-11-08. Ein Recherche-Subagent hat zehn alte Projektthreads selektiv gelesen. Zwei Ergänzungen wurden anschließend im Hauptagenten anhand der Originalnachrichten geprüft. Die aktuellen Interviewantworten bleiben maßgeblich; keine anderen Anekdoten werden übernommen.

Quelle für beide Ergänzungen: <t3-thread://v2/bd5e2dad-84ec-4648-8186-74d31445a6ba/e3d39612-f8b3-41a8-adf6-ec0ed52203c1>

- Position 0, Nutzer, Item turn-item:message:6ce22865-2ea1-4156-973e-4ea8a588a6c4: Mondmotiv auf Blog, Kontakt und Statistikseite zu häufig, wirke bei Stats unpassend. Nutzer schlägt Baum, Silhouetten und nachtaktive Eule als unterschiedliche Motive innerhalb des bestehenden Farb- und Nachtthemas vor. Direkte Aussage des Eigentümers, keine Interpretation eines Agenten.
- Gleiche Nutzernachricht: beanstandet explizit blockiertes Scrollen im illustrierten Abschnitt und bittet um andere Lösung, z.B. wechselnde Zeichnungen.
- Position 79, Agent, Item turn-item:provider:claudeAgent:native-item:230fb5e9-7365-4432-afd3-7f45e6653ca0: berichtet Merge des 21:00-Abschnitts ohne Scrollsperre, selbst wechselnde Zeichnungen, Pause und Auswahlsteuerung. Nutzerkritik ist direkt belegt; Umsetzung zunächst Agentenbericht, zusätzlich durch aktuellen Quellcode bestätigt.
- Verifikation im Repository: src/lib/home/sections/making/Making.svelte, Kommentar Zeilen 4 bis 13 beschreibt freie Scrollbarkeit, automatischen Zeichnungswechsel und Pause; Steuerung im Template vorhanden. Es wurden keine Komponenten geändert.

Redaktion: zwei kurze Absätze als konkrete Beispiele, keine neue Überschrift, keine Behauptung, diese Probleme seien von den Kritikagenten entdeckt worden. Keine exakten Sekunden oder andere zusätzliche Zahlen. Inhalte in beiden Sprachen mit gpt-6.1-sol generiert.

Existing German article for voice and repetition checks:
---

# Based on the owner interview (2026-11-08); prompt and model output: docs/copy/blog/.

title: 'Wie ich meine Website mit AI Agenten gebaut habe'
slug: meine-website-mit-ai-agenten
description: 'Meine Website mit AI Agenten: eigene Designideen, vertrauter Stack, sieben Kritikrunden und ungefähr sechs Stunden persönliche Arbeit.'
summary: 'Ich habe solo-stack.dev mit AI Agenten gebaut und dabei Designrichtung, Einrichtung und wichtige Entscheidungen selbst übernommen. Hier erzähle ich, warum die Gestaltung am meisten Nacharbeit brauchte, was mich an den SVG Diagrammen überrascht hat und wie ich meinen Aufwand einschätze.'

# TODO(owner): youtubeId, durationSeconds, chapters and final transcript once the video is published.

youtubeId: null
publishedAt: '2026-11-01'
updatedAt: '2026-11-08'
durationSeconds: null
format: project
chapters: []
takeaways:

- 'Die Designrichtung brauchte die meisten Iterationen und mein laufendes Feedback.'
- 'Projekt, Infrastruktur und Sicherheitsentscheidungen habe ich selbst eingerichtet.'
- 'Sieben Kritikrunden halfen, Abstände, Animationen und Seiten aufeinander abzustimmen.'
- 'Claude überraschte mich mit eigenen SVG Diagrammen für meine Statistikseite.'
- 'Mein aktiver Aufwand lag bei circa sechs Stunden über vermutlich drei bis vier Tage.'
  tags:
- 'AI'
- 'Webentwicklung'
- 'SvelteKit'
- 'Design'
- 'Agenten'
  links:
- url: https://svelte.dev/docs/kit
  label: 'Dokumentation zu SvelteKit'
- url: https://developers.cloudflare.com/workers/
  label: 'Dokumentation zu Cloudflare Workers'
- url: https://valibot.dev/
  label: 'Validierung mit Valibot'
- url: https://developers.cloudflare.com/turnstile/
  label: 'Dokumentation zu Cloudflare Turnstile'
- url: https://www.youtube.com/@solostack_dev
  label: 'Mein Kanal auf YouTube'
  transcript: []
  lang: de
  generatedBy: gpt-6.1-sol

---

Meine eigene Website war für mich eine Gelegenheit, wieder etwas nach meinen Vorstellungen zu bauen und zu veröffentlichen. Bei solo-stack.dev habe ich dafür mit AI Agenten gearbeitet. Ich habe die Ideen und die Richtung vorgegeben, während die Agenten viel von der Umsetzung übernommen haben. Gerade bei der Gestaltung brauchte es einige Anläufe.

## Warum ich die Website bauen wollte

Ich bin Softwareentwickler mit Schwerpunkt Webentwicklung und baue einfach gern Dinge. Auch durch die Veränderungen mit AI wollte ich meine eigenen Fähigkeiten auf die Probe stellen und meinen vertrauten Stack praktisch einsetzen. Eine persönliche Website passte dazu: Ich kann mich im Internet präsentieren und vielleicht andere dazu bringen, selbst etwas zu bauen.

Dazu kamen zwei praktische Wünsche. Ich wollte eine Übersicht meiner Social Media Präsenz und ein Kontaktformular für Businessanfragen. An einem eigenen, veröffentlichten Projekt kann ich außerdem zeigen, welche Entscheidungen bei einer persönlichen Website anfallen. Dazu gehören für mich neben der Gestaltung auch Formulare und der Umgang mit Eingaben.

## Vom gelben Branding zum Mond

Die fertige Gestaltung hatte ich am Anfang noch nicht im Kopf. Ausgangspunkt war der gelbe Farbton meines bestehenden Brandings, der mich auf den Mond gebracht hat. Dazu passt, dass ich eine Nachteule bin und gern nachts an eigenen Projekten arbeite. Auch die Eule beim Kontaktformular hat dadurch einen persönlichen Bezug.

Ich habe eigene Ideen für Bildentwürfe beschrieben und verschiedene Designrichtungen ausprobiert. Die ersten Entwürfe habe ich verworfen, weil sie mir zu standardmäßig waren oder untereinander nicht zusammenpassten. Eine persönliche Website darf für mich verspielter und an manchen Stellen etwas übertrieben sein. Bis Homepage, einzelne Abschnitte und Unterseiten eine gemeinsame Richtung hatten, war entsprechend viel Feedback nötig. Dieser Teil hat die meisten Iterationen gebraucht.

## Meine Aufgaben und die Arbeit der Agenten

Das initiale Projekt habe ich komplett selbst eingerichtet. Dazu gehörten der Tech Stack, die Libraries, Cloudflare, Git und die Sicherheitsentscheidungen. Für die Arbeit mit den Agenten habe ich T3 Code als Oberfläche genutzt. Besonders hilfreich finde ich dort, verschiedene Modelle und Anbieter miteinander kombinieren zu können. Claude habe ich fürs Coding eingesetzt, OpenAI GPT Image für Bilder und gpt-6.1-sol für Texte.

Die technische Basis besteht aus SvelteKit, Svelte, Tailwind CSS und Cloudflare Workers. Mit diesem Stack war ich schon vor der Arbeit mit AI vertraut. Für mich verbindet er Performance, eine angenehme Entwicklungsarbeit und eine Struktur, mit der auch Agenten gut zurechtkommen. Durch meine eigene Erfahrung kann ich bei Problemen selbst in den Code eingreifen. Während des Projekts habe ich den Code punktuell an wichtigen Stellen geprüft.

Für parallele Arbeit nutze ich gern Git Worktrees. Größere Aufgaben liefen vor allem am Anfang parallel: Einige Agenten arbeiteten an der Homepage, andere leiteten daraus die Gestaltung für Blog und Statistikseite ab. Das Zusammenführen haben die Agenten selbst erledigt. Design und Theme habe ich dabei weiter geleitet und laufend Rückmeldung gegeben.

## Sieben Runden Kritik und Verbesserung

Nachdem die allgemeine Gestaltung feststand, folgten sieben Runden Hillclimbing. Damit meine ich, den vorhandenen Stand wiederholt kritisch prüfen zu lassen, die Kritik umzusetzen und das Ergebnis erneut anzusehen. Pro Runde setzte ein leitender Agent zwei weitere Agenten für die Kritik ein. Sie bewerteten die Benutzeroberfläche und die Bedienung.

Als interne Zielmarke sollten die Bewertungen der Agenten über 9,5 von 10 Punkten liegen. Diese Zahl war eine Orientierung innerhalb des Ablaufs und sagt für sich genommen wenig darüber aus, wie du die Website erlebst. Konkret ging es vor allem um konsistente Abstände, Animationen und eine zusammenpassende Gestaltung über mehrere Seiten hinweg. Designrichtlinien und Linting halfen dabei, Vorgaben einzuhalten und Unstimmigkeiten zu finden.

## Die Überraschung auf der Statistikseite

Mein Lieblingsbereich ist die [Statistikseite](/stats). Die Ideen dafür kamen von mir, beim Layout hat Claude eigene Beiträge geliefert. Eigentlich hatte ich LayerChart als Library für die Diagramme vorgesehen. Claude generierte stattdessen eigene SVG Diagramme, und das Ergebnis hat mich positiv überrascht. Für diese Seite hat mir die Umsetzung gut gefallen.

Auch die Bilder haben sich nach einigen Iterationen aus meiner Sicht gut eingefügt. Besonders mag ich die Silhouetten von mir, den Baum auf der Blogseite, die Eule auf der Kontaktseite und den Baum bei den Statistiken. OpenAI GPT Image war dafür meine bevorzugte Bildgenerierung. Meine Erfahrung dabei: Die Ergebnisse werden für mich brauchbarer, wenn ich selbst weiß, welche Richtung ich suche, und meine Vorstellungen entsprechend beschreiben kann.

## Was mir beim Kontaktformular wichtig war

Das [Kontaktformular](/kontakt) soll für Businessanfragen nutzbar sein, deshalb war mir dieser Teil besonders wichtig. Hier habe ich mich auch mit den Sicherheitsentscheidungen beschäftigt. Das Formular verwendet Cloudflare Turnstile, dessen Prüfung auf dem Server stattfindet. Die Eingaben werden ebenfalls serverseitig mit einem Schema von Valibot validiert.

Das sind konkrete Entscheidungen, die zur Umsetzung eines Formulars gehören. Gerade bei einer persönlichen Website beschäftigt man sich schnell lange mit Farben und Bildern, während die Verarbeitung einer Anfrage weniger sichtbar ist. Mir war wichtig, auch diesen Teil bewusst einzurichten. Die punktuelle Prüfung wichtiger Codestellen war dabei mein Anteil an der Kontrolle der Umsetzung.

## Wie viel Zeit darin steckt

Meinen eigenen aktiven Aufwand schätze ich auf ungefähr sechs Stunden. Das hat sich vermutlich über drei oder vier Tage verteilt. Die Agenten liefen zwischendurch, wenn ich Zeit dafür hatte, und nicht durchgehend. Eine genaue gesamte Laufzeit oder einen belastbaren Vergleich mit einer vollständig manuellen Umsetzung kann ich daraus nicht ableiten.

Am meisten nehme ich mit, dass die Arbeit mit mehreren Modellen in T3 Code für mich gut funktioniert hat. Die Bildgenerierung hat sich nach den nötigen Iterationen gut ins Projekt eingefügt. Schwieriger blieb die Gestaltung als Ganzes: Sie brauchte meine eigene Richtung und wiederholtes Feedback, bis die Seiten zusammenpassten. Dieser Artikel erscheint vor dem dazugehörigen Video, das ich später ergänze.

Existing English article for matching voice:
---

# Based on the owner interview (2026-11-08); prompt and model output: docs/copy/blog/.

title: 'How I Built My Website with AI Agents'
slug: building-my-website-with-ai-agents
description: 'My website built with AI agents: my own design ideas, a familiar stack, seven rounds of critique and about six hours of active personal work.'
summary: 'I built solo-stack.dev with AI agents, taking care of the design direction, setup and key decisions myself. Here I share why the design needed the most revision, what surprised me about the SVG charts and how I estimate my own time spent on the project.'

# TODO(owner): youtubeId, durationSeconds, chapters and final transcript once the video is published.

youtubeId: null
publishedAt: '2026-11-01'
updatedAt: '2026-11-08'
durationSeconds: null
format: project
chapters: []
takeaways:

- 'The design direction needed the most iterations and my ongoing feedback.'
- 'I handled the project setup, infrastructure and security decisions myself.'
- 'Seven rounds of critique helped bring spacing, animations and pages into alignment.'
- 'Claude surprised me with custom SVG charts for my stats page.'
- 'My active personal work came to about six hours, probably spread over three to four days.'
  tags:
- 'AI'
- 'Web Development'
- 'SvelteKit'
- 'Design'
- 'Agents'
  links:
- url: https://svelte.dev/docs/kit
  label: 'SvelteKit Documentation'
- url: https://developers.cloudflare.com/workers/
  label: 'Cloudflare Workers Documentation'
- url: https://valibot.dev/
  label: 'Validation with Valibot'
- url: https://developers.cloudflare.com/turnstile/
  label: 'Cloudflare Turnstile Documentation'
- url: https://www.youtube.com/@solostack_dev
  label: 'My YouTube Channel'
  transcript: []
  lang: en
  translationOf: meine-website-mit-ai-agenten
  generatedBy: gpt-6.1-sol

---

My own website was a chance to build and publish something the way I wanted again. For solo-stack.dev, I worked with AI agents. I supplied the ideas and direction, while the agents handled much of the implementation. The design in particular took a few attempts.

## Why I Wanted to Build the Website

I'm a software developer focused on web development, and I simply enjoy building things. With the changes brought by AI, I also wanted to put my own skills to the test and use my familiar stack in practice. A personal website was a good fit: I can introduce myself online and perhaps encourage others to build something themselves.

I also had two practical goals. I wanted an overview of my social media presence and a contact form for business inquiries. Having my own published project also lets me show the decisions involved in building a personal website. For me, that includes forms and handling input as well as design.

## From Yellow Branding to the Moon

I didn't have the finished design in mind at the start. The starting point was the shade of yellow in my existing branding, which got me thinking about the moon. That also fits with being a night owl who enjoys working on personal projects at night. The owl by the contact form has a personal connection too.

I described my own ideas for image concepts and tried different design directions. I rejected the first drafts because they felt too generic or didn't work together. To me, a personal website can be more playful and a little over the top in places. It took plenty of feedback before the homepage, individual sections and subpages shared a common direction. This part needed the most iterations.

## My Tasks and the Agents' Work

I handled the initial project setup entirely myself. That included the tech stack, libraries, Cloudflare, Git and security decisions. I used T3 Code as the interface for working with the agents. I find its ability to combine different models and providers particularly useful. I used Claude for coding, OpenAI GPT Image for images and gpt-6.1-sol for text.

The technical foundation consists of SvelteKit, Svelte, Tailwind CSS and Cloudflare Workers. I was already familiar with this stack before working with AI. For me, it combines performance, a pleasant development experience and a structure that agents can work with well too. My own experience lets me step into the code myself when problems arise. During the project, I reviewed selected important parts of the code.

I like using Git worktrees for parallel work. Larger tasks ran in parallel, especially at the start: some agents worked on the homepage, while others used it to develop the design for the blog and stats page. The agents handled merging the work themselves. I continued to guide the design and theme and gave ongoing feedback.

## Seven Rounds of Critique and Improvement

Once the overall design was established, I went through seven rounds of hill climbing. By that, I mean repeatedly having the current version critically reviewed, addressing the critique and looking at the result again. In each round, a lead agent brought in two more agents to provide critique. They assessed the user interface and usability.

The internal target was for the agents' ratings to exceed 9.5 out of 10. That number served as a guide within the process and, on its own, says little about how you experience the website. In practice, the focus was mainly on consistent spacing, animations and a cohesive design across multiple pages. Design guidelines and linting helped keep things within the requirements and identify inconsistencies.

## The Surprise on the Stats Page

My favorite area is the [stats page](/en/stats). The ideas came from me, while Claude contributed ideas of its own to the layout. I had originally planned to use LayerChart as the charting library. Instead, Claude generated custom SVG charts, and the result was a pleasant surprise. I liked how the implementation turned out for this page.

After a few iterations, I felt the images fitted in well too. I particularly like the silhouettes of me, the tree on the blog page, the owl on the contact page and the tree in the stats section. OpenAI GPT Image was my preferred tool for generating these images. My experience was that the results became more useful to me when I knew what direction I wanted and could describe what I had in mind.

## What Mattered to Me About the Contact Form

The [contact form](/en/kontakt) is intended for business inquiries, so this part was particularly important to me. I also worked through the security decisions here. The form uses Cloudflare Turnstile, with verification taking place on the server. The input is also validated on the server using a Valibot schema.

These are specific decisions involved in implementing a form. With a personal website, it's easy to spend a long time on colors and images, while the processing of an inquiry is less visible. I wanted to set up this part deliberately too. Reviewing selected important parts of the code was my contribution to checking the implementation.

## How Much Time Went Into It

I estimate my own active work at about six hours. That was probably spread over three or four days. The agents ran intermittently when I had time for them, rather than continuously. I can't use that to determine an exact total runtime or make a reliable comparison with a fully manual implementation.

My biggest takeaway is that working with multiple models in T3 Code worked well for me. After the necessary iterations, image generation fitted well into the project. The overall design remained more difficult: it needed my own direction and repeated feedback before the pages worked together. This article is being published before the accompanying video, which I'll add later.
