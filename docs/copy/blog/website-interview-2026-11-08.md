# Interview zur Entstehung von solo-stack.dev

Datum: 2026-11-08. Quelle: Antworten des Eigentümers im Chat. Redaktionelle Zusammenfassung, keine wörtliche Transkription. Das Video existiert noch nicht; Interview ersetzt die Faktenquelle für diesen Artikel.

- Softwareentwickler mit Schwerpunkt Webentwicklung. Wollte trotz Veränderungen durch AI seine eigenen Fähigkeiten auf die Probe stellen, sich im Internet präsentieren und vielleicht andere inspirieren. Baut gern Dinge und wollte den eigenen Tech Stack praktisch einsetzen und veröffentlichen.
- Praktischer Nutzen: Statistiken als Übersicht seiner Social Media Präsenz und Kontaktformular für Businessanfragen. Möchte anhand des Projekts auch zeigen können, worauf bei einer persönlichen Website zu achten ist, etwa Formulare und Security. Keine weiteren Tutorials versprochen.
- Gelber Farbton des bestehenden Brandings brachte ihn auf den Mond. Das fertige Design stand anfangs nicht fest. Ist eine Nachteule, arbeitet gern nachts an eigenen Projekten; daher passt auch die Eule beim Kontaktformular.
- T3 Code ist seine Oberfläche/IDE für die Kommunikation und Arbeit mit Agenten. Schätzt besonders die Kombination verschiedener Modelle und Anbieter.
- Verwendete Claude (im Interview: Opus 5.5) für Coding, GPT für Bildgenerierung und Texte. GPT Image war für ihn die bevorzugte Bildgenerierung; keine allgemeine objektive Modellrangliste behaupten. Im Artikel reicht Claude ohne Versionsnummer, OpenAI GPT Image und gpt-6.1-sol.
- Beschrieb eigene Ideen für verschiedene Bildentwürfe und testete Designrichtungen. Hat Design und Theme selbst geleitet und fortlaufend Feedback gegeben.
- Hat das initiale Projekt komplett selbst eingerichtet: Tech Stack, Libraries, Cloudflare, Git und Sicherheitsentscheidungen. Code nur punktuell an wichtigen Stellen reviewt. Keine vollständige manuelle Codeprüfung behaupten.
- Vertrauter Stack schon vor AI: aus seiner Sicht gute Kombination aus Performance, Developer Experience und Einfachheit für Agenten. Kann wegen eigener Erfahrung bei Problemen selbst in den Code eingreifen. Moderner und leichter Stack ist seine persönliche Einschätzung, kein Benchmark.
- Erste Entwürfe verworfen, weil zu standardmäßig oder untereinander unstimmig. Persönliche Website darf verspielter und etwas übertrieben sein. Keine genaue Endvorstellung am Anfang; allgemeines Design und Abstimmung von Homepage, Abschnitten und Unterseiten brauchten die meiste Nacharbeit.
- Nach Festlegung der allgemeinen Gestaltung sieben Hillclimbing Runden. Pro Runde setzte ein leitender Agent zwei Kritikagenten ein. Sie bewerteten UI und UX; Zielbewertung war über 9,5 von 10. Schwerpunkt waren konsistente Abstände, Animationen und Gestaltung über Seiten hinweg. Agentenbewertung als interne Zielmarke kennzeichnen, keine objektive Zertifizierung oder Usabilitystudie daraus machen. Designrichtlinien und Linting halfen.
- Arbeitet gern mit Git Worktrees. Größere parallele Arbeit vor allem am Anfang: einige Agenten für Homepage, andere leiteten Blogdesign und Statistikdesign davon ab. Agenten erledigten das Zusammenführen selbst. Keine kontinuierliche massive Parallelisierung und keine Behauptung, alles habe ein Agent eingerichtet.
- Kontaktformular war besonders wichtig bei Security. Verwendet Cloudflare Turnstile und Valibot für Eingabevalidierung. Keine absolute Sicherheitsgarantie und kein umfassendes Audit behaupten.
- Eigener aktiver Aufwand geschätzt circa sechs Stunden, verteilt auf vermutlich drei bis vier Tage mit Agentenarbeit. Agenten liefen, wenn er Zeit hatte, nicht durchgehend. Keine exakte Laufzeit, Kosten oder Geschwindigkeit gegenüber Handarbeit bekannt. Nicht aus Commitzeiten ableiten, dass alles in einer Nacht entstand.
- Lieblingsbereich ist die Statistikseite: Ideen von ihm, Layout mit Beiträgen von Claude. Hatte LayerChart als Library vorgesehen, Claude generierte stattdessen eigene SVG Diagramme. Positiv überrascht vom Ergebnis. Nicht behaupten, die komplette Produktidee sei von AI oder SVG sei generell besser als eine Library.
- Bildintegration funktionierte aus seiner Sicht gut, nach einigen Iterationen. Besonders gelungen: Silhouetten von ihm, Baum auf Blogseite, Eule auf Kontaktseite, Baum auf Statistikseite. Keine früheren unbestätigten Geschichten über halbpixelversetzte Hände, Radiogehäuse oder Bildprobleme übernehmen.
- Lernergebnis: T3 Code für verschiedene Modelle und Anbieter sehr hilfreich. Bildgenerierung funktioniert gut, wenn man weiß, was man will. Design bleibt schwierig und braucht eigene Führung.
- Auftrag: Interview beenden, Artikel jetzt schreiben, natürlich, ohne Übertreibung, wichtigste Informationen. In main übernehmen. Kein Video erfinden; später ergänzen.

## Verifizierter Repository Kontext

- SvelteKit, Svelte 5, Tailwind CSS 4, Cloudflare Workers (package.json). Kein Bedarf für Libraryversionen im Artikel.
- Kontaktformular src/lib/contact/contact.remote.ts: serverseitige Formvalidierung mit ContactSchema; Turnstile Prüfung auf dem Server.
- Existierende interne Seiten: /stats und /kontakt. Im Artikel sind optionale natürliche Links auf diese Seiten erlaubt.
- Ursprünglicher deutscher Slug bleibt meine-website-mit-ai-agenten. publishedAt bleibt 2026-11-01, updatedAt wird 2026-11-08.
- youtubeId und durationSeconds null; chapters und transcript leer. Keine fingierten Videozitate, Zeitmarken oder Videobeschreibungen.
- Bestehende Beispieltexte sind keine zusätzliche Quelle für persönliche Erlebnisse.
