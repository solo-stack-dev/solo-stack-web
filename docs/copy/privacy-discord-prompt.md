# Discord privacy section: generation prompt

Date: 2026-11-08. Required copy model: OpenAI gpt-6.1-sol.
Generate only the new Discord subsection for each of the German and English privacy policies of solo-stack.dev. Do not use tools, inspect files or change files. Return JSON only, without fences, with exactly two string fields: de and en. Each string must be Markdown beginning with "### Discord", followed by a blank line and one compact paragraph (two if necessary), comparable in length and detail to the Twitch/GitHub neighbours supplied below. No introduction, review commentary or other sections.

Voice rules from docs/PROJECT.md: German is primary, with a complete natural English adaptation. Personal, direct, approachable, factual, no marketing. No invented facts, numbers, dates, contractual assurances, retention periods or promises. Avoid stylistic hyphens/dashes in public profile prose; preserve proper names, official provider spelling, URLs, normal legal citations and necessary spelling. This is legal copy: match the existing formal German Sie and plural wir, and English we/you, rather than the site's informal UI voice.

Verified facts and scope:
- The operator is Peter Ruß, sole trader in Germany; Solo Stack is the channel name. Existing general sections already explain controller details, own legal bases (Art. 6(1)(f) communication/moderation, (b) contractual requests), retention criteria, rights and international transfers. Do not duplicate these at length.
- Solo Stack operates a Discord community server linked from the website by an ordinary external link: https://discord.gg/qzB5yQ2mvs (src/lib/home/data/socials.ts). There is no embedded Discord widget/feed in the website.
- Describe our server operation/moderation: information visible to us, including profile/display names and user identifiers, messages/posts/reactions and membership/roles as relevant for communication, server administration and moderation. Do not suggest access to private messages between other users, their email addresses or IP addresses; do not invent custom bots, recordings, exports or moderation archives.
- Discord separately processes account, content, connection/device and usage data to provide and secure its service and for the other purposes explained in its privacy policy. Distinguish our visible server processing from Discord's own processing. No blanket claims of joint controllership or processor-only status. Refer readers to Discord for retention, transfers, rights/settings; avoid unsupported guarantees.
- Official source verified 2026-11-08: https://discord.com/privacy identifies Discord Netherlands BV as controller for EEA residents. Its Contact us section gives Schiphol Boulevard 195, 1118 BG Schiphol, Netherlands. Official terms https://discord.com/terms (Who we are) spell the company Discord Netherlands B.V. and give the same address. Use Discord Netherlands B.V., Schiphol Boulevard 195, 1118 BG Schiphol, Niederlande/Netherlands, as the EEA provider/controller.
- Privacy policy link: https://discord.com/privacy (verified live official policy). Use a natural German/English link label.
- Match the existing section structure: heading, our server invite link, EEA provider/address, our processing as server operator/moderator, Discord processing, provider privacy link. Ensure both versions cover the same facts.

Existing context follows. Only add the Discord subsection, not any of this context, to your JSON output.

## Existing German social section

<h2 id="social-media">10. Berufliche Profile und soziale Medien</h2>

### Allgemeine Hinweise zu unseren Profilen

Wir betreiben die nachfolgend verlinkten Profile, um Inhalte zu veröffentlichen, über Projekte zu informieren und mit Interessierten und Geschäftskontakten zu kommunizieren. Die Links auf dieser Website laden keine eingebetteten Feeds der jeweiligen sozialen Netzwerke. Wenn Sie einem Link folgen, verarbeiten die Plattformen Ihre Daten nach ihren eigenen Bedingungen.

Wir verarbeiten die für uns sichtbaren Profilnamen, Kommentare, Reaktionen und Nachrichten zur Kommunikation, Moderation und Pflege unserer Präsenz. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO aufgrund unseres Interesses an Öffentlichkeitsarbeit und Austausch, bei konkreten Vertragsanfragen Art. 6 Abs. 1 lit. b DSGVO. Für eine gesondert eingeholte Einwilligung gilt Art. 6 Abs. 1 lit. a DSGVO. Öffentlich gepostete Inhalte sind für andere Nutzer sichtbar; sensible Anliegen sollten Sie per E-Mail übermitteln.

Plattformen verarbeiten darüber hinaus etwa Konto-, Geräte-, Verbindungs- und Nutzungsdaten für Betrieb, Sicherheit, Empfehlungen, Reichweitenstatistiken und gegebenenfalls Werbung. Dabei können Profile erstellt, Daten mit einem Konto verknüpft und Daten international übermittelt werden. Umfang, Rechtsgrundlagen und Speicherdauer dieser Verarbeitung bestimmen die Anbieter. Die Website erhält durch einen bloßen Link keine Kontrolle darüber.

Unsere eigenen Nachrichten und gegebenenfalls gesondert gespeicherten Kontaktdaten löschen wir nach den Kriterien in Abschnitt 3. Öffentliche Interaktionen bleiben grundsätzlich sichtbar, solange sie auf der Plattform bestehen; wir können Inhalte nur im Rahmen der Plattformfunktionen entfernen. Kopien, Weiterverbreitungen und Daten in eigener Verantwortung der Anbieter können wir nicht vollständig löschen. Sie können Ihre Rechte sowohl bei uns hinsichtlich unserer Verarbeitung als auch beim jeweiligen Anbieter geltend machen. Für Kontodaten und plattformweite Löschungen ist der Anbieter regelmäßig der geeignetere Ansprechpartner. Wir unterstützen Sie bei Anfragen zu unserer Präsenz.

### YouTube

Unser Kanal: [@solostack_dev](https://www.youtube.com/@solostack_dev). Google Ireland Limited betreibt YouTube im Europäischen Wirtschaftsraum. Bei Kommentaren und anderen Interaktionen verarbeiten wir die für uns sichtbaren Angaben zur Kommunikation und Moderation. Google verarbeitet die Nutzung des Kanals und kann daraus Empfehlungen, Werbung und Kanalstatistiken ableiten. Für Datenverarbeitung auf YouTube gelten die [Google Datenschutzhinweise](https://policies.google.com/privacy?hl=de); für Videos auf dieser Website zusätzlich Abschnitt 9.

### Instagram, Facebook und Threads

Unsere Profile: [Instagram](https://www.instagram.com/solostack.dev/), [Facebook](https://www.facebook.com/profile.php?id=61595766765047) und [Threads](https://www.threads.com/@solostack.dev). Anbieter im Europäischen Wirtschaftsraum ist Meta Platforms Ireland Limited, Merrion Road, Dublin 4, D04 X2K5, Irland. Wir verarbeiten sichtbare Interaktionen und Nachrichten für die oben genannten Zwecke. Meta kann Aktivitäten dienstübergreifend zuordnen und für personalisierte Inhalte, Werbung und Statistiken verwenden.

Soweit bei unserer Präsenz personenbezogene Daten zur Erstellung von Seitenstatistiken wie Facebook Page Insights gemeinsam verarbeitet werden, besteht hierfür eine gemeinsame Verantwortlichkeit nach Art. 26 DSGVO im Umfang der jeweiligen Meta Vereinbarung. Dies erstreckt sich nicht automatisch auf sämtliche Verarbeitungen von Meta. Meta übernimmt nach der [Page Insights Vereinbarung](https://www.facebook.com/legal/terms/page_controller_addendum) insbesondere die vorrangige Erfüllung der Informationspflichten und Betroffenenrechte für diese gemeinsame Verarbeitung. Sie können Ihre Rechte dennoch gegenüber beiden Verantwortlichen geltend machen. Die Vereinbarung beschreibt auch die Zuständigkeit der irischen Datenschutzaufsicht; Ihr eigenes Beschwerderecht bleibt bestehen. Wir erhalten dabei grundsätzlich zusammengefasste Statistiken, keine vollständigen individuellen Nutzungsprotokolle.

Weitere Informationen: [Meta Datenschutz](https://www.facebook.com/privacy/policy/), [Instagram Datenschutz](https://privacycenter.instagram.com/policy/) und [Informationen zu Page Insights](https://www.facebook.com/legal/terms/information_about_page_insights_data). Die jeweiligen Anbieterhinweise erläutern auch die für Threads geltenden Verarbeitungen, Kontoeinstellungen, Speicherfristen und Übermittlungsgarantien.

### TikTok

Unser Profil: [@solo_stack](https://www.tiktok.com/@solo_stack). Für den Europäischen Wirtschaftsraum benennt TikTok TikTok Technology Limited in Irland und TikTok Information Technologies UK Limited im Vereinigten Königreich als gemeinsam Verantwortliche. Wir verarbeiten sichtbare Kommentare, Profilangaben und Nachrichten zur Kommunikation und Moderation. TikTok verarbeitet unter anderem Videoaufrufe und Interaktionen für Empfehlungen, Statistiken und Werbung. Die Anbieterhinweise beschreiben auch internationale Zugriffe und Übermittlungen, einschließlich Bezügen zu Konzernunternehmen in China. Einzelheiten und Kontaktmöglichkeiten: [TikTok Datenschutz für den EWR](https://www.tiktok.com/legal/page/eea/privacy-policy/de).

### X

Unser Profil: [@solostack_dev](https://x.com/solostack_dev). Für Nutzer im Europäischen Wirtschaftsraum ist nach den Anbieterhinweisen X Internet Unlimited Company in Irland verantwortlich. Wir verarbeiten sichtbare Beiträge, Reaktionen und Nachrichten für Austausch und Moderation. X kann öffentliche Inhalte weiterverbreiten sowie Nutzungsdaten für Empfehlungen, Werbung und die in seiner Erklärung beschriebenen weiteren Zwecke verarbeiten. Informationen zu Übermittlungen, Widerspruchs- und Kontoeinstellungen: [X Datenschutz](https://x.com/de/privacy).

### Bluesky

Unser Profil: [@solo-stack.bsky.social](https://bsky.app/profile/solo-stack.bsky.social). Anbieter ist Bluesky Social, PBC in den USA. Wir verarbeiten sichtbare Interaktionen und Nachrichten zur Kommunikation und Moderation. Bluesky nutzt das dezentrale AT Protocol. Öffentliche Beiträge und Profilangaben können deshalb auch über andere Dienste abgerufen, gespeichert und weiterverbreitet werden; eine Löschung beim Ursprungsdienst entfernt nicht zwingend alle Kopien. Informationen zu Verarbeitung, Übermittlungen und Rechten: [Bluesky Datenschutz](https://bsky.social/about/support/privacy-policy).

### Twitch

Unser Kanal: [solo_stack](https://www.twitch.tv/solo_stack). Anbieter ist Twitch Interactive, Inc. in den USA; die für Ihren Standort zuständige Stelle nennt Twitch in seinen Datenschutzhinweisen. Wir verarbeiten sichtbare Chatbeiträge, Profilnamen und Nachrichten zur Kommunikation und Moderation. Twitch verarbeitet die Nutzung von Streams und Chats auch für Betrieb, Sicherheit, Empfehlungen und gegebenenfalls Werbung. Einzelheiten zu Speicherung, internationalen Übermittlungen und Einstellungen: [Twitch Datenschutz](https://legal.twitch.com/en/legal/privacy-notice/).

### GitHub

Unser Profil: [solo-stack-dev](https://github.com/solo-stack-dev). Anbieter sind je nach Standort und Dienst GitHub, Inc. oder GitHub B.V. Wir verarbeiten öffentliche Beiträge, Issues, Pull Requests und andere für uns sichtbare Interaktionen zur Zusammenarbeit und zur Pflege unserer Projekte. Öffentliche Repositoryinhalte und Beiträge können kopiert, geforkt und dauerhaft in Versionshistorien erhalten bleiben. GitHub verarbeitet zudem technische Nutzungsdaten für den Plattformbetrieb und eigene Zwecke. Einzelheiten: [GitHub Datenschutzerklärung](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).


## Existing English social section

<h2 id="social-media">10. Professional profiles and social media</h2>

### General information about our profiles

We operate the profiles linked below to publish content, share project updates and communicate with interested people and business contacts. Links on this website do not load embedded feeds from the respective social networks. When you follow a link, the platforms process your data under their own terms.

We process profile names, comments, reactions and messages visible to us for communication, moderation and maintaining our presence. The legal basis is Article 6(1)(f) GDPR, based on our interest in public communication and exchange, or Article 6(1)(b) GDPR for specific contractual requests. Article 6(1)(a) GDPR applies where consent is separately obtained. Public posts are visible to other users; please use email for sensitive matters.

Platforms additionally process account, device, connection and usage data for operation, security, recommendations, audience statistics and, where applicable, advertising. They may create profiles, associate data with an account and transfer data internationally. The providers determine the scope, legal bases and retention periods of that processing. A simple link does not give this website control over it.

We delete our own messages and any separately retained contact details according to section 3. Public interactions generally remain visible while they exist on the platform; we can remove content only through the platform's functions. We cannot completely delete copies, redistributed material or data under providers' own control. You can exercise your rights with us regarding our processing and with the relevant provider. The provider is generally better placed to handle account data and platform-wide erasure. We will assist with requests relating to our presence.

### YouTube

Our channel: [@solostack_dev](https://www.youtube.com/@solostack_dev). Google Ireland Limited operates YouTube in the European Economic Area. We process information visible to us in comments and other interactions for communication and moderation. Google processes channel use and may derive recommendations, advertising and channel statistics from it. The [Google privacy policy](https://policies.google.com/privacy?hl=en) applies to processing on YouTube; section 9 additionally applies to videos on this website.

### Instagram, Facebook and Threads

Our profiles: [Instagram](https://www.instagram.com/solostack.dev/), [Facebook](https://www.facebook.com/profile.php?id=61595766765047) and [Threads](https://www.threads.com/@solostack.dev). The provider in the European Economic Area is Meta Platforms Ireland Limited, Merrion Road, Dublin 4, D04 X2K5, Ireland. We process visible interactions and messages for the purposes described above. Meta may associate activities across services and use them for personalised content, advertising and statistics.

Where personal data relating to our presence are jointly processed to produce page statistics such as Facebook Page Insights, joint controllership under Article 26 GDPR applies within the scope of the relevant Meta agreement. It does not automatically extend to all Meta processing. Under the [Page Insights agreement](https://www.facebook.com/legal/terms/page_controller_addendum), Meta assumes primary responsibility in particular for information duties and data subject rights for this joint processing. You can nevertheless exercise your rights against either controller. The agreement also describes the role of the Irish supervisory authority; your own right to complain remains unaffected. We generally receive aggregated statistics rather than complete individual usage records.

Further information: [Meta privacy policy](https://www.facebook.com/privacy/policy/), [Instagram privacy policy](https://privacycenter.instagram.com/policy/) and [Page Insights information](https://www.facebook.com/legal/terms/information_about_page_insights_data). The respective provider notices also explain processing applicable to Threads, account settings, retention periods and transfer safeguards.

### TikTok

Our profile: [@solo_stack](https://www.tiktok.com/@solo_stack). For the European Economic Area, TikTok identifies TikTok Technology Limited in Ireland and TikTok Information Technologies UK Limited in the United Kingdom as joint controllers. We process visible comments, profile details and messages for communication and moderation. TikTok processes video views and interactions, among other data, for recommendations, statistics and advertising. Its notices also describe international access and transfers, including links to group companies in China. Details and contact options: [TikTok privacy policy for the EEA](https://www.tiktok.com/legal/page/eea/privacy-policy/en).

### X

Our profile: [@solostack_dev](https://x.com/solostack_dev). According to the provider's notice, X Internet Unlimited Company in Ireland is responsible for users in the European Economic Area. We process visible posts, reactions and messages for exchange and moderation. X may redistribute public content and process usage data for recommendations, advertising and the other purposes described in its policy. Information about transfers, objection options and account settings: [X privacy policy](https://x.com/en/privacy).

### Bluesky

Our profile: [@solo-stack.bsky.social](https://bsky.app/profile/solo-stack.bsky.social). The provider is Bluesky Social, PBC in the USA. We process visible interactions and messages for communication and moderation. Bluesky uses the decentralised AT Protocol. Public posts and profile information may therefore also be accessed, stored and redistributed through other services; deletion at the originating service does not necessarily remove every copy. Information about processing, transfers and rights: [Bluesky privacy policy](https://bsky.social/about/support/privacy-policy).

### Twitch

Our channel: [solo_stack](https://www.twitch.tv/solo_stack). The provider is Twitch Interactive, Inc. in the USA; Twitch identifies the entity responsible for your location in its privacy notice. We process visible chat posts, profile names and messages for communication and moderation. Twitch also processes stream and chat use for operation, security, recommendations and, where applicable, advertising. Details of retention, international transfers and settings: [Twitch privacy notice](https://legal.twitch.com/en/legal/privacy-notice/).

### GitHub

Our profile: [solo-stack-dev](https://github.com/solo-stack-dev). Depending on location and service, the providers are GitHub, Inc. or GitHub B.V. We process public contributions, issues, pull requests and other interactions visible to us for collaboration and maintaining our projects. Public repository contents and contributions may be copied, forked and retained permanently in version histories. GitHub also processes technical usage data for platform operation and its own purposes. Details: [GitHub privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).

