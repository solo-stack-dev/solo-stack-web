---
# Example post, written by gpt-6.1-sol (prompt and raw output: docs/copy/blog-example-post-*). The video does not exist yet.
title: 'Wie ich die Website von Solo Stack mit AI Agenten gebaut habe'
slug: meine-website-mit-ai-agenten
description: 'So entstand die Website von Solo Stack mit AI Agenten: eine gemalte Nacht, parallele Entwicklung und Korrekturen an den kleinen Details.'
summary: 'Für die Website von Solo Stack habe ich eine gemalte Nacht als durchgehendes Konzept umgesetzt. AI Agenten bauten die einzelnen Bereiche parallel, nachdem die Gestaltung und die gemeinsame Grundlage standen. Hier erzähle ich, wie daraus eine Website mit Spielen, Nachtradio und bewegten Szenen wurde und wo ich nacharbeiten musste.'
# TODO(owner): YouTube video ID of the first video (about building this site) once it is public
youtubeId: null
publishedAt: '2026-11-01'
durationSeconds: null
format: project
# TODO(owner): chapters ({ start: seconds, title }) and the transcript ({ start, text }) from the published video
chapters: []
takeaways:
  - 'Die erste Designrunde war zu austauschbar; gemalte Entwürfe brachten die Website näher an die Bildwelt von Solo Stack.'
  - 'Parallele AI Agenten arbeiteten in eigenen Git Worktrees mit klar zugeordneten Abschnittsordnern.'
  - 'Getrennte Bildebenen machten Bewegung möglich, brauchten aber sorgfältige Korrekturen beim Zusammensetzen.'
  - 'Die Coding Agenten schrieben Code und Platzhalter, während alle sichtbaren Texte von gpt-6.1-sol stammen.'
  - 'Bewusste Ladezeitpunkte, Tastaturbedienung und ruhige Ansichten gehören für mich zum Konzept.'
tags:
  - 'AI Agenten'
  - 'SvelteKit'
  - 'Webdesign'
  - 'Cloudflare Workers'
  - 'Solo Stack'
links:
  - url: https://svelte.dev/docs/kit
    label: 'SvelteKit Dokumentation lesen'
  - url: https://developers.cloudflare.com/workers/
    label: 'Cloudflare Workers Dokumentation'
  - url: https://threlte.xyz
    label: 'Threlte kennenlernen'
  - url: https://tailwindcss.com
    label: 'Tailwind CSS kennenlernen'
  - url: https://www.youtube.com/@solostack_dev
    label: 'Solo Stack auf YouTube'
  - url: https://github.com/solo-stack-dev
    label: 'Solo Stack auf GitHub'
transcript: []
lang: de
generatedBy: gpt-6.1-sol
---

Ich bin Softwareentwickler und baue eigene Apps und Projekte mit viel AI. Mit Solo Stack möchte ich dich dabei mitnehmen: beim Projektfortschritt, bei Tests von AI Modellen, bei Nachrichten aus Entwicklersicht und beim Aufbau eines kleinen Unternehmens. Für die Website wollte ich einen Ort, der etwas von dieser Arbeit erzählt. Daraus wurde eine Nacht im Studio, durch die du scrollen kannst.

## Erst die Stimmung, dann der Code

Der Ausgangspunkt war das Kanalbanner Nachtstudio: ein Laptop auf einer Klippe unter dem Mond. Darin steckte schon die Bildwelt für die Website, mit warmem Buttergelb, dunklem Anthrazit, Aquarellpapier und gezeichneten Tintenlinien. Dazu kommt eine gemalte Chibi Version von mir, mit kurzen dunklen Haaren, Bartstoppeln und schwarzem Shirt.

Die erste Runde mit HTML Entwürfen habe ich verworfen. Die Layouts waren ordentlich, aber sie hätten auch zu vielen anderen Websites passen können. Viel flaches Anthrazit, wenig von den gemalten Materialien, die Solo Stack ausmachen sollten. Für mich war das ein konkreter Hinweis, dass ein aufgeräumtes Layout allein noch keine passende Gestaltung ergibt.

Danach entstanden gemalte Bildentwürfe für die einzelnen Abschnitte. Ich habe Favoriten ausgewählt und das Konzept besprochen, bevor neue Entwürfe entstanden. So bekam die Website eine gemeinsame Richtung, bevor die Umsetzung in einzelne Aufgaben zerlegt wurde.

## Viele Agenten brauchen klare Grenzen

Damit mehrere Agenten an derselben Website arbeiten können, brauchen sie eine gemeinsame Grundlage. Ein leitender Agent schrieb deshalb ein ausführliches Übergabedokument und baute zuerst den Nachthimmel, gemeinsame Komponenten, den Rahmen für die Spiele und Platzhalter für die Texte. Die einzelnen Abschnitte konnten darauf aufsetzen.

Die Coding Agenten liefen in T3 Code, der Anwendung, mit der ich arbeite, und nutzten Claude Modelle. Jeder Agent bekam einen eigenen Git Worktree, einen eigenen Branch und einen Abschnittsordner als Zuständigkeitsbereich. Anschließend wurden die Ergebnisse wieder zusammengeführt. Diese Aufteilung machte aus dem großen Entwurf einzelne, klar umrissene Aufgaben.

Auch die Bilder mussten für die Umsetzung vorbereitet werden. Ein flaches Bild einer Szene lässt sich schließlich nicht einfach in einzelne bewegliche Gegenstände zerlegen. Deshalb erzeugte ein Bildmodell separate Ebenen für Himmel, Mond, Wolken, verschiedene Posen meines Maskottchens und Requisiten. Kleine Skripte übernahmen danach das Zuschneiden und Optimieren.

Die Git Historie enthält 67 Commits einschließlich der Zusammenführungen der parallelen Branches. Sie sind auf den 1. November 2026 zwischen 01:27 und 08:09 Uhr datiert.

## Vom Mond bis zu den Spielen

Beim Scrollen vergeht auf der Startseite eine Nacht. Kleine Uhrzeitangaben markieren die Abschnitte, während sich der Himmel von der Dämmerung über die tiefe Nacht bis zum Sonnenaufgang verändert. So verbindet die Bewegung durch die Seite auch ihre unterschiedlichen Inhalte.

Um 20:00 sitzt mein Maskottchen mit einem Laptop am Rand eines großen gemalten Mondes. Der Schriftzug SOLO STACK liegt teils in Creme auf dem Nachthimmel und teils in Anthrazit auf dem Mond. Du kannst den Mond anklicken und damit durch seine Phasen wechseln. Dahinter steckt eine Kugel mit gemalter Textur, umgesetzt mit Threlte, also Three.js für Svelte; bis sie geladen ist, bleibt das gemalte Bild sichtbar.

Um 21:00 erzählt eine durchgehende Tintenlinie, was ich mache. Mit deinem Scrollen verwandelt sie sich von einer Glühbirne in einen Prompt, dann in Code, ein Telefon, ein Diagramm und schließlich einen Mond über einer Klippe. Jede Form bekommt dabei einen gelben Pigmentfleck. Mir gefällt daran, dass die Tätigkeiten sichtbar miteinander verbunden bleiben.

Für 22:00 entstanden parallel drei Spielprototypen. Auf einem kleinen Mond mit radialer Schwerkraft zerdrückst du Bugs, bei Stack to the Moon stapelst du Blöcke mit meinen Werkzeugen, und bei der Sternbildsuche zeichnest du Formen von Werkzeugen wie Svelte und Cloudflare nach. Eigentlich wollte ich nach dem Spielen eines auswählen. Am Ende sind alle drei über Tabs erreichbar, und jedes Spiel lädt erst, wenn du auf Spielen klickst.

## Wo die gemalten Teile nicht passten

Bei den Bildern zeigte sich, wie viel Arbeit zwischen einem schönen Entwurf und einer funktionierenden Szene liegt. Die Nachtschicht um 01:00 musste neu gemalt werden, weil mein Maskottchen, der Stuhl, die Tastatur und die Maus nicht zusammenpassten. Jetzt sitzt die Figur mit Kopfhörern am Schreibtisch, während auf dem Monitor echte Commits aus meinem GitHub wie bei `git log` eingetippt werden.

Die tippenden Hände waren zunächst ein separates Bildstück. Auf dem Telefon verschoben sie sich um ungefähr einen halben Pixel gegenüber der Szene. Das klingt klein, fällt an einer solchen Naht aber auf. Inzwischen stecken Hände und Szene in derselben Bilddatei.

Auch der Spaziergang zum Sonnenaufgang brauchte einen neuen Aufbau. Der gemalte Ablauf mit vier Bildern stockte, weil zwei Bilder dasselbe Bein nach vorne führten. Ich habe die Figur deshalb aus einzelnen Körperteilen als Puppe neu aufbauen lassen. Daraus wurde ein gleichmäßiger Gang mit 16 Bildern, der deinem Scrollen folgt.

Um 06:00 zieht sich die Nacht zurück, mein Maskottchen geht mit dem Laptop davon, und auf dem buttergelben Papier dampft der Kaffee neben den Footer Links. Gerade hier sollte die Bewegung ruhig wirken. Ein kleiner Fehler im Gang hätte die ganze Szene immer wieder unterbrochen.

## Musik und Kino für die späten Stunden

Um 02:00 steht ein gemaltes altes Radio bereit. Die sozialen Plattformen sind seine Sender, ihre Logos sitzen auf den Sendertasten. Jeder Sender spielt seinen eigenen kurzen Song: etwa 30 bis 50 Sekunden auf Englisch, trauriger Rap oder Lo Fi, in Dauerschleife, solange du ihn eingestellt hast. Titel und Liedtexte stammen von gpt-6.1-sol. Die Musik habe ich mit dem offenen Musikmodell YuE2 lokal auf meiner eigenen Grafikkarte erzeugt; sie spielt erst, wenn du mit einem Klick einen Sender einstellst.

Das Radio brachte ein sehr handfestes Problem mit: Das gemalte Gehäuse hatte sechs Plätze für Sendertasten, aber es gibt mehr soziale Plattformen. Deshalb wurde der Körper aus seinen eigenen gemalten Pixeln neu zusammengesetzt. So fanden alle Sendertasten Platz im Radio.

Um 04:00 wird die Klippe zum Freiluftkino. Dort ist vorgesehen, dass der Laptop das jeweils neueste Video an den Nachthimmel projiziert. Der YouTube Player lädt erst nach einem Klick, und das Vorschaubild kommt von der eigenen Domain. Vorher wird dadurch nichts von YouTube geladen.

## Was unter der Nacht arbeitet

Die technische Grundlage besteht aus SvelteKit, Svelte 5 und Tailwind CSS 4, gehostet auf Cloudflare Workers. Die Seiten werden beim Build vorgerendert, die Blogartikel liegen als Markdown Dateien im Repository. Deutsch ist die Hauptsprache, Englisch liegt unter /en. Abgesehen vom räumlichen Mond verwende ich SVG, CSS, Canvas 2D und Web Audio.

Für die Texte gilt eine feste Regel im Repository: Alles, was du als Besucher liest, schreibt gpt-6.1-sol. Dazu gehören Überschriften, Beschriftungen, Alternativtexte, Meta Beschreibungen, Übersetzungen und auch dieser Artikel. Die Coding Agenten schreiben Code und Textplatzhalter. So bleibt die Verantwortung für die Sprache über die einzelnen Abschnitte hinweg klar zugeordnet.

Die verspielten Elemente sollen dir Raum lassen, die Seite in deinem Tempo zu benutzen. Aufwendige Teile laden erst, wenn sie ins Sichtfeld kommen, und pausieren außerhalb davon; Spiele brauchen zusätzlich deinen Klick. Für jeden Abschnitt gibt es eine ruhige statische Ansicht, wenn du Animationen über reduzierte Bewegung abschaltest. Alles ist mit der Tastatur erreichbar, und neben den spielerischen Elementen stehen einfache Links.

Ein paar Kleinigkeiten darfst du trotzdem entdecken. Der Konami Code ruft Tintenschatten mit ARISE herbei, und in der Browserkonsole wartet ein Mond aus ASCII Zeichen. Selbst die Fehlerseiten gehören zur Bildwelt: Bei 404 landest du in einer Tintenleere, bei 500 schaut ein Riese über eine Mauer.

Der Blog soll die Videos jeweils als Artikel mit Zusammenfassung, Kapiteln, Kernaussagen, Transkript und Links begleiten. Diesen ersten Text schreibe ich schon vor dem ersten Video. Ein Video über den Bau dieser Website kommt auf den Kanal. Hier beginnt Solo Stack also mit dem Ort, an dem die weiteren Projekte ihren Platz bekommen.
