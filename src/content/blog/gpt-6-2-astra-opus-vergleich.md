---
# Copy prompts and model outputs: docs/copy/blog/.
title: 'GPT 6.2 Astra und Claude Opus 5.5 im Praxistest'
slug: gpt-6-2-astra-opus-vergleich
description: 'Ich vergleiche GPT 6.2 Astra mit Claude Opus 5.5 in Blender, SVG, Spielen und Webentwicklung und zeige, warum mein Tempoeindruck getäuscht hat.'
summary: 'Ich habe GPT 6.2 Astra und Claude Opus 5.5 durch fünf praktische Tests geschickt. Astra gefällt mir besonders bei der Gestaltung von Minas Tirith und Tokio, Opus beim Jam Room. Bei der Laufzeit musste ich meinen ersten Eindruck korrigieren.'
# TODO(owner): youtubeId
youtubeId: null
publishedAt: '2026-11-20'
durationSeconds: 527
format: ai-test
chapters: []
takeaways:
  - 'Bei Minas Tirith in Blender liegt Astra für mich durch Gestaltung und Details vorne.'
  - 'Die SVG Entscheidung fällt knapp aus und bleibt eine Frage des persönlichen Geschmacks.'
  - 'Im Tokyo Spiel gefallen mir Astras Stadt und Autos besser, bei Opus überzeugt mich der Regen mehr.'
  - 'Beide Jam Rooms funktionieren, Opus zeigt weniger Verzögerung und die für mich angenehmere Oberfläche.'
  - 'Die Zeitangaben in Remotion korrigieren meinen ersten Eindruck von Astras Geschwindigkeit.'
tags:
  - 'GPT Astra'
  - 'Claude Opus'
  - 'Blender'
  - 'SVG'
  - 'SolidJS'
  - 'Remotion'
links:
  - url: https://www.youtube.com/@solostack_dev
    label: 'Solo Stack auf YouTube'
transcript:
  - start: 0
    text: 'GPT 6.2 Astra ist nun endlich draußen und ich habe es in GameDev, in Blender, in Webentwicklung und so weiter getestet und mit Opus 5.5 verglichen und die Ergebnisse schauen wir uns jetzt an.'
  - start: 13
    text: 'Und damit herzlich willkommen zu einem neuen Video. Heute testen wir GPT Astra 6.2 und vergleichen das auch gleich mit Opus 5.5.'
  - start: 21
    text: 'Ich hab nicht genug Usage mehr für Fable, aber Opus 5.5 ist so gut. Ich denk, das wird trotzdem ''n guter Test sein.'
  - start: 27
    text: 'Vielleicht noch kurz zu den Hauptänderungen: Der Preis wurde reduziert. Es ist jetzt acht Dollar in und 40 Dollar out pro Million Tokens, also gleicher Preis wie Fable.'
  - start: 36
    text: 'Außerdem wurde der Cachepreis um 60% reduziert und auf Artificial Analysis sind die Reasoning Tokens wieder sehr, sehr niedrig pro Task, was ziemlich gut ist. Ich hab''s auch bei meinem Test gemerkt, dass das Modell sehr, sehr schnell ist, einfach weil es weniger Tokens verbraucht beim Nachdenken und die Kosten sehen auch sehr gut aus.'
  - start: 55
    text: 'Aber ich weiß nicht, das ist immer schwierig zu sagen, weil bei Codex bekommt man weniger quasi Usage als bei Claude, aber Claude ist teurer, deswegen gleicht sich''s ungefähr aus und ist manchmal schwierig zu sagen, was jetzt wirklich mehr Usage bringt, je nach Modell. Ansonsten sind die Meinungen sehr gemischt im Internet, aber jetzt, wir schauen uns einfach mal unsere Tests an und wir starten mit Minas Tirith, eine Burg aus, ähm, Herr der Ringe.'
  - start: 82
    text: 'Ich werd mal ''n Bild einblenden und die hat Opus 5.5 und Astra 6.2 in Blender rekonstruiert. So, und zwar hab ich die von Opus 5.5 schon offen und die ist schon sehr beeindruckend, ähm, sehr detailliert.'
  - start: 98
    text: 'Man sieht auch, der Baum ist korrekt und auch die Gebäude und die allgemeine Form. Also ich war sehr beeindruckt, als ich das gesehen hab.'
  - start: 106
    text: 'Ich bin gespannt, weil von den 3D-Modellierungssachen im Internet hab ich sehr, sehr Gutes von 6.2 Astra schon gesehen. Daher mach ich''s jetzt kurz mal auf.'
  - start: 116
    text: 'So, und das ist das Astra-Blender-Modell von Minas Tirith und wow. Also ist es natürlich auch farblich besser, dadurch wirkt es auch direkt besser, aber ich muss schon sagen, das ist schon sehr beeindruckend.'
  - start: 129
    text: 'Der Baum geht hier ein bisschen über den Rand hinweg, aber es ist schon sehr beeindruckend. er hat sogar das Logo auf die Tür gemacht von Minas Tirith, also den weißen Baum.'
  - start: 140
    text: 'Ich glaub, den Punkt können wir ganz klar an Astra geben, aber mir war''s irgendwie klar, weil 3D-Modellierung sah extrem gut aus. So, der nächste Test ist SVG-Generation und ihr seht schon, das ist die Generation von, ähm, Opus 5.5 und das ist keine Video- oder Bildgenerierung, sondern rein Mathe SVG und die ist vom Aussterben der Dinosaurier, wie ihr sehen könnt und ist schon wirklich, wirklich beeindruckend, was da Opus geleistet hat.'
  - start: 165
    text: 'Ich hab die von Astra noch nicht angeschaut. Ich hab sie aber schon offen.'
  - start: 169
    text: 'Die schauen wir uns jetzt an. Oh, gut, wir sind schon beim Ende, aber ich seh schon, das sieht schon sehr, sehr gut aus.'
  - start: 176
    text: 'Ja, ob die Dinosaurier das Beste sind, da-- ich würd sagen schon. Ist auf jeden Fall länger, sieht man schon.'
  - start: 181
    text: 'Vielleicht nicht so smooth, aber ich glaub, das ist ''n bisschen ''ne Präferenzfrage tatsächlich. Aber ich würde den Punkt vielleicht sogar an Astra geben.'
  - start: 190
    text: 'Das ist schwierig zu sagen. Aber schauen wir uns einfach mal den nächsten Test an.'
  - start: 194
    text: 'So, als Nächstes haben wir ein Drifting-Spiel beziehungsweise ein Autorennen-Spiel in Tokio und das ist die Generation von Opus 5.5. Schauen wir uns jetzt mal an.'
  - start: 205
    text: 'Die sieht folgendermaßen aus: Sehr cool im Regen. So ist es auch im Prompt gewünscht.'
  - start: 209
    text: 'Wir haben hier ''ne Nitro-Funktion und können hier gegen die Autos racen. Ist gut funktional, also ich hab keine groben Bugs feststellen können oder irgendwas, was nicht funktioniert und ist auch also ''ne solide Generation.'
  - start: 223
    text: 'schauen wir uns mal Astra an. Das hab ich hier im nächsten Tab offen Also die Automodelle sehen deutlich besser aus.'
  - start: 230
    text: 'Ich find die UI auch eigentlich ziemlich cool. Normalerweise bin ich von der UI von Astra kein Fan, aber wir haben hier sogar ''ne Grafikeinstellung und Sound.'
  - start: 242
    text: 'Beziehungsweise das hatten wir bei Opus auch. Okay, okay, ja, man muss Shift halten, um zu driften.'
  - start: 248
    text: 'Also die Steuerung ist sehr, ja, reagiert relativ langsam, aber ich muss sagen, gefällt mir auch besser. Also rein grafisch ist hin, ist es schon noch mal ''n gutes Stück besser.'
  - start: 261
    text: 'Und wir haben hier sogar das legendäre Parkhaus. Das ist aber bei Opus auch dabei, aber sieht nicht annähernd so cool aus.'
  - start: 269
    text: 'Hier das Parkhaus so zu driften ist schon sehr cool. Also gefällt mir sehr gut.'
  - start: 274
    text: 'Der Regen sah ''n bisschen besser aus bei Opus. Die Stadt würd ich zu Astra geben, aber trotzdem sehr, sehr coole Generation.'
  - start: 282
    text: 'So, als weiteren Test schauen wir uns eine Webseite an, die in Solid JS mit Real-Time Connection, also WebSockets, geschrieben ist. Und da wollte ich einfach mal sehen, wie das Modell eine Echtzeitverbindung, ob es das alles hinbekommt, ob es mit dem neuen Framework arbeiten kann oder mit einem relativ modernen Framework und wie es die UI macht.'
  - start: 300
    text: 'Und das ist die Generierung von Opus 5.5. Ihr seht schon, auf der linken Seite sieht man quasi, dass ich auf ''nem anderen Tab, ähm, in der gleichen Session bin.'
  - start: 311
    text: 'Also alles funktionell ganz gut und dementsprechend kann man sich da eigentlich nicht beschweren. Hier und da laggt es ein bisschen, aber funktional ist es auf jeden Fall.'
  - start: 320
    text: 'Die UI finde ich auch in Ordnung und ich mache jetzt gleich mal die Astra-Generierung auf So, dann habe ich hier noch die GPT-Astra-Generierung offen. Die ist von der UI, ich würde sagen, schlechter oder zumindest mir persönlich gefällt sie nicht so gut.'
  - start: 333
    text: 'Man konnte hier oben da ''n Raum erstellen und bin jetzt hier gejoint. Ihr seht schon, dass wenn ich jetzt auf die Drums gehe, das ist ein bisschen mehr laggy von, von dem Mouse Movement, dem, vom anderen Spieler und es ist auch schlechter zu unterscheiden, weil beide sind quasi im gleichen Grün.'
  - start: 352
    text: 'find ich persönlich nicht so schön, aber an sich ist sie auch funktional. Live-Verbindungen funktionieren.'
  - start: 359
    text: 'Beide haben sich für Solid 1.9 entschieden. Vielleicht sollte ich vorgeben, dass sie sich für 2.0 entscheiden sollten, ähm, einfach damit es ein bisschen interessanter ist, ob sie mit den Änderungen auch wirklich umgehen können.'
  - start: 372
    text: 'Aber an sich würde ich beiden hier, ähm, hier sagen, dass es gut gemacht ist. Und als letzten Test haben wir noch Videogenerierung, und zwar mit Remotion, also ein Videogenerierungstool beziehungsweise ein, ein Projekt, wo man mit Code Videos generieren kann und das ist auch ganz interessant zu sehen, wie da die Modelle performen.'
  - start: 392
    text: 'Wir haben hier die Generierung von Opus 5.5 und zwar geht es darum, die Resultate vorzustellen, die wir hier in diesem Test gesehen haben. Schauen wir uns das einfach mal an.'
  - start: 403
    text: 'Die haben auch hier immer so quasi sich selber vorgestellt und was sie gemacht haben. Hier ist das SVG, wo wir uns angeschaut haben.'
  - start: 410
    text: 'Das war ja ganz gut. Und ich hab auch noch immer gesagt, man soll die Zeit einblenden und wie viel Tokens verwendet wurden.'
  - start: 416
    text: 'Das find ich ganz interessant zu sehen und das schauen wir. Am Ende sollte auch noch mal eine Übersicht kommen.'
  - start: 421
    text: 'also das Tokyo Game hat generell am meisten gedauert Das hab ich jetzt nicht gezeigt, aber find ich auch ''n coolen Test. Da haben die einfach ''n, ja, ''n Panzerspiel generiert, wo sie gegeneinander gegen Bots spielen.'
  - start: 432
    text: 'So, dann haben wir hier noch den Jam Room. Und hier noch die Übersicht, die ich sehen wollte.'
  - start: 437
    text: 'Also man sieht, Opus 5.5 hat auf High Reasoning, ähm, circa ''ne halbe Stunde gebraucht im Durchschnitt und 27 Millionen Tokens verbraucht. So, und das ist die Generierung von Astra.'
  - start: 452
    text: 'Schauen wir uns mal das mal an. Es sieht schon relativ ähnlich aus vom Start, aber ich glaub, es wird sich schon stark unterscheiden.'
  - start: 458
    text: 'Also klar, die tun natürlich beide ihre Ergebnisse vorstellen, also dementsprechend ist es ähnlich. Aber vom Gefühl her, Astra war sehr schnell.'
  - start: 465
    text: 'Also da steht 27 Minuten für, also verständlich, 41 Minuten für das. Okay, dann war meine Einschätzung komplett falsch.'
  - start: 476
    text: 'Irgendwie hat''s sich sehr schnell angefühlt. genau dafür hat das Medium Modell, also Medium Reasoning, das ist das Einzige, wo ich da gelaufen lassen hab, beim Panzer-Game zwei Minuten gebraucht.'
  - start: 485
    text: 'Also das war wirklich schnell. Und hier sehen wir uns noch mal die Übersicht an.'
  - start: 489
    text: 'Ist dann doch relativ ähnlich. Also Medium hab ich nicht laufen lassen für Opus, ähm, bei diesem, bei diesem, ähm, Panzerspiel.'
  - start: 498
    text: 'Dementsprechend haben wir da keinen Vergleich, wie lange es gedauert hat. haben wir jetzt nicht die Tokens aus irgendeinem Grund.'
  - start: 504
    text: 'Find ich sehr schade, aber ich glaub, ich lass es jetzt dabei sein. Es ist schon sehr spät geworden und dementsprechend lad ich das Video hoch.'
  - start: 511
    text: 'Ich bedank mich fürs Anschauen. Ich fand die Ergebnisse sehr interessant.'
  - start: 513
    text: 'Falls ihr irgendwelche Ideen habt für coole Tests oder einfach, wie man das Ganze oder diese momentanen Tests noch verbessern kann, schreibt''s gerne in die Kommentare und lasst ''n Abo da. Wir sehen uns beim nächsten Mal.'
  - start: 525
    text: 'Bis dann und tschau.'
lang: de
generatedBy: gpt-6.1-sol
---

GPT 6.2 Astra hat mich bei diesem Test mehrfach überrascht. Ich habe es mit Claude Opus 5.5 verglichen und mir angeschaut, was bei Aufgaben aus Blender, SVG, Spieleentwicklung und Webentwicklung herauskommt. Zum Abschluss stellen beide ihre Ergebnisse mit Remotion vor. Ich prüfe die Umsetzungen, du siehst die Ergebnisse im Video und erfährst hier, wo mein erster Eindruck später eine Korrektur braucht.

## Was ich vor den Ergebnissen einordnen möchte

Am Anfang des Videos zeige ich die Preisänderungen bei Astra. Pro Million Tokens sinkt der eingeblendete Preis für Eingabe von 10 auf 8 Dollar und für Ausgabe von 50 auf 40 Dollar. Beim gecachten Input geht es von 1 Dollar auf 0,40 Dollar. Die Reduktion um 60 Prozent bezieht sich also auf diesen Cachepreis.

Die eingeblendete Grafik von Artificial Analysis nennt für Astra 41.000 Ausgabetokens und 4,00 Dollar Kosten pro Aufgabe, für Opus 5.5 jeweils 173.000 und 10,04 Dollar sowie für Fable 5.2 jeweils 274.000 und 26,54 Dollar. Diese Angaben stammen aus der Grafik, nicht aus meinen fünf praktischen Tests. Sie belegen weder aktuelle Preise noch vergleichbare Laufzeiten.

Die gewöhnlichen Eingabe und Ausgabepreise vergleiche ich zum Aufnahmezeitpunkt mit Claude Fable 5.2. Fable selbst nimmt an den praktischen Tests aber nicht teil, hier schaue ich mir Astra und Opus 5.5 an. Mein erster Eindruck während der Arbeit war, dass Astra ziemlich schnell ist. Gerade deshalb finde ich den letzten Teil interessant, denn dort passen die angezeigten Zeiten nicht mehr so gut zu meinem Gefühl.

## Blender zeigt Astras Stärke bei Minas Tirith

Bei einer Rekonstruktion möchte ich sehen, ob die charakteristischen Formen und Details zusammenpassen. Die Aufgabe ist hier Minas Tirith aus Herr der Ringe. Ich öffne zuerst die Version von Opus 5.5 in Blender und finde sie schon sehr beeindruckend. Die allgemeine Form, die Gebäude und der korrekt dargestellte Baum machen einen guten Eindruck.

Astra setzt für mich trotzdem noch etwas drauf. Die farbliche Gestaltung hilft dem Modell sichtbar, dadurch wirkt es direkt ansprechender. Dazu kommen Details wie der weiße Baum als Zeichen auf dem Tor. Der große Baum ragt zwar etwas über den Rand hinaus, aber insgesamt gefällt mir diese Umsetzung besser.

Diesen Durchgang würde ich deshalb klar Astra geben. Das ist eine Bewertung der gezeigten Modelle und ihrer Gestaltung. Aus dieser einen Burg lässt sich natürlich noch keine allgemeine Aussage über jede mögliche Aufgabe in Blender ableiten.

## Bei der SVG Animation wird es knapp

Der nächste Test ist spannend, weil hier eine animierte Szene aus SVG entsteht. Es geht um das Aussterben der Dinosaurier, und Opus liefert bereits eine Umsetzung, die ich wirklich gelungen finde. Was du im Video siehst, entsteht aus Formen und Animationen, nicht aus einer generierten Videodatei.

Astras Version habe ich vor dem Anschauen noch nicht beurteilt. Sie läuft länger und sieht für mich ebenfalls gut aus. Bei der Bewegung bin ich allerdings weniger sicher, denn sie wirkt möglicherweise nicht ganz so flüssig. Genau da wird aus einem vermeintlich einfachen Vergleich eine Geschmacksfrage.

Ich neige im Video knapp zu Astra, möchte daraus aber keinen eindeutigen Sieg machen. Wenn dir gleichmäßige Bewegungen wichtiger sind als die längere Ausgestaltung, kannst du dieselben Ergebnisse anders gewichten. Für mich liegen die beiden hier deutlich näher zusammen als bei Minas Tirith.

## In Tokio gefallen mir Astras Stadt und Autos besser

Bei einem Spiel reicht ein schönes Bild allein nicht aus. Ich möchte auch sehen, ob ich fahren kann und wie sich die Steuerung anfühlt. Opus zeigt ein Autorennspiel in einem verregneten Tokio, mit Nitro und anderen Autos als Konkurrenz. Beim Ausprobieren fallen mir keine groben Bugs oder offensichtlich kaputten Funktionen auf.

Bei Astra gefallen mir die Automodelle und die Stadt besser. Auch die Oberfläche finde ich hier ansprechend, obwohl mich Astras Gestaltung sonst nicht immer überzeugt. Sound und ein Parkhaus gibt es bei beiden Versionen. Das Parkhaus gefällt mir bei Astra optisch besser und ist ein schöner Ort, um das Driften auszuprobieren.

Astras Steuerung reagiert relativ langsam, und zum Driften muss ich Shift gedrückt halten. Den Regen finde ich wiederum bei Opus besser umgesetzt. Meine Vorliebe für Astras Stadt und Autos bedeutet also nicht, dass dort jedes Detail gewinnt. Gerade beim Spielen bleiben Optik und Bediengefühl zwei Dinge, die ich getrennt betrachten muss.

## Im Jam Room zählt die Verbindung zwischen den Spielern

Für den Webtest lasse ich einen Jam Room mit SolidJS und WebSockets umsetzen. Mich interessiert, ob die Verbindung zwischen mehreren Teilnehmern funktioniert und wie verständlich die Oberfläche bleibt. Bei Opus sehe ich in zwei Tabs dieselbe laufende Session. Es gibt etwas Verzögerung, grundsätzlich funktioniert das Zusammenspiel aber.

Auch bei Astra kann ich einen Raum erstellen und einer Session beitreten. Die Liveverbindung funktioniert, allerdings wirkt die Bewegung des anderen Teilnehmers stärker verzögert. Beide Teilnehmer erscheinen außerdem in einem ähnlichen Grün, wodurch ich sie schlechter unterscheiden kann. Die Oberfläche gefällt mir deshalb bei Opus besser.

Beide Modelle entscheiden sich für Solid 1.9. Solid 2.0 erwähne ich lediglich als mögliche Vorgabe für einen weiteren Test, ausprobiert wurde es hier nicht. Wie viel die Gestaltung einer Oberfläche ausmacht, beschäftigt mich auch beim [Bauen meiner Website mit AI Agenten](/blog/meine-website-mit-ai-agenten). Hier im Jam Room ist Opus für mich angenehmer zu benutzen, auch wenn beide Umsetzungen ihren Zweck erfüllen.

## Remotion korrigiert meinen Eindruck vom Tempo

Zum Abschluss sollen beide Modelle ihre Ergebnisse mit Remotion präsentieren. Dabei entstehen Videos mit Code, die durch die vorherigen Arbeiten führen. Ich habe ausdrücklich darum gebeten, Laufzeiten und verwendete Tokens einzublenden. Dadurch soll neben den sichtbaren Ergebnissen auch der Aufwand dahinter greifbarer werden.

Laut der gezeigten Übersicht braucht Opus 5.5 mit High Reasoning im Durchschnitt ungefähr eine halbe Stunde. Bei Astra merke ich beim Anschauen der Zeitangaben, dass mein Eindruck von besonders kurzen Laufzeiten nicht trägt. Es hatte sich während der Arbeit schneller angefühlt. Die Zahlen bringen mich dazu, diese Einschätzung im Video direkt zu korrigieren.

Außerdem erwähne ich ein Panzerspiel, für das Astra mit Medium Reasoning ungefähr zwei Minuten gebraucht hat. Einen entsprechenden Lauf mit Opus auf Medium gab es nicht, deshalb fehlt hier der Vergleich. Das Gameplay wird nur erwähnt und gehört nicht zu den fünf vorgeführten Tests.

Leider fehlen in Astras abschließender Übersicht die Tokenzahlen. Damit bleibt ein Teil der gewünschten Gegenüberstellung offen, und ich vergebe für Remotion keinen eigenen Sieger. Mitgenommen habe ich vor allem konkrete Vorlieben für einzelne Ergebnisse und die Erkenntnis, wie leicht mich mein Zeitgefühl täuschen kann. Wenn du die Modelle selbst vergleichst, lohnt es sich deshalb, neben dem fertigen Ergebnis auch die tatsächliche Laufzeit anzuschauen.
