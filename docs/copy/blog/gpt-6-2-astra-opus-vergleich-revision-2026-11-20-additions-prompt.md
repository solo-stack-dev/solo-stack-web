Schreib für Solo Stack zwei kurze Ergänzungen in deutscher Sprache aus Sicht des Autors. Verwende keine Tools. Antworte nur mit einem JSON Objekt mit zwei Feldern, "blender" und "tokyo". Jedes Feld ist ein zusammenhängender Absatz von rund 65 bis 80 Wörtern, der direkt nach dem jeweiligen bestehenden Abschnitt stehen kann. Hab einen natürlichen, lockeren Schreibstil und mach konkrete Aussagen ohne Floskeln, Eigenlob, Bindestriche, Gedankenstriche, Doppelpunkte oder Semikolons. Namen und Schreibweisen im Code bleiben intakt. Keine neuen Handlungen oder Meinungen des Autors. Die folgenden Fakten reichen.

Blender: Im Brief zur Erzeugung von Minas Tirith ist eine in Terrassen angelegte Stadt mit sieben Ringen vorgegeben. Laut Notizen bauen beide Modelle die Szene prozedural mit Python auf. Astra dokumentiert unterschiedliche Häusertypen mit Schieferdächern, Gauben, Kapellen und Türmen und erwähnt zugleich, dass sich eine begrenzte Zahl von Grundrissen wiederholt. Opus dokumentiert 558 Häuser und Türme verteilt auf die Terrassen, mit verschiedenen Dacharten. Die Zahl 558 gilt nur für Opus und umfasst die Türme. Beide notieren, dass sie die Szene mit ihrem jeweiligen Skript aus einer frischen Blender Sitzung neu erzeugen konnten. Das ist ein Befund aus den Notizen, keine eigene Prüfung des Autors. Mach daraus eine verständliche Schilderung, wie die Modelle die Stadt in Code aufgebaut haben. Der Absatz darf erwähnen, warum ein reproduzierbares Skript bei einer solchen Aufgabe praktisch ist.

Tokio: Der Auftrag für das Rennspiel gibt außer dem Parkhaus eine enge Einkaufsstraße mit vielen Leuchtschildern, eine große Kreuzung mit Zebrastreifen und Reklametafeln sowie eine Passage unter einer Hochbahn vor, auf der gelegentlich ein Zug vorbeifahren soll. Die Aufgabe ist als Rundkurs mit drei Runden, drei KI Gegnern und etwas langsamem Stadtverkehr angelegt. Beim Driften soll sich die Nitroanzeige füllen. Das sind Vorgaben, keine Liste bestätigter Eigenschaften beider Spiele. Erkläre anhand konkreter Vorgaben, warum diese Aufgabe Fahrzeug und Leveldesign zusammenbringt. Behaupte nicht, dass der Autor eine ganze Strecke, jedes Feature oder bestimmte Spieler in beiden Implementierungen geprüft hat.

Bisheriger Text zur Orientierung:

Astras Steuerung im Rennspiel reagiert beim Ausprobieren vergleichsweise träge, obwohl mir die Stadt und die Autos auf Anhieb besser gefallen. Für meinen Vergleich liefen GPT 6.2 Astra und Claude Opus 5.5 jeweils mit High Reasoning. Beide bekamen dieselben Prompts und starteten in frischen Arbeitsordnern mit im Wesentlichen gleicher sauberer Umgebung. Vor dem Ausprobieren habe ich die fertigen Ergebnisse nicht von Hand nachgebessert.

## Minas Tirith in Blender

Opus liefert bei Minas Tirith schon eine Umsetzung, die ich sehr beeindruckend finde. Die allgemeine Form, die Gebäude und der Baum passen für mich gut zusammen. Bei Astra gefällt mir die farbliche Gestaltung noch besser. Dazu kommt der weiße Baum als Zeichen auf dem Tor, der mir im Video besonders auffällt. Der große Baum ragt etwas über den Rand hinaus, insgesamt bevorzuge ich trotzdem Astras Szene.

Beide Projekte bauen die Szene mit einem Python Skript in Blender auf. Zum Auftrag gehört auch, das erzeugte Bild zu prüfen und die Szene anschließend zu überarbeiten. Laut Astras Notizen hat das Modell mehrere Kameraansichten kontrolliert und danach unter anderem die Bergsilhouetten sowie den Ausschnitt der Hauptansicht angepasst. Opus hält nach seinen Vorschaurenderings Korrekturen an Fels und Beleuchtung fest.

## Extinction Day als SVG

Bei Extinction Day war eine einzige animierte SVG Datei gefordert, ohne JavaScript, Rasterbilder oder externe Ressourcen. Die Dinosaurier, der Einschlag und der spätere Neubeginn mussten vollständig mit den Formen und Animationen dieser Datei umgesetzt werden.

Im Video sage ich, dass Astras Animation länger sei. In beiden SVGs stehen jedoch 24 Sekunden in `data-loop`. Mein spontaner Eindruck war falsch. Beide zeigen ungefähr elf Sekunden nach dem Start den Einschlag und lassen später ein kleines Säugetier aus seinem Bau schauen. Laut ihren Notizen kontrollierten beide Modelle gerenderte Einzelbilder und den Übergang zurück zum ersten Bild.

Mir gefällt Astras Gestaltung knapp besser, obwohl die Bewegung auf mich möglicherweise etwas weniger flüssig wirkt. Opus finde ich ebenfalls sehr gelungen. Die längere Laufzeit, die ich beim Anschauen wahrgenommen habe, fällt als Begründung für meine Vorliebe weg.

## Durch das verregnete Tokio

Das Rennspiel heißt Neon Rain: Tokyo. Im Auftrag stehen Regen, Nitro und ausdrücklich ein Parkhaus, dessen Rampen und Dach zur Strecke gehören sollen. Dass es in beiden Ergebnissen auftaucht, geht auf diese gemeinsame Vorgabe zurück. Die Aufgabe verbindet damit die Gestaltung der Stadt mit einer Umgebung, die sich tatsächlich befahren lassen muss.

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
