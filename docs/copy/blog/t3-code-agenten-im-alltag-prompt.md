You are the writer for the blog on solo-stack.dev, the website of the German YouTube channel "Solo Stack". Write the companion article for one video, in German, in the owner's voice (first person "ich"), addressing the reader with "du".

## Do not use tools

Do not run commands or read files. Everything you need is in this prompt. Reply with the JSON only.

## The video

- Title on YouTube: T3 Code: Als Agent IDE unschlagbar?
- Format: Hands-on AI tool review (ai-test)
- Description on YouTube: Mit T3 Code nutze ich Claude Code und Codex in derselben App. Was mich daran am meisten überzeugt hat, ist die Zusammenarbeit der Agenten. Bei meinem Spielprojekt kann Claude zum Beispiel Codex dazuholen, um Bilder zu generieren.

Ich zeige euch, wie ich meine Projekte und Threads organisiere, die Limits meiner Abos im Blick behalte und Aufgaben auf meinem alten Laptop mit Linux laufen lasse. Zum Schluss schaue ich kurz auf Orca als Alternative.
- Chapters (seconds, title): [[0, "Worum es geht"], [50, "Download und Oberfläche"], [141, "So arbeiten Claude und Codex zusammen"], [233, "Anbieter und Abolimits"], [292, "Aufgaben auf einem anderen Rechner mit T3 Connect"], [344, "Worktrees, Pull Requests und geplante Aufgaben"], [428, "Threads, Browser und Android Simulator"], [490, "Orca als Alternative"]]
- Additional facts from the owner's notes: Owner interview for the article after editing the video:
- The owner uses a Decision Maker Skill to find ideas and make decisions. The skill calls agents from different providers through their existing subscriptions. Their ideas often differ considerably, and that range of suggestions helps the owner decide. No specific resulting choice was supplied. Keep the name "Decision Maker" in both languages. The video shows a related prompt asking for the next direction for the game and a separate example where Claude hands off image generation to Codex. The decision process is the additional insight, rather than another retelling of image generation.
- When a new model is released, the owner already runs their model test suite on an old Linux laptop via T3 Code. The main computer stays available to prepare the video while the test runs, and the test machine has very little unrelated code available as a source of references. Describe this as the owner's setup and reason for keeping the environment separate. No formal guarantee about isolation or sources, and no claim that the machine is always running.
- The owner prefers T3 Code to the other listed apps for their work with agents. The two things they miss are a simpler way to set up global skills that work across AI harnesses and a Markdown preview. Avoid suggesting they have a task where they currently switch to a different app, or claiming no Markdown rendering anywhere in the product.
- Open source project launched by Theo. This is a hands-on account from November 2026. Phrase feature availability as experienced or shown at the time. The author's feeling of doing a lot more vibe coding is subjective, not a metric. The pull request view shown comes from Theo's video; Orca was tried briefly and only mentioned as an alternative. Treat the Unreal Engine monitoring task as an example and Tailscale as an option the owner did not set up. The game has no announced release date; do not invent one.
- Write in everyday German. Lead with why the range of ideas or the ability to start one test and work on something else is useful. Give the three interview answers substantial space. Introduce terms like Worktree only when useful. Aim at the lower end of the requested word range, avoid repeating points to reach a length, avoid feature-list prose, loud claims, and stock phrasing. Avoid colons, semicolons and contrastive framing in prose. The site article is a personal practical assessment of a tool, not an installation guide. Prioritize known facts.

Transcript of the published video:

[0:00] Habt ihr schon mal zwischen Claude Code und Codex hin und her gewechselt und wollt nur eine Oberfläche haben?
[0:05] Dann solltet ihr vielleicht T3 Code eine Chance geben und das schauen wir uns im heutigen Video an.
[0:13] Und damit herzlich willkommen zurück zu einem neuen Video.
[0:15] Vielen Dank für das Feedback beim letzten Video.
[0:17] Ich muss mich noch ein bisschen reinfinden und ein bisschen ein paar Settings anpassen bezüglich dem Aufnehmen, aber darum soll's heute gar nicht gehen.
[0:24] Heute soll's um T3 Code gehen.
[0:26] Eine Software, die ich wirklich zu lieben gelernt habe in den letzten Wochen und ich glaube, mein Vibe Coding hat sich verdoppelt oder verdreifacht.
[0:33] Und ein Grund ist diese Open Source Software, welche vom YouTuber Theo ins Leben gerufen wurde beziehungsweise verwaltet wird.
[0:43] Von dem YouTuber kann man jetzt denken, was man will, aber diese Software ist wirklich, wirklich gut und ich denke, wir schauen uns das jetzt einmal mal genauer an.
[0:50] So, dann schauen wir uns doch einfach mal die Oberfläche an.
[0:52] Falls ihr euch die Software runterladen wollt, der Plattformsupport ist sehr gut.
[0:57] Also egal ob Mac, Linux oder Windows, sollte darauf einwandfrei laufen.
[1:02] Ich hab die Software schon in der Alpha getestet, hat sie mich noch nicht überzeugt.
[1:06] Jetzt ist sie schon in der Beta also man kann sehen, es hat irgendwie viele 13.000 Commits und ist wirklich gut gewartet.
[1:12] Natürlich aufgrund seiner Reichweite auch irgendwie viele Pull Requests offen, aber darum soll's jetzt nicht gehen.
[1:18] Wenn wir uns die Software anschauen, dann gibt's 'n paar Sachen, die sich unterscheiden, zum Beispiel zu Codex oder ähnlichen.
[1:24] Zum einen ist hier die Sidebar, die um Welten besser ist, möcht ich nur anmerken.
[1:28] Wir haben hier die vier verschiedenen Projekte, die wo man, wo man direkt erkennen kann, okay, an dem Kürzel und an den anderen Farben, dieser Thread gehört zu diesem Projekt und dieser Thread gehört zu diesem Projekt.
[1:40] Und wenn ich hier 'nen neuen Thread ausmach, kann ich das zum Beispiel hier auswählen und dann kann ich hier meinen Provider auswählen.
[1:47] Ich hab ja schon erwähnt, dass man diverse AI Subscriptions damit verwenden kann.
[1:53] Und wenn ich jetzt mal diesen einen Skill anwend, äh, und sage: "Ask for the next direction for this game", dann können wir jetzt gleich sehen, dieser Thread ist unter Working.
[2:05] Das heißt, der rutscht hier runter und man sieht sofort, dass der, ähm, noch am Arbeiten ist und der rutscht dann wieder hoch, sobald er fertig ist.
[2:12] Das sehen wir dann auch gleich.
[2:14] Und das Gute hierbei ist, dass man auch direkt sehen kann eben, okay, das-- der hat 'n GPT Thread, der hat 'n Claude Thread.
[2:21] ich glaub, das wirkliche Killerfeature dabei ist einfach, dass Claude GPT Modelle und auch andere Provider direkt im Thread erreichen kann.
[2:30] Das Orchestration Feature quasi.
[2:32] Und das ist das, was dieser Skill macht, den ich grad gecallt hab.
[2:35] Weil dieser Thread wird jetzt verschiedene, Subagents von anderen Providern aufrufen und das hat den Vorteil, zum Beispiel, ähm, das Projekt, in dem ich grade drin bin, ist ein Spiel und Claude hat zum Beispiel nicht die Möglichkeit, Bilder zu generieren.
[2:51] deswegen hab ich in meiner agents.md drinstehen, mach einen Subagent, call GPT und lass darüber Bilder generieren.
[2:58] Und das ist halt 'n extremer Vorteil.
[3:00] Wir können uns zum Beispiel hier mal einen Thread anschauen.
[3:04] Hier haben wir andere Agents, die wo aufgerufen wurden als Subagents und hier wurden dann auch Bilder generiert für quasi diesen Thread.
[3:14] Einfach weil das Claude nicht konnte und dann hat es einfach GPT gerufen und das hat halt, hat halt einfach 'n extremen Vorteil, dass man nicht von einer Umgebung in die andere wechseln muss, nur um, ähm, Bilder zu generieren.
[3:27] Und das hört ja hier nicht auf.
[3:28] Wir können uns das mal anschauen.
[3:30] Ich hab hier diverse Provider, momentan nicht alle aktiviert, aber darunter auch Cursor, OpenCode, Antigravity und diese sind dann natürlich alle verfügbar in dieser Auswahl und auch für die Subagents.
[3:42] Ich hab jetzt schnell kurz gewartet, aber hier sieht man, dass die Sub Agents, aufgerufen wurden und ich hab jetzt keine Fable Usage mehr, aber kann quasi, sind quasi alle erreichbar.
[3:53] Und bei den Providern hab ich zum Beispiel auch 'n paar deaktiviert.
[3:58] Schauen wir uns das Ganze mal an.
[3:59] Hier bei Antigravity kann ich leider nur Gemini grad, also 3.8, aktivieren.
[4:05] Hier hab ich die ganzen alten Provider, die wo quasi nur dann angezeigt werden, aber die ich eh nicht verwende, hab ich einfach ausgeblendet, was sehr cool ist.
[4:13] Und hier hat man entsprechende Übersichten, die wo ich noch zeigen wollte über seine Usage beziehungsweise wie viel Limits man noch hat, wann die resettet werden.
[4:21] Ich hab noch fünf Stunden, dann wird mein Claude resettet.
[4:24] Ich hab noch zwei Resets, die ich verwenden kann.
[4:27] Einer für 'n Fable Reset und das ist eben ganz cool, dass man hier das im Überblick hat.
[4:31] Man kann auch seine Tokens anschauen, seine Kosten et cetera, et cetera.
[4:35] Also wirklich mega cool die Oberfläche und die hat mich auch direkt überzeugt, bin ich ehrlich.
[4:41] Also ich find, es ist so viel besser als, ähm, grade die Sidebar als Codex oder Claude.
[4:47] Es gibt noch ein, zwei andere Konkurrenten, die wo was Ähnliches machen, die können wir noch am Ende drauf eingehen.
[4:52] Eine weitere coole Sache, die ich unbedingt erwähnen muss, sind Environments beziehungsweise wenn ihr zu Hause eine alte Linux-Box oder einen Linux-Laptop rumstehen habt wie ich, dann könnt ihr den ebenfalls einbinden und connecten und von hier aus Threads steuern.
[5:06] Bedeutet, ich kann hier zum Beispiel diesen Linux-Laptop auswählen und wenn ich jetzt hier 'n Thread aufmache, dann landet der auf diesem Laptop.
[5:13] Und das ist insofern cool, dass ich zum Beispiel, also wenn ihr irgendwas 24/7 laufen lassen wollt und es soll nicht euer PC sein, dann ist es halt mega angenehm, dass ihr ein abgeschottetes Environment habt.
[5:26] das wird alles per T3 Connect geregelt, also deren eigene Lösung.
[5:30] seht schon, so sieht es aus, wenn ein Thread fertig ist.
[5:33] Aber man kann auch bei Environments das Ganze mit Tailscale und anderen Dingen aufsetzen.
[5:40] Also alles sehr, sehr flexibel.
[5:42] Ich hab, äh, mir aber die Mühe nicht gemacht.
[5:44] Außerdem vielleicht noch 'n paar Sachen, die ich sonst noch erwähnen kann, die noch cool sind.
[5:48] Ihr könnt alles natürlich anpassen im Sinne von Aussehen, aber vor allem bei den Worktrees ist es cool, dass ihr sagen könnt: „Hey, wenn Worktrees gemerged sind, dann löscht sie automatisch", oder wenn ihr 'n Thread settled, dann lösche auch den Worktree.
[6:06] Einfach damit euer PC nicht vollgemüllt wird über Zeit.
[6:09] Das hab ich für mich eingestellt.
[6:11] Und wenn ihr 'n Thread settled, dann verschwindet der eben auch hier unten und der ist dann weg.
[6:16] Das ist halt einfach alles sehr, sehr cool und clean gemacht und da merkt man wirklich, dass diese User, die die Software benutzen, einfach Power Users sind, die wo täglich damit arbeiten und man merkt das einfach, wenn wirklich 'n bisschen Liebe in diesen Produkten steckt.
[6:29] Ansonsten Source Control gibt's diverse Provider, alles mögliche wird supportet und es gibt auch 'n cooles, Feature, um Pull Requests anzuschauen, direkt im Editor.
[6:39] Bedeutet, ihr müsst dann nicht mehr eure Umgebung wechseln, um Pull Requests anzuschauen und zu reviewen.
[6:45] Ich blende mal 'n Screenshot ein, einfach weil ich jetzt kein gutes Beispiel hab aus dem Theo-Video.
[6:50] Genauso wie es gibt auch Schedule Task, das kennt man ja auch aus anderen, ähm, Umgebungen wie Codex oder so, wo dann ich sag: „Hey, in dem Thread mach noch 'ne Schedule Task jede halbe Stunde, ob Unreal Engine noch läuft, ob das alles funktioniert", solche Dinge.
[7:06] Also alles sehr, sehr coole Sachen.
[7:08] Vielleicht noch die letzten coolen Sachen zu erwähnen sind, dass man allgemein Threads einfach reinziehen kann zwischen Projekten auch, was ganz cool ist und die referenzieren kann.
[7:18] Der Agent kann sich dann den Thread anschauen.
[7:20] Ansonsten kennt man auch ganz klassisch die Sidebar, wo man auch 'n Browser öffnen kann.
[7:26] Terminals, Files.
[7:27] Nichts Besonderes, also nichts zu Besonderes, aber alles trotzdem sehr, sehr clean.
[7:32] klar gibt's auch, wie man's kennt, 'n Git Diff View, wo man sich das anschauen kann und so weiter.
[7:38] Also alles auch wie in anderen Editoren, aber trotzdem 'n bisschen schöner meiner Meinung nach.
[7:44] Was auch noch deutlich besser ist als bei anderen, ich glaub, Claude hat jetzt nachgezogen, aber ich hab hier schon eine Android-Simulation offen, was dieser Agent gelauncht hat.
[7:56] Zu diesem Spiel wird übrigens auch noch 'n Video folgen.
[7:58] D-das wird hoffentlich irgendwann mal demnächst veröffentlicht, an dem ich 'n bisschen gearbeitet hab.
[8:02] Also ist auch sehr cool zu sehen, dass der Mobile oder Mobile, ähm, Entwicklungssupport auch sehr, sehr gut ist.
[8:10] So, wir schauen uns noch einen Konkurrenten an.
[8:12] Das wird jetzt kein Vergleichsvideo werden, einfach weil ich mit Orca, wo wir, wo ich jetzt grade offen hab, nicht so viel Erfahrung hab und dementsprechend kann ich's gar nicht vergleichen und kann auch nicht wirklich meine Meinung dazu abgeben.
[8:24] Aber ihr seht schon an der Webseite, dass man dort auch verschiedene Agenten von verschiedenen Providern aufrufen kann und es macht auch 'n sehr guten Eindruck.
[8:33] Ich hab's nach T3 Code versucht.
[8:35] Also ich hab erst mit T3 Code begonnen und dann hab ich noch mal gesagt, ich schau mir Orca an.
[8:40] Konnte mich leider nicht genug überzeugen, um dem 'ne ganze, um dem 'ne ehrliche Chance zu geben, aber es kann durchaus sein, dass es besser ist in vielen Aspekten oder schlechter.
[8:50] Ich kann dazu einfach keine Meinung angeben, aber ich wollt's trotzdem euch mal gezeigt haben, dass es auch noch 'n paar Alternative oder andere Alternativen gibt, die das Ähnliche machen.
[9:00] Also auch AI Subscriptions im Hintergrund verwenden und quasi keine Harness sind, sondern, ähm, nur 'ne UI für diese Subscriptions.
[9:09] falls euch T3 Code nicht zusagt, dann würd ich dem vielleicht 'ne Chance geben.
[9:13] Das sind so die zwei bekanntesten Alternativen, würd ich sagen.
[9:16] Vielleicht gibt's auch noch 'n paar andere, aber ich denke, ich werde dieses Video an dieser Stelle abschließen.
[9:20] Falls ihr irgendwelche Fragen habt, mach ich gerne auch 'n Follow-up dazu oder beantworte es in den Kommentaren.
[9:26] Seid gerne beim nächsten Video dabei und tschau.

## Existing articles for internal links

Articles already on the blog in this language, as "path: title: description". Where the article genuinely touches one of these topics, link to it inline (Markdown link with a natural anchor text, the path exactly as given). Link at most three of them, each at most once, and none if nothing fits. Never invent a path.

/blog/gpt-6-2-astra-opus-vergleich: GPT 6.2 Astra und Claude Opus 5.5 im Praxistest: GPT 6.2 Astra und Claude Opus 5.5 im Praxistest mit Blender, SVG, Rennspiel, Jam Room und Remotion, ergänzt um technische Details und Laufzeiten.
/blog/meine-website-mit-ai-agenten: Wie ich meine Website mit AI Agenten gebaut habe: Meine Website mit AI Agenten: eigene Designideen, vertrauter Stack, sieben Kritikrunden und ungefähr sechs Stunden persönliche Arbeit.

## Copy rules

- Personal, direct and approachable: explain why something matters before how. Opinions backed by what actually happened in the video. Transparent about setbacks. Calm, a little playful. No marketing speak, no superlatives, no clickbait, no emojis.
- Natural phrasing WITHOUT hyphens or dashes (write "AI Agenten" and not "AI-Agenten", no en or em dashes, also not as punctuation). Proper names keep their own spelling (Solo Stack, gpt-6.1-sol, SvelteKit, GitHub, YouTube …). The slug is the only exception: ASCII words joined by hyphens.
- Use only facts from the video, its description and the notes above. No invented numbers, durations, costs, quotes, tools, results, plans, dates or promises. When unsure, leave it out.
- The article stands on its own for readers who do not watch the video, and it is not a transcript: summarize, order and explain.

## Output

Return ONLY a JSON object, no markdown fences, with exactly these fields:

- "slug": URL slug in the article's language, lowercase ASCII, words joined with hyphens, max 6 words
- "title": the article title, max 70 characters, concrete, no clickbait, contains the main topic people would search for
- "description": meta description for search results, max 155 characters, says what the reader learns
- "summary": 2 to 4 sentences, max 450 characters
- "takeaways": array of 3 to 5 key takeaways, one sentence each, max 140 characters each
- "tags": array of 3 to 6 short topic tags (one or two words each, tool or topic names)
- "links": array of {"url", "label"} with a short label (2 to 5 words) for exactly these URLs, in this order: ["https://t3.codes/", "https://github.com/pingdotgg/t3code", "https://www.youtube.com/@solostack_dev"]
- "body": the article in Markdown, around 800 to 950 words. 4 to 7 "##" section headings (optionally "###" below), paragraphs of 2 to 5 sentences, at most two bullet lists, inline code only for real code or commands. Internal links as described above, no other links, no "#" heading, no images, no tables, no HTML, no closing "Fazit" heading that only repeats the summary. Start with an opening paragraph, not a heading.

## Specific edits and additional field

- Include an additional `chapters` array with the eight German titles verbatim from the input, omitting timestamps. They are published YouTube chapter labels and must not be reworded.
- Write the opening in simple, spoken German. Keep each of the three interview details as an actual part of the article. The Decision Maker helps surface very different ideas across subscriptions, and the author uses them to decide. Omit any statement about whether he can name the result of a particular demo.
- Avoid exempting, justifying or hedging something that was never asserted. Simply explain in plain language that the old laptop contains very little other code that agents could use as a reference. Do not infer that the specific prior Astra and Opus comparison took place on the Linux laptop. An internal link to that comparison can be used only in an accurate sentence, e.g. as a separate example of the kinds of model tests the author writes about.
- Preserve the distinction between working in one app and sharing a filesystem or execution environment. Use `AGENTS.md` for the conventional filename. Accurately describe automatic cleanup as something he enabled for merged worktrees or when settling a thread. Omit peripheral features when a list would read like a product brochure. Use official names and everyday phrasing, with paragraphs that do not keep restating the same benefit.

## Final editorial pass

Omit the paragraph explaining shared filesystems entirely. The true point is that the handoff can be followed in the app. Do not explain what the common UI does not imply. In the Decision Maker section, use two paragraphs: describe what the skill does and then illustrate it with the game prompt and explain how different ideas help the author decide. Mention those ideas once in this section. In the section about the laptop, describe the workflow once without spelling the same time advantage out in multiple sentences. Close on the two concrete things the author misses. A roughly 700 to 850 word article is fine if the tighter prose works better. Keep the metadata, chapter labels, and the rest of the requested JSON shape. Do not add any new facts.
