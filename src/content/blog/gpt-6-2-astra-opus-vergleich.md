---
# Copy prompts and model outputs: docs/copy/blog/.
title: 'GPT 6.2 Astra und Claude Opus 5.5 im Praxistest'
slug: gpt-6-2-astra-opus-vergleich
description: 'GPT 6.2 Astra und Claude Opus 5.5 im Praxistest mit Blender, SVG, Rennspiel, Jam Room und Remotion, ergänzt um technische Details und Laufzeiten.'
summary: 'Ich vergleiche GPT 6.2 Astra und Claude Opus 5.5 mit gleichen Prompts und sauberem Start. Astras Gestaltung gefällt mir bei Blender und Tokio besser, Opus bei der Bedienung des Jam Rooms. Beide SVGs laufen 24 Sekunden, und die protokollierten Zeiten korrigieren mein Gefühl zu Astras Tempo. Für den Alltag würde ich zuerst Opus nehmen, für 3D und Spieleentwicklung Astra ausprobieren.'
youtubeId: pwAYpa-v4KI
publishedAt: '2026-11-18'
updatedAt: '2026-11-20'
durationSeconds: 527
format: ai-test
chapters:
  - start: 0
    title: 'Intro'
  - start: 27
    title: 'Was sich bei Astra geändert hat'
  - start: 76
    title: 'Minas Tirith in Blender'
  - start: 147
    title: 'SVG Animation'
  - start: 194
    title: 'Rennspiel in Tokio'
  - start: 282
    title: 'Jam Room mit SolidJS'
  - start: 376
    title: 'Video mit Remotion'
  - start: 505
    title: 'Abschluss'
takeaways:
  - 'Bei Minas Tirith gefällt mir Astras Gestaltung besser. Beide Modelle dokumentieren Prüfungen und Überarbeitungen ihrer Szene.'
  - 'Beide SVGs laufen 24 Sekunden. Mein Eindruck einer längeren Astra Animation im Video war falsch.'
  - 'In Tokio gefallen mir Astras Stadt und Autos besser, die Steuerung reagiert jedoch vergleichsweise träge.'
  - 'Im Jam Room bevorzuge ich Opus wegen der leichter unterscheidbaren Teilnehmer und des flüssiger wirkenden Cursors.'
  - 'Beim Rennspiel war Opus mit rund 34 Minuten schneller, bei Remotion Astra mit rund 13 Minuten. Das sind einzelne Läufe.'
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

Astras Steuerung im Rennspiel reagiert beim Ausprobieren vergleichsweise träge, obwohl mir die Stadt und die Autos auf Anhieb besser gefallen. Für meinen Vergleich liefen GPT 6.2 Astra und Claude Opus 5.5 jeweils mit High Reasoning. Beide bekamen dieselben Prompts und starteten in frischen Arbeitsordnern mit im Wesentlichen gleicher sauberer Umgebung. Vor dem Ausprobieren habe ich die fertigen Ergebnisse nicht von Hand nachgebessert.

## Minas Tirith in Blender

Opus liefert bei Minas Tirith schon eine Umsetzung, die ich sehr beeindruckend finde. Die allgemeine Form, die Gebäude und der Baum passen für mich gut zusammen. Bei Astra gefällt mir die farbliche Gestaltung noch besser. Dazu kommt der weiße Baum als Zeichen auf dem Tor, der mir im Video besonders auffällt. Der große Baum ragt etwas über den Rand hinaus, insgesamt bevorzuge ich trotzdem Astras Szene.

Beide Projekte bauen die Szene mit einem Python Skript in Blender auf. Zum Auftrag gehört auch, das erzeugte Bild zu prüfen und die Szene anschließend zu überarbeiten. Laut Astras Notizen hat das Modell mehrere Kameraansichten kontrolliert und danach unter anderem die Bergsilhouetten sowie den Ausschnitt der Hauptansicht angepasst. Opus hält nach seinen Vorschaurenderings Korrekturen an Fels und Beleuchtung fest.

Astra beschreibt Häusertypen mit Schieferdächern, Gauben, Kapellen und Türmen, wobei sich wenige Grundrisse wiederholen. Opus nennt insgesamt 558 Häuser und Türme auf den Terrassen mit verschiedenen Dacharten. Beide konnten die Szene laut ihren Notizen per Skript aus einer frischen Blender Sitzung neu erzeugen. Praktisch ist daran, dass der Aufbau im Code erhalten bleibt.

## Extinction Day als SVG

Bei Extinction Day war eine einzige animierte SVG Datei gefordert, ohne JavaScript, Rasterbilder oder externe Ressourcen. Die Dinosaurier, der Einschlag und der spätere Neubeginn mussten vollständig mit den Formen und Animationen dieser Datei umgesetzt werden.

Im Video sage ich, dass Astras Animation länger sei. In beiden SVGs stehen jedoch 24 Sekunden in `data-loop`. Mein spontaner Eindruck war falsch. Beide zeigen ungefähr elf Sekunden nach dem Start den Einschlag und lassen später ein kleines Säugetier aus seinem Bau schauen. Laut ihren Notizen kontrollierten beide Modelle gerenderte Einzelbilder und den Übergang zurück zum ersten Bild.

Mir gefällt Astras Gestaltung knapp besser, obwohl die Bewegung auf mich möglicherweise etwas weniger flüssig wirkt. Opus finde ich ebenfalls sehr gelungen. Die längere Laufzeit, die ich beim Anschauen wahrgenommen habe, fällt als Begründung für meine Vorliebe weg.

## Durch das verregnete Tokio

Das Rennspiel heißt Neon Rain: Tokyo. Im Auftrag stehen Regen, Nitro und ausdrücklich ein Parkhaus, dessen Rampen und Dach zur Strecke gehören sollen. Dass es in beiden Ergebnissen auftaucht, geht auf diese gemeinsame Vorgabe zurück. Die Aufgabe verbindet damit die Gestaltung der Stadt mit einer Umgebung, die sich tatsächlich befahren lassen muss.

Neben dem Parkhaus verlangt der Auftrag eine enge Einkaufsstraße voller Leuchtschilder, eine große Kreuzung mit Zebrastreifen und Reklametafeln sowie eine Passage unter einer Hochbahn, auf der gelegentlich ein Zug vorbeifahren soll. Dazu kommen drei Runden, drei KI Gegner und langsamer Stadtverkehr. Beim Driften soll sich die Nitroanzeige füllen. Damit hängen Fahrzeugverhalten und Streckenbau zusammen. Die enge Straße begrenzt den Platz zum Ausweichen, die Kreuzung bietet mehr Raum, und Kurven müssen zum Driften passen.

Bei Astra gefallen mir Stadt, Autos und Parkhaus besonders gut. Auch die Oberfläche spricht mich hier an. Beim Fahren reagiert die Steuerung allerdings vergleichsweise langsam, zum Driften halte ich Shift gedrückt. Den Regen finde ich bei Opus überzeugender. Dort fallen mir beim kurzen Ausprobieren auch keine groben Bugs oder offensichtlich kaputten Funktionen auf. Astras Umgebung gefällt mir optisch besser, beim Fahren stört mich die träge Reaktion.

## Was der Jam Room synchronisieren soll

Hinter der Oberfläche des Jam Rooms steckt ein gemeinsamer Sequencer mit vier Spuren. Mehrere Browser sollen denselben Takt abspielen, selbst wenn ihre Uhren voneinander abweichen. Tempowechsel sollen an der nächsten Taktgrenze greifen, nach einer Unterbrechung müssen sich Änderungen wieder zusammenführen lassen. Beide verwenden dafür Solid 1.9 und WebSockets. Solid 2.0 war nur eine Idee für einen späteren Test.

Im Video probiere ich die Bedienung in zwei Tabs aus. Bei beiden kann ich einen Raum erstellen und einer Session beitreten. Opus gefällt mir dabei besser, weil ich die Teilnehmer leichter unterscheiden kann und der fremde Cursor flüssiger wirkt. Bei Astra erscheinen beide Teilnehmer in einem ähnlichen Grün, außerdem wirkt die Bewegung des anderen Zeigers stärker verzögert. Wie stark solche Details meinen Eindruck einer Oberfläche prägen, beschäftigt mich auch beim [Bauen meiner Website mit AI Agenten](/blog/meine-website-mit-ai-agenten).

Ein übertragener Mauszeiger prüft etwas anderes als zwei gleichzeitig klingende Schläge. Wenn du die Maus bewegst, kann der andere Tab den Zeiger etwas später anzeigen und den nächsten Schlag trotzdem für den gemeinsamen Zeitpunkt planen. Meine Bedienung in zwei Tabs liefert deshalb keine Messung der Audiosynchronität und keine vollständige Prüfung von Konflikten. Beide Versionen schätzen die zeitliche Abweichung zum Server über Pingzeiten. In seiner README dokumentiert Opus außerdem einen Browsertest mit zwei Fenstern, der Uhrabweichungen von plus fünf und minus neun Sekunden simuliert. Dafür wurden keine tatsächlichen Systemuhren umgestellt.

## Remotion und die tatsächlichen Zeiten

Mit Remotion sollten beide Modelle ihr eigenes Material aus den vorherigen Aufgaben als Clip präsentieren. Die Ergebnisse und zugehörigen Dateien standen ihnen im jeweiligen Projekt zur Verfügung. Ich wollte auch Laufzeiten und verwendete Tokens eingeblendet sehen, um neben den sichtbaren Resultaten den Aufwand vergleichen zu können.

Bei Opus renderte der Mitschnitt des Rennspiels mit hoher Grafikeinstellung im Edge Browser ohne sichtbares Fenster laut Run Log schwarz, weshalb das Modell für die Aufnahme auf die mittlere Einstellung wechselte. Das passierte bei der Produktion des Trailers, beim Spielen habe ich diesen Fehler nicht beobachtet.

Hier taucht auch Iron Arena kurz auf. Test vier verlangte einen Bot für ein vorgegebenes simuliertes Panzerspiel, in dem er gegen andere Bots antritt. Die Modelle programmierten die Spiellogik ihres Bots. Für das Video fand ich die Aufgabe weniger interessant, deshalb bekam sie keine eigene vorgeführte Runde.

Mein Gefühl, Astra sei besonders schnell gewesen, passt nicht durchgehend zu den protokollierten Zeiten. Beim Rennspiel brauchte Astra rund 42 Minuten, Opus rund 34. Bei Remotion lag Astra mit rund 13 Minuten vorne, Opus benötigte rund 26. In diesen beiden Aufgaben wechselt also schon, welches Modell früher fertig war. Die Zahlen sind Einzelwerte genau dieser Läufe mit High Reasoning und tragen kein pauschales Urteil darüber, welches Modell schneller ist.

Für einen Vergleich der Tokenmengen fehlen Astras Zahlen.

## Womit ich weiterarbeiten würde

Für fast alle alltäglichen Aufgaben würde ich zuerst Opus nehmen. Seine Antworten lesen sich für mich angenehmer, und insgesamt gefällt mir auch der dabei entstandene Code besser. Astras Antworten fand ich schwerer zu lesen und die Zusammenarbeit weniger angenehm. Das ist mein persönlicher Eindruck aus der Arbeit, ohne systematische Codeprüfung. Bei 3D Modellierung und Spieleentwicklung würde ich wegen der gezeigten Ergebnisse zuerst Astra ausprobieren.
