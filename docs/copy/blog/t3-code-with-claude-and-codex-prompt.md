You translate articles of the blog on solo-stack.dev (website of the YouTube channel "Solo Stack") from German into English.

## Do not use tools

Do not run commands or read files. Everything you need is in this prompt. Reply with the JSON only.

## How to translate

- Keep the owner's voice: first person, personal, direct, calm, a little playful, talking to the reader as "you". Write it as the owner would have written it in English, not word for word. Use the terms people actually search for in English.
- Keep every fact, number and name exactly. Add nothing, drop nothing, no new claims.
- No hyphenated compounds and no dashes as punctuation in the prose. Proper names keep their own spelling (Solo Stack, gpt-6.1-sol, SvelteKit, GitHub, YouTube …).
- Keep the Markdown structure of the body: the same "##"/"###" headings (translated), paragraphs, lists and inline code.
- Internal links: the body links to other articles by path. Replace each one with the path of its English version from this list, as "original path → English path". If an article has no English version, keep the original path.

/blog/meine-website-mit-ai-agenten → /en/blog/building-my-website-with-ai-agents
/blog/gpt-6-2-astra-opus-vergleich → /en/blog/testing-gpt-astra-against-claude-opus

## The article

---
title: 'T3 Code im Alltag mit Claude Code und Codex'
slug: t3-code-agenten-im-alltag
description: 'Wie ich in T3 Code Claude Code und Codex zusammen nutze, mit dem Decision Maker Ideen sammle und Modelltests auf einem alten Linux Laptop starte.'
summary: 'T3 Code bringt für mich Claude Code und Codex in einer App zusammen. Besonders hilfreich sind der Decision Maker für neue Ideen und mein alter Linux Laptop für Modelltests. Ich zeige, was mir im Alltag daran gefällt und welche zwei Dinge mir noch fehlen.'
youtubeId: k1ogKXVOuOE
publishedAt: '2026-11-22'
durationSeconds: 569
format: ai-test
chapters:
  - start: 0
    title: 'Worum es geht'
  - start: 50
    title: 'Download und Oberfläche'
  - start: 141
    title: 'So arbeiten Claude und Codex zusammen'
  - start: 233
    title: 'Anbieter und Abolimits'
  - start: 292
    title: 'Aufgaben auf einem anderen Rechner mit T3 Connect'
  - start: 344
    title: 'Worktrees, Pull Requests und geplante Aufgaben'
  - start: 428
    title: 'Threads, Browser und Android Simulator'
  - start: 490
    title: 'Orca als Alternative'
takeaways:
  - 'Mit dem Decision Maker hole ich über meine bestehenden Abos Agenten verschiedener Anbieter zur Ideenfindung dazu.'
  - 'Claude kann bei meinem Spielprojekt die Bildgenerierung an Codex übergeben, und ich kann die Übergabe in der App verfolgen.'
  - 'Meine Modelltests laufen über T3 Code auf einem alten Linux Laptop, während ich am Hauptrechner das Video vorbereite.'
  - 'Mir fehlen eine einfachere Einrichtung globaler Skills über mehrere AI Harnesses hinweg und eine Markdown Vorschau.'
tags:
  - 'T3 Code'
  - 'Claude Code'
  - 'Codex'
  - 'AI Agenten'
  - 'Decision Maker'
links:
  - url: https://t3.codes/
    label: 'T3 Code Website'
  - url: https://github.com/pingdotgg/t3code
    label: 'T3 Code auf GitHub'
  - url: https://www.youtube.com/@solostack_dev
    label: 'Solo Stack auf YouTube'
transcript:
  - start: 0
    text: 'Habt ihr schon mal zwischen Claude Code und Codex hin und her gewechselt und wollt nur eine Oberfläche haben?'
  - start: 5
    text: 'Dann solltet ihr vielleicht T3 Code eine Chance geben und das schauen wir uns im heutigen Video an.'
  - start: 13
    text: 'Und damit herzlich willkommen zurück zu einem neuen Video.'
  - start: 15
    text: 'Vielen Dank für das Feedback beim letzten Video.'
  - start: 17
    text: 'Ich muss mich noch ein bisschen reinfinden und ein bisschen ein paar Settings anpassen bezüglich dem Aufnehmen, aber darum soll''s heute gar nicht gehen.'
  - start: 24
    text: 'Heute soll''s um T3 Code gehen.'
  - start: 26
    text: 'Eine Software, die ich wirklich zu lieben gelernt habe in den letzten Wochen und ich glaube, mein Vibe Coding hat sich verdoppelt oder verdreifacht.'
  - start: 33
    text: 'Und ein Grund ist diese Open Source Software, welche vom YouTuber Theo ins Leben gerufen wurde beziehungsweise verwaltet wird.'
  - start: 43
    text: 'Von dem YouTuber kann man jetzt denken, was man will, aber diese Software ist wirklich, wirklich gut und ich denke, wir schauen uns das jetzt einmal mal genauer an.'
  - start: 50
    text: 'So, dann schauen wir uns doch einfach mal die Oberfläche an.'
  - start: 52
    text: 'Falls ihr euch die Software runterladen wollt, der Plattformsupport ist sehr gut.'
  - start: 57
    text: 'Also egal ob Mac, Linux oder Windows, sollte darauf einwandfrei laufen.'
  - start: 62
    text: 'Ich hab die Software schon in der Alpha getestet, hat sie mich noch nicht überzeugt.'
  - start: 66
    text: 'Jetzt ist sie schon in der Beta also man kann sehen, es hat irgendwie viele 13.000 Commits und ist wirklich gut gewartet.'
  - start: 72
    text: 'Natürlich aufgrund seiner Reichweite auch irgendwie viele Pull Requests offen, aber darum soll''s jetzt nicht gehen.'
  - start: 78
    text: 'Wenn wir uns die Software anschauen, dann gibt''s ''n paar Sachen, die sich unterscheiden, zum Beispiel zu Codex oder ähnlichen.'
  - start: 84
    text: 'Zum einen ist hier die Sidebar, die um Welten besser ist, möcht ich nur anmerken.'
  - start: 88
    text: 'Wir haben hier die vier verschiedenen Projekte, die wo man, wo man direkt erkennen kann, okay, an dem Kürzel und an den anderen Farben, dieser Thread gehört zu diesem Projekt und dieser Thread gehört zu diesem Projekt.'
  - start: 100
    text: 'Und wenn ich hier ''nen neuen Thread ausmach, kann ich das zum Beispiel hier auswählen und dann kann ich hier meinen Provider auswählen.'
  - start: 107
    text: 'Ich hab ja schon erwähnt, dass man diverse AI Subscriptions damit verwenden kann.'
  - start: 113
    text: 'Und wenn ich jetzt mal diesen einen Skill anwend, äh, und sage: "Ask for the next direction for this game", dann können wir jetzt gleich sehen, dieser Thread ist unter Working.'
  - start: 125
    text: 'Das heißt, der rutscht hier runter und man sieht sofort, dass der, ähm, noch am Arbeiten ist und der rutscht dann wieder hoch, sobald er fertig ist.'
  - start: 132
    text: 'Das sehen wir dann auch gleich.'
  - start: 134
    text: 'Und das Gute hierbei ist, dass man auch direkt sehen kann eben, okay, das-- der hat ''n GPT Thread, der hat ''n Claude Thread.'
  - start: 141
    text: 'ich glaub, das wirkliche Killerfeature dabei ist einfach, dass Claude GPT Modelle und auch andere Provider direkt im Thread erreichen kann.'
  - start: 150
    text: 'Das Orchestration Feature quasi.'
  - start: 152
    text: 'Und das ist das, was dieser Skill macht, den ich grad gecallt hab.'
  - start: 155
    text: 'Weil dieser Thread wird jetzt verschiedene, Subagents von anderen Providern aufrufen und das hat den Vorteil, zum Beispiel, ähm, das Projekt, in dem ich grade drin bin, ist ein Spiel und Claude hat zum Beispiel nicht die Möglichkeit, Bilder zu generieren.'
  - start: 171
    text: 'deswegen hab ich in meiner agents.md drinstehen, mach einen Subagent, call GPT und lass darüber Bilder generieren.'
  - start: 178
    text: 'Und das ist halt ''n extremer Vorteil.'
  - start: 180
    text: 'Wir können uns zum Beispiel hier mal einen Thread anschauen.'
  - start: 184
    text: 'Hier haben wir andere Agents, die wo aufgerufen wurden als Subagents und hier wurden dann auch Bilder generiert für quasi diesen Thread.'
  - start: 194
    text: 'Einfach weil das Claude nicht konnte und dann hat es einfach GPT gerufen und das hat halt, hat halt einfach ''n extremen Vorteil, dass man nicht von einer Umgebung in die andere wechseln muss, nur um, ähm, Bilder zu generieren.'
  - start: 207
    text: 'Und das hört ja hier nicht auf.'
  - start: 208
    text: 'Wir können uns das mal anschauen.'
  - start: 210
    text: 'Ich hab hier diverse Provider, momentan nicht alle aktiviert, aber darunter auch Cursor, OpenCode, Antigravity und diese sind dann natürlich alle verfügbar in dieser Auswahl und auch für die Subagents.'
  - start: 222
    text: 'Ich hab jetzt schnell kurz gewartet, aber hier sieht man, dass die Sub Agents, aufgerufen wurden und ich hab jetzt keine Fable Usage mehr, aber kann quasi, sind quasi alle erreichbar.'
  - start: 233
    text: 'Und bei den Providern hab ich zum Beispiel auch ''n paar deaktiviert.'
  - start: 238
    text: 'Schauen wir uns das Ganze mal an.'
  - start: 239
    text: 'Hier bei Antigravity kann ich leider nur Gemini grad, also 3.8, aktivieren.'
  - start: 245
    text: 'Hier hab ich die ganzen alten Provider, die wo quasi nur dann angezeigt werden, aber die ich eh nicht verwende, hab ich einfach ausgeblendet, was sehr cool ist.'
  - start: 253
    text: 'Und hier hat man entsprechende Übersichten, die wo ich noch zeigen wollte über seine Usage beziehungsweise wie viel Limits man noch hat, wann die resettet werden.'
  - start: 261
    text: 'Ich hab noch fünf Stunden, dann wird mein Claude resettet.'
  - start: 264
    text: 'Ich hab noch zwei Resets, die ich verwenden kann.'
  - start: 267
    text: 'Einer für ''n Fable Reset und das ist eben ganz cool, dass man hier das im Überblick hat.'
  - start: 271
    text: 'Man kann auch seine Tokens anschauen, seine Kosten et cetera, et cetera.'
  - start: 275
    text: 'Also wirklich mega cool die Oberfläche und die hat mich auch direkt überzeugt, bin ich ehrlich.'
  - start: 281
    text: 'Also ich find, es ist so viel besser als, ähm, grade die Sidebar als Codex oder Claude.'
  - start: 287
    text: 'Es gibt noch ein, zwei andere Konkurrenten, die wo was Ähnliches machen, die können wir noch am Ende drauf eingehen.'
  - start: 292
    text: 'Eine weitere coole Sache, die ich unbedingt erwähnen muss, sind Environments beziehungsweise wenn ihr zu Hause eine alte Linux-Box oder einen Linux-Laptop rumstehen habt wie ich, dann könnt ihr den ebenfalls einbinden und connecten und von hier aus Threads steuern.'
  - start: 306
    text: 'Bedeutet, ich kann hier zum Beispiel diesen Linux-Laptop auswählen und wenn ich jetzt hier ''n Thread aufmache, dann landet der auf diesem Laptop.'
  - start: 313
    text: 'Und das ist insofern cool, dass ich zum Beispiel, also wenn ihr irgendwas 24/7 laufen lassen wollt und es soll nicht euer PC sein, dann ist es halt mega angenehm, dass ihr ein abgeschottetes Environment habt.'
  - start: 326
    text: 'das wird alles per T3 Connect geregelt, also deren eigene Lösung.'
  - start: 330
    text: 'seht schon, so sieht es aus, wenn ein Thread fertig ist.'
  - start: 333
    text: 'Aber man kann auch bei Environments das Ganze mit Tailscale und anderen Dingen aufsetzen.'
  - start: 340
    text: 'Also alles sehr, sehr flexibel.'
  - start: 342
    text: 'Ich hab, äh, mir aber die Mühe nicht gemacht.'
  - start: 344
    text: 'Außerdem vielleicht noch ''n paar Sachen, die ich sonst noch erwähnen kann, die noch cool sind.'
  - start: 348
    text: 'Ihr könnt alles natürlich anpassen im Sinne von Aussehen, aber vor allem bei den Worktrees ist es cool, dass ihr sagen könnt: „Hey, wenn Worktrees gemerged sind, dann löscht sie automatisch", oder wenn ihr ''n Thread settled, dann lösche auch den Worktree.'
  - start: 366
    text: 'Einfach damit euer PC nicht vollgemüllt wird über Zeit.'
  - start: 369
    text: 'Das hab ich für mich eingestellt.'
  - start: 371
    text: 'Und wenn ihr ''n Thread settled, dann verschwindet der eben auch hier unten und der ist dann weg.'
  - start: 376
    text: 'Das ist halt einfach alles sehr, sehr cool und clean gemacht und da merkt man wirklich, dass diese User, die die Software benutzen, einfach Power Users sind, die wo täglich damit arbeiten und man merkt das einfach, wenn wirklich ''n bisschen Liebe in diesen Produkten steckt.'
  - start: 389
    text: 'Ansonsten Source Control gibt''s diverse Provider, alles mögliche wird supportet und es gibt auch ''n cooles, Feature, um Pull Requests anzuschauen, direkt im Editor.'
  - start: 399
    text: 'Bedeutet, ihr müsst dann nicht mehr eure Umgebung wechseln, um Pull Requests anzuschauen und zu reviewen.'
  - start: 405
    text: 'Ich blende mal ''n Screenshot ein, einfach weil ich jetzt kein gutes Beispiel hab aus dem Theo-Video.'
  - start: 410
    text: 'Genauso wie es gibt auch Schedule Task, das kennt man ja auch aus anderen, ähm, Umgebungen wie Codex oder so, wo dann ich sag: „Hey, in dem Thread mach noch ''ne Schedule Task jede halbe Stunde, ob Unreal Engine noch läuft, ob das alles funktioniert", solche Dinge.'
  - start: 426
    text: 'Also alles sehr, sehr coole Sachen.'
  - start: 428
    text: 'Vielleicht noch die letzten coolen Sachen zu erwähnen sind, dass man allgemein Threads einfach reinziehen kann zwischen Projekten auch, was ganz cool ist und die referenzieren kann.'
  - start: 438
    text: 'Der Agent kann sich dann den Thread anschauen.'
  - start: 440
    text: 'Ansonsten kennt man auch ganz klassisch die Sidebar, wo man auch ''n Browser öffnen kann.'
  - start: 446
    text: 'Terminals, Files.'
  - start: 447
    text: 'Nichts Besonderes, also nichts zu Besonderes, aber alles trotzdem sehr, sehr clean.'
  - start: 452
    text: 'klar gibt''s auch, wie man''s kennt, ''n Git Diff View, wo man sich das anschauen kann und so weiter.'
  - start: 458
    text: 'Also alles auch wie in anderen Editoren, aber trotzdem ''n bisschen schöner meiner Meinung nach.'
  - start: 464
    text: 'Was auch noch deutlich besser ist als bei anderen, ich glaub, Claude hat jetzt nachgezogen, aber ich hab hier schon eine Android-Simulation offen, was dieser Agent gelauncht hat.'
  - start: 476
    text: 'Zu diesem Spiel wird übrigens auch noch ''n Video folgen.'
  - start: 478
    text: 'D-das wird hoffentlich irgendwann mal demnächst veröffentlicht, an dem ich ''n bisschen gearbeitet hab.'
  - start: 482
    text: 'Also ist auch sehr cool zu sehen, dass der Mobile oder Mobile, ähm, Entwicklungssupport auch sehr, sehr gut ist.'
  - start: 490
    text: 'So, wir schauen uns noch einen Konkurrenten an.'
  - start: 492
    text: 'Das wird jetzt kein Vergleichsvideo werden, einfach weil ich mit Orca, wo wir, wo ich jetzt grade offen hab, nicht so viel Erfahrung hab und dementsprechend kann ich''s gar nicht vergleichen und kann auch nicht wirklich meine Meinung dazu abgeben.'
  - start: 504
    text: 'Aber ihr seht schon an der Webseite, dass man dort auch verschiedene Agenten von verschiedenen Providern aufrufen kann und es macht auch ''n sehr guten Eindruck.'
  - start: 513
    text: 'Ich hab''s nach T3 Code versucht.'
  - start: 515
    text: 'Also ich hab erst mit T3 Code begonnen und dann hab ich noch mal gesagt, ich schau mir Orca an.'
  - start: 520
    text: 'Konnte mich leider nicht genug überzeugen, um dem ''ne ganze, um dem ''ne ehrliche Chance zu geben, aber es kann durchaus sein, dass es besser ist in vielen Aspekten oder schlechter.'
  - start: 530
    text: 'Ich kann dazu einfach keine Meinung angeben, aber ich wollt''s trotzdem euch mal gezeigt haben, dass es auch noch ''n paar Alternative oder andere Alternativen gibt, die das Ähnliche machen.'
  - start: 540
    text: 'Also auch AI Subscriptions im Hintergrund verwenden und quasi keine Harness sind, sondern, ähm, nur ''ne UI für diese Subscriptions.'
  - start: 549
    text: 'falls euch T3 Code nicht zusagt, dann würd ich dem vielleicht ''ne Chance geben.'
  - start: 553
    text: 'Das sind so die zwei bekanntesten Alternativen, würd ich sagen.'
  - start: 556
    text: 'Vielleicht gibt''s auch noch ''n paar andere, aber ich denke, ich werde dieses Video an dieser Stelle abschließen.'
  - start: 560
    text: 'Falls ihr irgendwelche Fragen habt, mach ich gerne auch ''n Follow-up dazu oder beantworte es in den Kommentaren.'
  - start: 566
    text: 'Seid gerne beim nächsten Video dabei und tschau.'
lang: de
generatedBy: gpt-6.1-sol
---

Wenn ich bei meinem Spiel überlege, wie es weitergehen soll, helfen mir verschiedene Vorschläge. Und wenn ein neues Modell erscheint, möchte ich den Test starten und währenddessen mein Video vorbereiten können. Für beides nutze ich inzwischen T3 Code. Die App bringt Claude Code und Codex für mich so zusammen, dass ich im Alltag gerne damit arbeite.

## Warum ich bei T3 Code geblieben bin

T3 Code ist ein Open Source Projekt, das Theo ins Leben gerufen hat. Ich hatte die App schon in der Alpha ausprobiert, damals hat sie mich noch nicht überzeugt. Mein Eindruck im November 2026 mit der Beta ist deutlich besser. Gefühlt mache ich seitdem auch viel mehr Vibe Coding, wobei das natürlich mein persönlicher Eindruck ist.

Ein Grund dafür ist die Übersicht. In der Seitenleiste erkenne ich meine Projekte an Farben und Kürzeln und sehe, welcher Thread wohin gehört. Laufende Threads landen unter „Working“ und rutschen nach oben zurück, sobald sie fertig sind. Wenn mehrere Aufgaben offen sind, kann ich dadurch schnell sehen, wo noch gearbeitet wird.

Beim Anlegen eines Threads wähle ich den Anbieter aus. So habe ich meine Arbeit mit unterschiedlichen Agenten an einem Ort und erkenne auch später noch, ob ein Thread etwa mit Claude oder einem GPT Modell läuft.

## Wie ich mit dem Decision Maker Ideen finde

Für Ideen und Entscheidungen nutze ich meinen Decision Maker Skill. Er ruft Agenten verschiedener Anbieter über meine bestehenden Abos auf und holt ihre Vorschläge ein. Ich kann dadurch mehrere Perspektiven in meine Überlegungen einbeziehen, ohne die Anfragen einzeln in verschiedenen Apps anzustoßen.

Im Video frage ich damit nach der nächsten Richtung für mein Spiel. Die Ideen der beteiligten Agenten fallen häufig ziemlich unterschiedlich aus, und genau diese Bandbreite hilft mir bei der Entscheidung. Ich schaue mir an, welche Ansätze für das Projekt passen und was ich davon weiterverfolgen möchte. Der Skill übernimmt damit einen Teil der Suche, die Entscheidung treffe ich selbst.

## Wenn Claude Codex dazuholt

Ein anderes Beispiel aus meinem Spielprojekt ist die Bildgenerierung. Claude konnte in meinem gezeigten Ablauf keine Bilder erzeugen. Deshalb habe ich in meiner AGENTS.md hinterlegt, dass es dafür einen weiteren Agenten aufrufen und die Aufgabe an Codex übergeben soll.

Im Video zeige ich einen Thread, in dem auf diesem Weg Bilder entstanden sind. Ich kann dort nachvollziehen, welche weiteren Agenten aufgerufen wurden und was sie beigetragen haben. Dass ich diese Übergabe direkt in der App verfolgen kann, macht die Zusammenarbeit für mich angenehm.

Dazu passt die Übersicht über meine Abos. In den gezeigten Einstellungen sehe ich verbleibende Limits und die Zeit bis zum nächsten Reset. Nicht benötigte Modelle habe ich ausgeblendet, damit die Auswahl übersichtlich bleibt. Im Video war bei einem meiner Abos bereits kein Kontingent mehr übrig, und auch das war direkt sichtbar.

## Mein alter Linux Laptop bekommt die Modelltests

Wenn ein neues Modell erscheint, lasse ich meine Modelltests inzwischen über T3 Code auf einem alten Linux Laptop laufen. Ich wähle den Rechner als Umgebung aus, starte dort den Thread und bereite während des Tests am Hauptrechner das Video vor. Die Verbindung läuft in meinem Setup über T3 Connect.

Auf dem Laptop liegt außerdem sehr wenig anderer Code, den die Agenten als Referenz heranziehen könnten. Das ist für mich ein weiterer Grund, diese Testumgebung getrennt zu halten. Welche Art von Aufgaben ich bei Modelltests ausprobiere, kannst du dir auch in meinem [Vergleich von GPT 6.2 Astra und Claude Opus 5.5](/blog/gpt-6-2-astra-opus-vergleich) ansehen.

Tailscale wird ebenfalls als Möglichkeit für die Verbindung angeboten. Das habe ich selbst nicht eingerichtet. Für meinen gezeigten Ablauf nutze ich T3 Connect und kann die Threads auf dem anderen Rechner aus derselben App heraus steuern.

## Weniger Aufräumen nach der Arbeit

Bei mehreren Aufgaben bleiben schnell Arbeitsstände liegen. Dafür gefallen mir die Einstellungen für Worktrees, also separate Arbeitsverzeichnisse für Änderungen an einem Projekt. Ich habe die automatische Bereinigung für zusammengeführte Worktrees und beim Abschließen eines Threads aktiviert. So muss ich diese Verzeichnisse anschließend seltener selbst aufräumen.

Die Ansicht für Pull Requests erwähne ich im Video ebenfalls. Das eingeblendete Beispiel stammt aus Theos Video, weil ich selbst gerade kein passendes Beispiel offen hatte. Geplante Aufgaben zeige ich als weitere Möglichkeit. Die regelmäßige Prüfung, ob Unreal Engine noch läuft, ist dabei ein Beispiel für eine solche Aufgabe.

## Was mir im Alltag noch fehlt

Orca habe ich nach T3 Code kurz ausprobiert. Für einen belastbaren Vergleich habe ich damit zu wenig gearbeitet, deshalb bleibt es hier bei der Erwähnung als Alternative. Für meine Arbeit mit Agenten bevorzuge ich aktuell T3 Code.

Zwei Dinge fehlen mir dabei noch. Ich hätte gerne einen einfacheren Weg, globale Skills über verschiedene AI Harnesses hinweg einzurichten. Gerade bei einem Skill wie dem Decision Maker möchte ich die Einrichtung möglichst unkompliziert halten. Außerdem wünsche ich mir eine Markdown Vorschau, damit ich geschriebene Texte direkt bequem lesen und prüfen kann.


## Output

Return ONLY a JSON object, no markdown fences, with exactly these fields, all in English:

- "slug": URL slug in English, lowercase ASCII, words joined with hyphens, max 6 words
- "title": max 70 characters
- "description": max 155 characters
- "summary": max 450 characters
- "takeaways": same number and order as the original
- "tags": same number, translated where the tag is not a name
- "links": same URLs in the same order, labels translated
- "chapters": same number and order, only the titles translated, as an array of strings
- "transcript": same number and order of segments, each text translated, as an array of strings
- "body": the translated Markdown body

For the transcript keep the exact segment boundaries, including sentence fragments. The Markdown body should read like normal English. Avoid colons, semicolons and contrastive framing in prose. The chapter titles and the transcript can follow the source phrasing.
