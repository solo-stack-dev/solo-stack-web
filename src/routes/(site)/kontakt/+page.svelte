<!--
	/kontakt: a letter written at night (giant title, butter wash, painted moon, ruled-line form, topic pill track).
	Prerendered; only the submission runs in the Worker: `sendContact` (`#lib/contact/contact.remote.ts`), valibot preflight
	plus the same schema on the server, Turnstile against spam. Issue codes map to `contact_error_*` messages.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { sendContact } from '#lib/contact/contact.remote.ts';
	import { CONTACT_LIMITS, CONTACT_TOPICS, ContactSchema, type ContactTopic } from '#lib/contact/schema.ts';
	import TurnstileWidget from '#lib/contact/TurnstileWidget.svelte';
	import StarField from '#lib/home/shared/StarField.svelte';
	import moon from '#lib/home/sections/hero/assets/hero-moon-disc.webp?w=480;300&quality=42&enhanced';
	import bloom from '#lib/home/sections/making/assets/making-bloom-chart.webp?w=480&format=webp&quality=40&enhanced';
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';

	const TOPIC_LABELS: Record<ContactTopic, () => string> = {
		business: m.contact_topic_business,
		collab: m.contact_topic_collab,
		feedback: m.contact_topic_feedback,
		other: m.contact_topic_other
	};

	const contact = sendContact.preflight(ContactSchema);
	const { fields } = contact;

	let sent = $state(false);
	let failed = $state(false);
	let challengeFailed = $state(false);
	let token = $state('');
	let turnstile = $state<ReturnType<typeof TurnstileWidget>>();
	let successHeading = $state<HTMLElement>();

	// Runs after preflight passed, so every call reaches the server and spends the Turnstile token.
	const enhanced = contact.enhance(async (instance) => {
		failed = false;
		try {
			// No arguments: nothing on this page needs a refresh
			if (await instance.submit().updates()) {
				instance.element.reset();
				sent = true;
			}
		} catch {
			failed = true;
		} finally {
			turnstile?.reset();
		}
	});

	$effect(() => {
		if (sent) successHeading?.focus();
	});

	const invalid = {
		topic: () => !!fields.topic.issues(),
		name: () => !!fields.name.issues(),
		email: () => !!fields.email.issues(),
		message: () => !!fields.message.issues(),
		turnstile: () => !!fields.turnstile.issues() || challengeFailed
	};

	const canonical = $derived(new URL(page.url.pathname, page.url.origin).href);
</script>

<svelte:head>
	<title>{m.contact_meta_title()}</title>
	<meta name="description" content={m.contact_meta_description()} />
	<link rel="canonical" href={canonical} />
	<link rel="preconnect" href="https://challenges.cloudflare.com" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="SOLO STACK" />
	<meta property="og:title" content={m.contact_meta_title()} />
	<meta property="og:description" content={m.contact_meta_description()} />
	<meta property="og:url" content={canonical} />
	<meta name="twitter:card" content="summary" />
</svelte:head>

{#snippet fieldError(id: string, show: boolean, text: string)}
	<p {id} class="error" aria-live="polite">
		{#if show}{text}{/if}
	</p>
{/snippet}

<div class="relative isolate overflow-x-clip">
	<!-- Night sky over the header, dark theme only -->
	<div class="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-[34rem] mask-b-from-30% dark:block" aria-hidden="true">
		<StarField density={0.5} brightness={0.7} seed={71} />
	</div>

	<div class="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6 sm:pt-16 lg:px-8">
		<header class="relative grid gap-5">
			<div class="moon" aria-hidden="true">
				<enhanced:img src={moon} alt="" sizes="(min-width: 48rem) 15rem, 9rem" class="size-full" fetchpriority="high" />
			</div>
			<div class="relative isolate w-fit">
				<span
					class="bloom pointer-events-none absolute top-[30%] -left-6 -z-10 block h-[90%] w-[85%] opacity-55 mix-blend-multiply dark:opacity-25 dark:mix-blend-normal"
					style:background-image="url({bloom.img.src})"
					aria-hidden="true"
				></span>
				<h1 class="giant font-display leading-[0.8] font-black tracking-wordmark text-balance">{m.contact_title()}</h1>
			</div>
			<p class="max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">{m.contact_intro()}</p>
		</header>

		<div class="mt-14 max-w-3xl sm:mt-20">
			{#if sent}
				<section class="sent grid justify-items-start gap-5 py-6" aria-labelledby="contact-sent">
					<h2
						id="contact-sent"
						tabindex="-1"
						bind:this={successHeading}
						class="sent-title font-display text-5xl leading-none font-black tracking-wordmark focus:outline-none sm:text-6xl"
					>
						{m.contact_success_title()}
					</h2>
					<p class="max-w-xl text-lg text-pretty text-muted-foreground" role="status">{m.contact_success_body()}</p>
					<button type="button" class="again" onclick={() => (sent = false)}>{m.contact_success_again()}</button>
				</section>
			{:else}
				<form {...enhanced} class="letter relative grid gap-12" data-sending={contact.pending > 0 || undefined} novalidate>
					<fieldset class="grid min-w-0 gap-4" aria-describedby="contact-topic-error">
						<legend class="mb-4 label">{m.contact_topic_legend()}</legend>
						<div class="track-scroll">
							<div class="track">
								{#each CONTACT_TOPICS as topic (topic)}
									<label class="topic">
										<input class="sr-only" {...fields.topic.as('radio', topic)} />
										<span>{TOPIC_LABELS[topic]()}</span>
									</label>
								{/each}
							</div>
						</div>
						{@render fieldError('contact-topic-error', invalid.topic(), m.contact_error_topic())}
					</fieldset>

					<div class="grid gap-12 sm:grid-cols-2 sm:gap-8">
						<div class="field">
							<label class="label" for="contact-name">{m.contact_name_label()}</label>
							<div class="write">
								<input
									id="contact-name"
									class="line"
									autocomplete="name"
									maxlength={CONTACT_LIMITS.name}
									required
									aria-describedby="contact-name-error"
									{...fields.name.as('text')}
								/>
								<span class="rule" aria-hidden="true"></span>
							</div>
							{@render fieldError('contact-name-error', invalid.name(), m.contact_error_name())}
						</div>

						<div class="field">
							<label class="label" for="contact-email">{m.contact_email_label()}</label>
							<div class="write">
								<input
									id="contact-email"
									class="line"
									autocomplete="email"
									maxlength={CONTACT_LIMITS.email}
									required
									aria-describedby="contact-email-hint contact-email-error"
									{...fields.email.as('email')}
								/>
								<span class="rule" aria-hidden="true"></span>
							</div>
							<p id="contact-email-hint" class="hint">{m.contact_email_hint()}</p>
							{@render fieldError('contact-email-error', invalid.email(), m.contact_error_email())}
						</div>
					</div>

					<div class="field">
						<label class="label" for="contact-message">{m.contact_message_label()}</label>
						<div class="write">
							<textarea
								id="contact-message"
								class="pad"
								rows="7"
								minlength={CONTACT_LIMITS.messageMin}
								maxlength={CONTACT_LIMITS.messageMax}
								required
								placeholder={m.contact_message_placeholder()}
								aria-describedby="contact-message-error"
								{...fields.message.as('text')}></textarea>
							<span class="rule" aria-hidden="true"></span>
						</div>
						{@render fieldError('contact-message-error', invalid.message(), m.contact_error_message())}
					</div>

					<!-- Honeypot: off screen, out of the tab order -->
					<div class="pointer-events-none absolute -left-[9999px] size-px overflow-hidden" aria-hidden="true">
						<label for="contact-website">{m.contact_honeypot_label()}</label>
						<input id="contact-website" tabindex="-1" autocomplete="off" {...fields.website.as('text')} />
					</div>

					<div class="grid gap-6">
						<input {...fields.turnstile.as('hidden', token)} />
						<TurnstileWidget bind:this={turnstile} ontoken={(value) => (token = value)} onerror={(value) => (challengeFailed = value)} />
						{@render fieldError('contact-turnstile-error', invalid.turnstile(), m.contact_error_turnstile())}

						<div class="flex flex-wrap items-center gap-x-6 gap-y-4">
							<button type="submit" class="send" disabled={contact.pending > 0}>
								<span class="dot" aria-hidden="true"></span>
								{contact.pending > 0 ? m.contact_sending() : m.contact_submit()}
							</button>
							<p class="max-w-sm text-sm text-pretty text-muted-foreground">
								{m.contact_privacy_note()}
								<!-- TODO(owner): drop rel="external" once /datenschutz exists (keeps the prerender crawler from failing on it) -->
								<a href={localizeHref('/datenschutz')} rel="external" class="privacy">
									{m.contact_privacy_link()}
								</a>
							</p>
						</div>

						<p class="error" role="alert">
							{#if failed}{m.contact_error_failed()}{/if}
						</p>
						<noscript><p class="text-sm text-muted-foreground">{m.contact_noscript()}</p></noscript>
					</div>
				</form>
			{/if}
		</div>
	</div>
</div>

<style>
	.giant {
		font-size: clamp(4.5rem, 14vw, 10rem);
		/* Ink on paper; moonlit at night (as /blog) */
		background: linear-gradient(180deg, var(--foreground) 55%, color-mix(in oklab, var(--foreground) 70%, var(--color-ochre)));
		background-clip: text;
		color: transparent;
		padding-bottom: 0.16em;
		margin-bottom: -0.16em;
	}

	:global(.dark) .giant {
		background: linear-gradient(180deg, var(--color-cream) 40%, var(--color-butter));
		background-clip: text;
		text-shadow: 0 0 60px rgb(252 215 114 / 0.15);
	}

	.bloom {
		background-size: 100% 100%;
		background-repeat: no-repeat;
		transform: rotate(-2deg);
	}

	/* Painted moon over the header's right edge, breathing its glow */
	.moon {
		position: absolute;
		top: -1.5rem;
		right: -2rem;
		z-index: -1;
		width: clamp(9rem, 24vw, 15rem);
		aspect-ratio: 1;
		border-radius: 50%;
		pointer-events: none;
		filter: drop-shadow(0 0 40px rgb(252 215 114 / 0.35));
		animation: breathe 7s ease-in-out infinite alternate;
	}

	@keyframes breathe {
		to {
			filter: drop-shadow(0 0 64px rgb(252 215 114 / 0.55));
		}
	}

	/*
	 * The letter: no boxes. Every field is a ruled line on the page; focus is drawn in the material (the ink runs in from the
	 * left and glows, the label lights up with a drop of ink, the caret is butter). Colors are the `--ink-*` tokens in layout.css.
	 */
	.letter {
		--pad-rule: color-mix(in oklab, var(--color-ochre) 30%, transparent);
		--pad-rule-lit: color-mix(in oklab, var(--color-ochre) 48%, transparent);
	}

	:global(.dark) .letter {
		--pad-rule: color-mix(in oklab, var(--color-cream) 9%, transparent);
		--pad-rule-lit: color-mix(in oklab, var(--color-butter) 16%, transparent);
	}

	/* Mono captions, quieter than the writing */
	.label {
		position: relative;
		width: fit-content;
		font-size: 0.75rem;
		font-weight: 600;
		color: color-mix(in oklab, var(--foreground) 74%, transparent);
		transition: color var(--dur-state) ease;
	}

	/* A drop of ink hangs in front of the label of the field being written */
	.field > .label::before {
		content: '';
		position: absolute;
		top: 50%;
		left: -0.95rem;
		width: 0.375rem;
		height: 0.375rem;
		margin-top: -0.1875rem;
		border-radius: 50%;
		background: var(--ink-lit);
		box-shadow: 0 0 0.5rem 0.05rem var(--ink-glow);
		scale: 0;
		transition: scale var(--dur-state) var(--ease-settle);
	}

	/* Phones: no gutter to hang it in, so it follows the label */
	@media (max-width: 39.99rem) {
		.field > .label::before {
			left: calc(100% + 0.35rem);
		}
	}

	.field:focus-within > .label {
		color: var(--ink-lit);
	}

	.field:focus-within > .label::before {
		scale: 1;
	}

	.field {
		display: grid;
		gap: 0.5rem;
		align-content: start;
	}

	/* An invalid field writes in warm red: line, glow, label drop */
	.field:has([aria-invalid='true']) {
		--ink-lit: var(--ink-error);
		--ink-wet: var(--ink-error);
		--ink-glow: color-mix(in oklab, var(--ink-error) 35%, transparent);
	}

	.write {
		position: relative;
		display: grid;
	}

	.line,
	.pad {
		width: 100%;
		border: 0;
		border-radius: 0;
		background-color: transparent;
		color: var(--foreground);
		font-size: 1.125rem;
		caret-color: var(--ink-caret);
		/* Focus is the inked line, the lit label and the caret (no box) */
		outline: none;
		box-shadow: none;
		animation: none;
	}

	.line {
		min-height: 3rem;
		padding: 0.375rem 0 0.5rem;
	}

	/* Lined letter pad: the rules scroll with the text; the last one is the ruled baseline below */
	.pad {
		--rule: 2.25rem;
		display: block;
		min-height: calc(var(--rule) * 7 + 0.25rem);
		padding: 0.25rem 0 0;
		resize: vertical;
		background-image: linear-gradient(transparent calc(var(--rule) - 1px), var(--pad-rule) 0);
		background-size: 100% var(--rule);
		background-position: 0 0.25rem;
		background-attachment: local;
		line-height: var(--rule);
	}

	/* The letter grows with the message instead of showing a resize grip */
	@supports (field-sizing: content) {
		.pad {
			field-sizing: content;
			max-height: max(24rem, 70svh);
			resize: none;
		}
	}

	.pad:focus {
		--pad-rule: var(--pad-rule-lit);
	}

	.pad::placeholder {
		color: var(--muted-foreground);
		opacity: 0.8;
		transition: opacity var(--dur-state) ease;
	}

	.pad:focus::placeholder {
		opacity: 0.45;
	}

	/* The ruled baseline; the ink runs in from the left on focus (bright wet tip leading) and dries off when you leave */
	.rule {
		position: absolute;
		inset: auto 0 0;
		height: 1.5px;
		background: var(--ink-rule);
		pointer-events: none;
		transition: background-color var(--dur-hover) ease;
	}

	.rule::after {
		content: '';
		position: absolute;
		inset: auto 0 -0.75px;
		height: 3px;
		border-radius: 3px;
		background: linear-gradient(90deg, var(--ink-lit) 0 82%, var(--ink-wet));
		box-shadow:
			0 0 0.25rem var(--ink-glow),
			0 0.15rem 0.9rem var(--ink-glow);
		opacity: 0;
		transform: scaleX(0);
		transform-origin: left;
		transition:
			opacity var(--dur-state) ease,
			transform 0s linear var(--dur-state);
	}

	.write:hover .rule {
		background-color: var(--ink-rule-hover);
	}

	.write:focus-within .rule::after,
	.field:has([aria-invalid='true']) .rule::after {
		opacity: 1;
		transform: none;
		transition:
			opacity 120ms ease,
			transform 560ms var(--ease-settle);
	}

	/* Invalid but not being written: the red line, no glow */
	.field:has([aria-invalid='true']) .write:not(:focus-within) .rule::after {
		box-shadow: none;
	}

	/* Browser autofill: keep the paper (Chrome's yellow/blue fill held off by an endless transition) and show the line as written */
	.line:-webkit-autofill,
	.line:-webkit-autofill:hover,
	.line:-webkit-autofill:focus {
		-webkit-text-fill-color: var(--foreground);
		caret-color: var(--ink-caret);
		transition:
			background-color 100000s 0s,
			color 100000s 0s;
	}

	.line:autofill {
		-webkit-text-fill-color: var(--foreground);
		transition:
			background-color 100000s 0s,
			color 100000s 0s;
	}

	.write:has(.line:-webkit-autofill) .rule {
		background-color: color-mix(in oklab, var(--ink-lit) 55%, transparent);
	}

	.write:has(.line:autofill) .rule {
		background-color: color-mix(in oklab, var(--ink-lit) 55%, transparent);
	}

	/* Disabled: a dotted line, dimmed writing */
	.line:disabled,
	.pad:disabled {
		color: var(--muted-foreground);
		cursor: not-allowed;
	}

	.write:has(:disabled) .rule {
		background: repeating-linear-gradient(90deg, var(--ink-rule) 0 0.4rem, transparent 0 0.75rem);
	}

	/* While the letter is on its way the page rests */
	.letter[data-sending] fieldset,
	.letter[data-sending] .field {
		opacity: 0.55;
		cursor: progress;
	}

	.letter fieldset,
	.letter .field {
		transition: opacity var(--dur-state) ease;
	}

	.hint {
		font-size: 0.8125rem;
		color: var(--muted-foreground);
	}

	/* Error: a short stroke of red ink, then the message */
	.error {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		font-size: 0.875rem;
		font-weight: 500;
		text-wrap: pretty;
		color: var(--ink-error);
		animation: error-in var(--dur-state) var(--ease-settle);
	}

	.error::before {
		content: '';
		flex: none;
		width: 0.85rem;
		height: 2px;
		border-radius: 2px;
		background: currentColor;
		translate: 0 -0.3em;
	}

	.error:empty {
		display: none;
	}

	@keyframes error-in {
		from {
			opacity: 0;
			translate: 0 -0.25rem;
		}
	}

	/*
	 * Topic pills on a pressed-in track; the chosen one is a lit butter disc (as the blog filter). Phones: the pills wrap into
	 * full rows, so every choice is in view (no sideways scrolling inside a form).
	 */
	.track-scroll {
		margin: -0.5rem -1rem;
		padding: 0.5rem 1rem;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.track-scroll::-webkit-scrollbar {
		display: none;
	}

	.track {
		display: flex;
		width: max-content;
		gap: 0.125rem;
		/* Room for the focus ring inside the track */
		padding: 0.3125rem;
		border-radius: 999px;
		background: color-mix(in oklab, var(--foreground) 5%, transparent);
		box-shadow:
			inset 0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent),
			inset 0 1px 3px color-mix(in oklab, var(--color-ink) 14%, transparent);
	}

	.topic {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		padding: 0 1.1rem;
		border-radius: 999px;
		color: var(--muted-foreground);
		font-size: 0.9375rem;
		font-weight: 500;
		white-space: nowrap;
		cursor: pointer;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		transition:
			color var(--dur-state) ease,
			background-color var(--dur-state) ease,
			box-shadow var(--dur-state) ease,
			scale var(--dur-hover) var(--ease-settle);
	}

	.topic:hover {
		color: var(--foreground);
		background-color: color-mix(in oklab, var(--foreground) 6%, transparent);
	}

	.topic:active {
		scale: 0.97;
	}

	.topic:has(:checked) {
		background: radial-gradient(110% 130% at 50% -25%, color-mix(in oklab, var(--color-moonlight) 80%, transparent), transparent 62%) var(--color-butter);
		color: var(--color-night);
		box-shadow:
			inset 0 0 0 1px color-mix(in oklab, var(--color-ochre) 50%, transparent),
			0 2px 14px -3px color-mix(in oklab, var(--color-ochre) 70%, transparent);
	}

	:global(.dark) .topic:has(:checked) {
		box-shadow:
			inset 0 0 0 1px color-mix(in oklab, var(--color-moonlight) 40%, transparent),
			0 2px 16px -2px color-mix(in oklab, var(--color-butter) 55%, transparent);
	}

	.topic:has(:focus-visible) {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}

	@media (max-width: 39.99rem) {
		.track-scroll {
			margin: 0;
			padding: 0;
			overflow: visible;
		}

		.track {
			flex-wrap: wrap;
			width: auto;
			border-radius: 1.7rem;
		}

		.topic {
			flex: 1 1 auto;
			justify-content: center;
		}
	}

	/* Butter pill, lit from above; its moon rises on hover, it presses in, and a sheen runs while sending */
	.send {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		min-height: 3.25rem;
		padding: 0 1.75rem 0 1.3rem;
		border-radius: 999px;
		background: linear-gradient(
			180deg,
			color-mix(in oklab, var(--color-moonlight) 60%, var(--color-butter)),
			var(--color-butter) 55%,
			color-mix(in oklab, var(--color-butter) 84%, var(--color-ochre))
		);
		color: var(--color-night);
		font-weight: 700;
		--send-edge: inset 0 1px 0 rgb(255 255 255 / 0.55), inset 0 -1px 0 color-mix(in oklab, var(--color-ochre) 55%, transparent);
		box-shadow:
			var(--send-edge),
			0 6px 24px -6px color-mix(in oklab, var(--color-ochre) 75%, transparent);
		-webkit-tap-highlight-color: transparent;
		transition:
			translate var(--dur-hover) var(--ease-settle),
			scale var(--dur-hover) var(--ease-settle),
			box-shadow var(--dur-state) ease;
	}

	.send:hover:not(:disabled) {
		translate: 0 -2px;
		box-shadow:
			var(--send-edge),
			0 12px 34px -8px color-mix(in oklab, var(--color-ochre) 85%, transparent);
	}

	.send:active:not(:disabled) {
		translate: 0 1px;
		scale: 0.985;
		box-shadow:
			var(--send-edge),
			0 2px 10px -4px color-mix(in oklab, var(--color-ochre) 80%, transparent);
		transition-duration: 60ms;
	}

	.send:focus-visible {
		outline-offset: 4px;
	}

	.send:disabled {
		cursor: progress;
	}

	.send:disabled::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background: linear-gradient(100deg, transparent 30%, color-mix(in oklab, var(--color-moonlight) 85%, transparent) 50%, transparent 70%);
		translate: -100% 0;
		animation: sheen 1.5s ease-in-out infinite;
	}

	@keyframes sheen {
		to {
			translate: 100% 0;
		}
	}

	.dot {
		width: 0.85rem;
		height: 0.85rem;
		border-radius: 50%;
		/* a crescent: night shadow over a cream disc */
		background: radial-gradient(circle at 70% 35%, var(--color-butter) 45%, transparent 47%), var(--color-night);
		transition: translate 300ms cubic-bezier(0.3, 1.35, 0.5, 1);
	}

	.send:hover:not(:disabled) .dot {
		translate: 0 -2px;
	}

	.send:disabled .dot {
		animation: pulse 1s ease-in-out infinite alternate;
	}

	@keyframes pulse {
		to {
			opacity: 0.35;
		}
	}

	.privacy {
		color: var(--foreground);
		text-decoration: underline 1.5px var(--color-ochre);
		text-underline-offset: 4px;
		transition: text-decoration-color var(--dur-hover) ease;
	}

	.privacy:hover {
		text-decoration-color: currentColor;
	}

	/* Sent: the page settles, the heading is underlined by hand in ink */
	.sent {
		animation: sent-in var(--dur-reveal) var(--ease-settle) both;
	}

	@keyframes sent-in {
		from {
			opacity: 0;
			translate: 0 0.75rem;
		}
	}

	.sent-title {
		position: relative;
		padding-bottom: 0.2em;
	}

	.sent-title::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0.05em;
		bottom: -0.04em;
		height: 0.17em;
		background: var(--ink-lit);
		mask: var(--ink-underline) center / 100% 100% no-repeat;
		clip-path: inset(0 100% 0 0);
		animation: ink-draw 900ms var(--ease-settle) 250ms forwards;
	}

	@keyframes ink-draw {
		to {
			clip-path: inset(0);
		}
	}

	.again {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		padding: 0 1.35rem;
		border-radius: 999px;
		font-weight: 600;
		box-shadow: inset 0 0 0 1.5px color-mix(in oklab, var(--foreground) 25%, transparent);
		transition:
			box-shadow var(--dur-hover) ease,
			background-color var(--dur-hover) ease;
	}

	.again:hover {
		background-color: color-mix(in oklab, var(--color-butter) 14%, transparent);
		box-shadow: inset 0 0 0 1.5px var(--color-ochre);
	}

	.again:focus-visible {
		box-shadow: inset 0 0 0 1.5px var(--color-ochre);
	}

	@media (prefers-reduced-motion: reduce) {
		.send:disabled::after {
			display: none;
		}

		.sent-title::after {
			clip-path: none;
			animation: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.moon,
		.send:disabled .dot {
			animation: none;
		}

		.send,
		.dot,
		.topic {
			transition: none;
		}
	}
</style>
