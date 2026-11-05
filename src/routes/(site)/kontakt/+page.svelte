<!--
	/kontakt: a letter written at night (giant title, butter wash, the night owl messenger, ruled-line form, topics ticked on the ruled lines).
	Prerendered; only the submission runs in the Worker: `sendContact` (`#lib/contact/contact.remote.ts`), valibot preflight
	plus the same schema on the server, Turnstile against spam. Issue codes map to `contact_error_*` messages.
-->
<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { page } from '$app/state';
	import { sendContact } from '#lib/contact/contact.remote.ts';
	import { CONTACT_LIMITS, CONTACT_TOPICS, ContactSchema, type ContactTopic } from '#lib/contact/schema.ts';
	import OwlMessenger from '#lib/contact/OwlMessenger.svelte';
	import TurnstileWidget from '#lib/contact/TurnstileWidget.svelte';
	import StarField from '#lib/home/shared/StarField.svelte';
	import { reducedMotion } from '#lib/home/shared/motion.svelte.ts';
	import seal from '#lib/contact/assets/wax-seal.webp?w=288;216;144&enhanced';
	import sealPressed from '#lib/contact/assets/wax-seal-pressed.webp?w=288;216;144&enhanced';
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
	/** Someone is at the letter (pointer over it or focus in it): the owl watches. */
	let hovering = $state(false);
	let focused = $state(false);

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

	// The owl takes off with the letter at the top of the page: bring it into view, then hand focus to the thanks
	$effect(() => {
		if (!sent) return;
		successHeading?.focus({ preventScroll: true });
		window.scrollTo({ top: 0, behavior: reducedMotion.current ? 'instant' : 'smooth' });
	});

	/**
	 * A failed preflight leaves the issues on the fields but focus on the send button, often a screen below the first error.
	 * Once the issues are on the page, scroll that field's block under the sticky nav (`scroll-margin-top`) and focus its
	 * control (the topic: its first choice). The Turnstile input is hidden, so its message is only brought into view.
	 */
	function revealFirstIssue(event: SubmitEvent) {
		const form = event.currentTarget as HTMLFormElement;
		setTimeout(async () => {
			await tick();
			if (sent || contact.pending > 0) return;
			const control = form.querySelector<HTMLElement>('[aria-invalid="true"]');
			if (!control) return;
			const block = control.closest<HTMLElement>('[data-issue-anchor]') ?? control;
			block.scrollIntoView({ block: 'start', behavior: reducedMotion.current ? 'instant' : 'smooth' });
			if (!(control instanceof HTMLInputElement && control.type === 'hidden')) control.focus({ preventScroll: true });
		});
	}

	/**
	 * After the first send attempt the letter checks itself again as you correct it: a field that is right now clears its red
	 * ink and message at once (while typing in it), one you leave wrong shows it again on change. Preflight only, no request.
	 */
	function recheck(event: Event) {
		if (!contact.submitted) return;
		if (event.type === 'input' && (event.target as Element).getAttribute('aria-invalid') !== 'true') return;
		void contact.validate({ preflightOnly: true });
	}

	// A solved challenge clears its message too (its token arrives without an input event)
	$effect(() => {
		if (token && untrack(() => contact.submitted)) void contact.validate({ preflightOnly: true });
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

<div class="contact relative isolate overflow-x-clip" data-sent={sent || undefined}>
	<!-- Night sky over the header, dark theme only -->
	<div class="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-[34rem] mask-b-from-30% dark:block" aria-hidden="true">
		<StarField density={0.5} brightness={0.7} seed={71} />
	</div>

	<!--
		The night owl messenger, perched at the right edge (the branch runs off the viewport). It sits on a rail as tall as the
		page: on wide screens it stays beside the letter while you write (sticky) and comes to rest where the page ends.
	-->
	<div class="rail" aria-hidden="true">
		<OwlMessenger
			class="perch"
			flown={sent}
			watching={hovering || focused}
			sizes="(min-width: 80rem) clamp(24rem, 67vw - 29.5rem, 42rem), (min-width: 48rem) calc(34.7vw - 6rem), 14rem"
		/>
	</div>

	<div class="mx-auto max-w-6xl px-4 pt-10 pb-8 sm:px-6 sm:pt-16 lg:px-8">
		<!-- One headline group: the invitation, or once the owl has the letter, the thanks in its place -->
		{#key sent}
			<header class={['hero relative grid justify-items-start gap-5', sent && 'sent']}>
				<div class="relative isolate w-fit">
					<span
						class="bloom pointer-events-none absolute top-[30%] -left-6 -z-10 block h-[90%] w-[85%] opacity-55 mix-blend-multiply dark:opacity-25 dark:mix-blend-normal"
						style:background-image="url({bloom.img.src})"
						aria-hidden="true"
					></span>
					{#if sent}
						<h1
							id="contact-sent"
							tabindex="-1"
							bind:this={successHeading}
							aria-describedby="contact-sent-body"
							class="giant sent-title font-display leading-[0.8] font-black tracking-wordmark text-balance focus:outline-none"
						>
							{m.contact_success_title()}
						</h1>
					{:else}
						<h1 class="giant font-display leading-[0.8] font-black tracking-wordmark text-balance">{m.contact_title()}</h1>
					{/if}
				</div>
				{#if sent}
					<p id="contact-sent-body" class="max-w-xl text-base text-pretty text-muted-foreground sm:text-lg" role="status">{m.contact_success_body()}</p>
					<button type="button" class="again" onclick={() => (sent = false)}>{m.contact_success_again()}</button>
				{:else}
					<p class="max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">{m.contact_intro()}</p>
				{/if}
			</header>
		{/key}

		{#if !sent}
			<form
				{...enhanced}
				class="letter relative mt-10 grid gap-12 sm:mt-20"
				data-sending={contact.pending > 0 || undefined}
				novalidate
				onsubmit={revealFirstIssue}
				oninput={recheck}
				onchange={recheck}
				onpointerenter={() => (hovering = true)}
				onpointerleave={() => (hovering = false)}
				onfocusin={() => (focused = true)}
				onfocusout={(event) => (focused = event.currentTarget.contains(event.relatedTarget as Node | null))}
			>
				<!-- The topic: four lines of the letter to tick, each with an ink circle that fills with butter -->
				<fieldset class="topics grid min-w-0 gap-3" aria-describedby="contact-topic-error" data-issue-anchor>
					<legend class="caption mb-1">{m.contact_topic_legend()}</legend>
					<div class="choices">
						{#each CONTACT_TOPICS as topic (topic)}
							<label class="choice">
								<input class="sr-only" {...fields.topic.as('radio', topic)} />
								<span class="mark" aria-hidden="true"></span>
								<span>{TOPIC_LABELS[topic]()}</span>
							</label>
						{/each}
					</div>
					{@render fieldError('contact-topic-error', invalid.topic(), m.contact_error_topic())}
				</fieldset>

				<div class="grid gap-10 sm:grid-cols-2 sm:gap-8">
					<div class="field" data-issue-anchor>
						<label class="caption" for="contact-name">{m.contact_name_label()}</label>
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

					<div class="field" data-issue-anchor>
						<label class="caption" for="contact-email">{m.contact_email_label()}</label>
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

				<div class="field" data-issue-anchor>
					<label class="caption" for="contact-message">{m.contact_message_label()}</label>
					<!-- On focus a margin line runs down the left of the pad and the first writing line inks in, where the caret is -->
					<div class="write write-pad">
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
					<div class="grid gap-6" data-issue-anchor>
						<input {...fields.turnstile.as('hidden', token)} />
						<TurnstileWidget bind:this={turnstile} ontoken={(value) => (token = value)} onerror={(value) => (challengeFailed = value)} />
						{@render fieldError('contact-turnstile-error', invalid.turnstile(), m.contact_error_turnstile())}
					</div>

					<div class="flex flex-wrap items-center gap-x-6 gap-y-4">
						<!-- Sealed with butter wax: the seal lifts on hover, is pressed in on click and stays pressed while the owl takes the letter -->
						<button type="submit" class="send" disabled={contact.pending > 0}>
							<span class="seal" aria-hidden="true">
								<enhanced:img class="wax" src={seal} alt="" sizes="4.5rem" loading="lazy" decoding="async" />
								<enhanced:img class="wax pressed" src={sealPressed} alt="" sizes="4.5rem" loading="lazy" decoding="async" />
							</span>
							<span class="send-label">{contact.pending > 0 ? m.contact_sending() : m.contact_submit()}</span>
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

<style>
	.giant {
		/* Phones: one line at any width (the title is ≈ 5.3em wide); from 48rem the owl's clearance below is computed for 14vw */
		font-size: clamp(3rem, 16vw, 10rem);
		/* Ink on paper; moonlit at night (as /blog) */
		background: linear-gradient(180deg, var(--foreground) 55%, color-mix(in oklab, var(--foreground) 70%, var(--color-ochre)));
		background-clip: text;
		color: transparent;
		padding-bottom: 0.16em;
		margin-bottom: -0.16em;
	}

	@media (min-width: 48rem) {
		.giant {
			font-size: clamp(4.5rem, 14vw, 10rem);
		}
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

	/*
	 * The owl is one illustration with the title: a square canvas (`--owl`) flush with the right viewport edge, sized so its
	 * head (26–53 % of the canvas) keeps 2.5rem clear of the title (≈ 75vw up to the 10rem cap, then 50vw + 19rem).
	 * Below 48rem the owl perches above the title instead.
	 *
	 * It rides a rail from the hero to the end of the page. From 64rem the letter column stops short of the twigs (they reach
	 * 8 % into the canvas) and the owl stays pinned beside the letter while you write: head just under the nav, the empty
	 * night under the branch is its backlight. The page is at least as tall as the bird down to its twigs, so the empty
	 * branch of the sent state is never cut off.
	 */
	.contact {
		--owl: calc(34.7vw - 6rem);
		--owl-top: calc(4rem - var(--owl) * 0.12);
		min-height: calc(var(--owl-top) + var(--owl) * 0.86);
	}

	.rail {
		position: absolute;
		top: var(--owl-top);
		right: 0;
		/* The canvas is empty below the twigs (95 %): they may hang into the sky above the footer horizon */
		bottom: calc(var(--owl) * -0.1);
		z-index: -1;
		width: var(--owl);
		pointer-events: none;
	}

	.letter {
		max-width: 48rem;
	}

	@media (min-width: 64rem) {
		.contact :global(.perch) {
			position: sticky;
			/* The head (15 % into the canvas) rests 5.5rem below the top of the viewport */
			top: calc(5.5rem - var(--owl) * 0.15);
		}

		.letter {
			max-width: min(48rem, calc(100vw - var(--owl) * 0.92 - 4rem - max(2rem, (100vw - 72rem) / 2 + 2rem)));
		}
	}

	/* Above the title's 10rem cap the title stops growing (it ends at 50vw + 19rem), so the owl may: its head keeps 2.5rem clear */
	@media (min-width: 80rem) {
		.contact {
			--owl: clamp(24rem, 67vw - 29.5rem, 42rem);
		}
	}

	/* Phones: the owl perches above the title; its twigs fade out (OwlMessenger) a clear 1.5rem above the title's ink */
	@media (max-width: 47.99rem) {
		.contact {
			--owl: min(13.5rem, 56vw);
			--owl-top: calc(0.5rem - var(--owl) * 0.1);
			min-height: 0;
		}

		.hero {
			padding-top: calc(var(--owl) * 0.86 - 2.5rem);
		}
	}

	/*
	 * The letter: no boxes. Every field is a ruled line on the page; focus is drawn in the material (the ink runs in from the
	 * left and glows, the label lights up with a drop of ink, the caret is butter). Colors are the `--ink-*` tokens in layout.css;
	 * the resting rules are strengthened here to ≥ 3:1 against the paper (light 52 %, night 40 % of the ink).
	 */
	.letter {
		--ink-rule: color-mix(in oklab, var(--foreground) 52%, transparent);
		--ink-rule-hover: color-mix(in oklab, var(--foreground) 74%, transparent);
		--pad-rule: color-mix(in oklab, var(--color-ochre) 42%, transparent);
		--pad-rule-lit: color-mix(in oklab, var(--color-ochre) 66%, transparent);
		--mark-ink: color-mix(in oklab, var(--foreground) 68%, transparent);
	}

	:global(.dark) .letter {
		--ink-rule: color-mix(in oklab, var(--foreground) 40%, transparent);
		--ink-rule-hover: color-mix(in oklab, var(--foreground) 60%, transparent);
		--pad-rule: color-mix(in oklab, var(--color-cream) 14%, transparent);
		--pad-rule-lit: color-mix(in oklab, var(--color-butter) 26%, transparent);
		--mark-ink: color-mix(in oklab, var(--foreground) 64%, transparent);
	}

	/* A failed send scrolls the first issue's block here: clear of the sticky nav */
	[data-issue-anchor] {
		scroll-margin-top: 7rem;
	}

	/* Captions in the hand of the page (sentence case, quieter than the writing), close above the line they name */
	.caption {
		position: relative;
		width: fit-content;
		font-size: 0.875rem;
		font-weight: 500;
		line-height: 1.25;
		color: color-mix(in oklab, var(--foreground) 78%, transparent);
		transition: color var(--dur-state) ease;
	}

	/* A drop of ink hangs in front of the label of the field being written */
	.field > .caption::before,
	.topics > .caption::before {
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
		.field > .caption::before,
		.topics > .caption::before {
			left: calc(100% + 0.35rem);
		}
	}

	.field:focus-within > .caption,
	.topics:focus-within > .caption {
		color: var(--ink-lit);
	}

	.field:focus-within > .caption::before,
	.topics:focus-within > .caption::before {
		scale: 1;
	}

	/* The caption ≈ 7px above the written letters, the rule right under them: no empty box between caption and line */
	.field {
		display: grid;
		gap: 0.125rem;
		align-content: start;
	}

	/* An invalid field writes in warm red: line, glow, label drop */
	.field:has([aria-invalid='true']),
	.topics:has([aria-invalid='true']) {
		--ink-lit: var(--ink-error);
		--ink-wet: var(--ink-error);
		--ink-glow: color-mix(in oklab, var(--ink-error) 35%, transparent);
		--mark-ink: var(--ink-error);
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
		padding: 0 0 0.4rem;
		line-height: 1.5;
	}

	/* Lined letter pad: the rules scroll with the text; the last one is the ruled baseline below */
	.write-pad {
		--rule: 2.25rem;
	}

	.pad {
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

	/*
	 * Focus at the caret: a margin line inks down the left edge of the pad from the label's drop of ink (wet at the top,
	 * running dry), and the first writing line inks in from the left a beat later. Together with the baseline they frame the
	 * page you are writing on.
	 */
	.write-pad::before,
	.write-pad::after {
		content: '';
		position: absolute;
		pointer-events: none;
		opacity: 0;
		transition:
			opacity var(--dur-state) ease,
			transform 0s linear var(--dur-state);
	}

	.write-pad::before {
		top: -0.25rem;
		bottom: 0;
		left: calc(-0.7625rem - 1px);
		width: 2px;
		border-radius: 2px;
		background: linear-gradient(180deg, var(--ink-wet), var(--ink-lit) 22%, var(--ink-lit) 62%, color-mix(in oklab, var(--ink-lit) 30%, transparent));
		box-shadow: 0 0 0.6rem var(--ink-glow);
		transform: scaleY(0);
		transform-origin: top;
	}

	.write-pad::after {
		top: calc(0.25rem + var(--rule) - 1.5px);
		left: 0;
		right: 0;
		height: 2px;
		border-radius: 2px;
		background: linear-gradient(90deg, var(--ink-lit), color-mix(in oklab, var(--ink-lit) 55%, transparent) 70%, transparent);
		box-shadow: 0 0.1rem 0.6rem var(--ink-glow);
		transform: scaleX(0);
		transform-origin: left;
	}

	/* Phones: the margin line sits in the 1rem gutter */
	@media (max-width: 39.99rem) {
		.write-pad::before {
			left: calc(-0.5rem - 1px);
		}
	}

	.write-pad:focus-within::before,
	.write-pad:focus-within::after {
		opacity: 1;
		transform: none;
		transition:
			opacity 120ms ease,
			transform 640ms var(--ease-settle);
	}

	.write-pad:focus-within::after {
		transition-delay: 0ms, 140ms;
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
	 * Topics: lines of the letter to tick, no tray. Each choice sits on a ruled line with a hand-drawn ink circle; the chosen one
	 * fills with butter and its line is inked in (dry ink); the focused one lights its line with wet ink, keyboard focus also
	 * rings the circle.
	 * Two columns of lines on paper, one full-width line per choice on phones.
	 */
	.choices {
		display: grid;
		column-gap: 2.5rem;
	}

	@media (min-width: 40rem) {
		.choices {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.choice {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.875rem;
		min-height: 3rem;
		padding-block: 0.375rem;
		color: color-mix(in oklab, var(--foreground) 80%, transparent);
		font-size: 1.0625rem;
		line-height: 1.3;
		cursor: pointer;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		transition: color var(--dur-state) ease;
	}

	/* The ruled line under each choice, and the ink that runs in along it */
	.choice::before,
	.choice::after {
		content: '';
		position: absolute;
		inset: auto 0 0;
		pointer-events: none;
	}

	.choice::before {
		height: 1px;
		background: var(--pad-rule);
	}

	.choice::after {
		height: 2px;
		bottom: -0.5px;
		border-radius: 2px;
		background: linear-gradient(90deg, var(--ink-lit) 0 70%, color-mix(in oklab, var(--ink-lit) 20%, transparent));
		opacity: 0;
		transform: scaleX(0);
		transform-origin: left;
		transition:
			opacity var(--dur-state) ease,
			transform 0s linear var(--dur-state),
			box-shadow var(--dur-state) ease;
	}

	.choice:has(:checked)::after,
	.choice:has(:focus)::after {
		opacity: 0.7;
		transform: none;
		transition:
			opacity 120ms ease,
			transform 520ms var(--ease-settle),
			box-shadow var(--dur-state) ease;
	}

	.choice:has(:focus)::after {
		opacity: 1;
		box-shadow: 0 0.1rem 0.7rem var(--ink-glow);
	}

	.choice:hover {
		color: var(--foreground);
	}

	.choice:has(:checked) {
		color: var(--foreground);
		font-weight: 600;
	}

	/* The ink circle: a hand-drawn ring (its stroke overlaps where the brush lifted), butter fills it when chosen */
	.mark {
		position: relative;
		flex: none;
		width: 1.375rem;
		height: 1.375rem;
		border-radius: 50%;
		transition: scale var(--dur-hover) var(--ease-settle);
	}

	.mark::before,
	.mark::after {
		content: '';
		position: absolute;
	}

	.mark::before {
		inset: 0;
		z-index: 1;
		background: var(--mark-ink);
		mask: var(--ink-ring) center / 100% 100% no-repeat;
		transition: background-color var(--dur-state) ease;
	}

	.mark::after {
		inset: 17%;
		border-radius: 52% 48% 55% 45% / 47% 55% 45% 53%;
		background: radial-gradient(circle at 36% 30%, var(--color-moonlight), var(--color-butter) 52%, color-mix(in oklab, var(--color-butter) 72%, var(--color-ochre)));
		scale: 0;
		transition: scale 260ms cubic-bezier(0.3, 1.4, 0.5, 1);
	}

	.choice:hover .mark::before {
		background: var(--foreground);
	}

	.choice:active .mark {
		scale: 0.9;
	}

	.choice:has(:checked) .mark::before {
		background: var(--ink-lit);
	}

	.choice:has(:checked) .mark::after {
		scale: 1;
	}

	:global(.dark) .choice:has(:checked) .mark::after {
		box-shadow: 0 0 0.75rem 0.1rem color-mix(in oklab, var(--color-butter) 45%, transparent);
	}

	.choice:has(:focus-visible) .mark {
		outline: 2px solid var(--focus-ring);
		outline-offset: 3px;
	}

	.letter {
		--ink-ring: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M13.6 2.9C18.4 3.4 21.4 7.4 21 12.2c-.4 4.7-4.4 8.2-9.3 7.9C7 19.8 3.1 16 3.2 11.6 3.3 6.7 7.4 2.8 12.4 3.1c1.6.1 2.9.6 4 1.3' fill='none' stroke='%23000' stroke-width='2.1' stroke-linecap='round'/%3E%3C/svg%3E");
		/* The same brush ring, finer, drawn around the wax seal on focus */
		--seal-ring: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M13.6 2.9C18.4 3.4 21.4 7.4 21 12.2c-.4 4.7-4.4 8.2-9.3 7.9C7 19.8 3.1 16 3.2 11.6 3.3 6.7 7.4 2.8 12.4 3.1c1.6.1 2.9.6 4 1.3' fill='none' stroke='%23000' stroke-width='0.7' stroke-linecap='round'/%3E%3C/svg%3E");
	}

	/*
	 * Send: the letter's butter wax seal (round-3 art) with the words beside it in ink, no pill. Hover lifts the seal off the
	 * paper (its shadow grows), a press swaps in the pressed wax, and while the owl takes the letter the seal stays pressed and
	 * a line of ink runs under the words. Keyboard focus is drawn in the material: an ink ring around the seal and the swash
	 * under the words (`--focus-ring`, ≥ 3:1). The wax fills ≈ 80 % of its canvas, so the 4.5rem seal shows ≈ 58px of wax.
	 */
	.send {
		--seal: 4.5rem;
		--seal-shadow: rgb(14 15 16 / 0.3);
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		min-height: var(--seal);
		/* the canvas's empty rim: the wax lines up with the letter's left edge */
		margin-left: calc(var(--seal) * -0.1);
		padding-right: 0.25rem;
		color: var(--foreground);
		font-size: 1.0625rem;
		font-weight: 600;
		-webkit-tap-highlight-color: transparent;
	}

	:global(.dark) .send {
		--seal-shadow: rgb(0 0 0 / 0.6);
	}

	/* No box: the ring and the swash below draw the focus */
	.send:focus-visible {
		outline: none;
		box-shadow: none;
	}

	.seal {
		position: relative;
		flex: none;
		width: var(--seal);
		height: var(--seal);
		filter: drop-shadow(0 1px 1px var(--seal-shadow)) drop-shadow(0 2px 3px color-mix(in oklab, var(--seal-shadow) 50%, transparent));
		transition:
			translate var(--dur-hover) var(--ease-settle),
			filter var(--dur-hover) ease;
	}

	.seal :global(img) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.seal :global(.pressed) {
		opacity: 0;
	}

	/* Hand-drawn ink ring around the wax (focus) */
	.seal::after {
		content: '';
		position: absolute;
		inset: -0.5rem;
		background: var(--focus-ring);
		mask: var(--seal-ring) center / 100% 100% no-repeat;
		opacity: 0;
		scale: 0.94;
		transition:
			opacity var(--dur-hover) ease,
			scale var(--dur-state) var(--ease-settle);
	}

	.send-label {
		position: relative;
		padding-block: 0.5rem;
		transition: color var(--dur-state) ease;
	}

	/* The swash under the words: faint on hover, the focus mark on keyboard focus, running ink while sending */
	.send-label::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0.1rem;
		height: 0.4rem;
		background: var(--ink-lit);
		mask: var(--ink-underline) center / 100% 100% no-repeat;
		opacity: 0;
		transition:
			opacity var(--dur-hover) ease,
			translate var(--dur-hover) var(--ease-settle);
	}

	.send:hover:not(:disabled) .seal {
		translate: 0 -3px;
		filter: drop-shadow(0 3px 2px color-mix(in oklab, var(--seal-shadow) 75%, transparent))
			drop-shadow(0 8px 10px color-mix(in oklab, var(--seal-shadow) 45%, transparent));
	}

	.send:hover:not(:disabled) .send-label::after {
		opacity: 0.55;
	}

	.send:focus-visible .seal::after {
		opacity: 1;
		scale: 1;
	}

	.send:focus-visible .send-label::after {
		background: var(--focus-ring);
		opacity: 1;
	}

	/* Pressed into the paper: the pressed wax, flat to the page */
	.send:active:not(:disabled) .seal,
	.send:disabled .seal {
		translate: 0 1px;
		filter: drop-shadow(0 0.5px 0.5px var(--seal-shadow));
		transition-duration: 60ms;
	}

	.send:active:not(:disabled) .seal :global(.pressed),
	.send:disabled .seal :global(.pressed) {
		opacity: 1;
	}

	/* Sending: the seal stays pressed, the words rest in quieter ink and a line of ink runs under them */
	.send:disabled {
		cursor: progress;
	}

	.send:disabled .send-label {
		color: color-mix(in oklab, var(--foreground) 80%, transparent);
	}

	.send:disabled .send-label::after {
		opacity: 0.8;
		clip-path: inset(0 100% 0 0);
		animation: ink-run 1.6s var(--ease-settle) infinite;
	}

	@keyframes ink-run {
		45% {
			clip-path: inset(0);
		}
		100% {
			clip-path: inset(0 0 0 100%);
		}
	}

	.privacy {
		color: var(--foreground);
		text-decoration: underline 1.5px var(--color-ochre);
		text-underline-offset: 4px;
		border-radius: 4px;
		transition: text-decoration-color var(--dur-hover) ease;
	}

	.privacy:hover {
		text-decoration-color: currentColor;
	}

	.privacy:focus-visible {
		outline-offset: 3px;
	}

	/* Sent: the thanks takes the title's place, the heading is underlined by hand in ink (room for it above the line below) */
	.sent {
		row-gap: 2rem;
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
	}

	.sent-title::after {
		content: '';
		position: absolute;
		left: 0.02em;
		right: 0.05em;
		bottom: 0.03em;
		height: 0.1em;
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

	/* Back to a new letter: a written line with its hand-drawn underline, no button chrome */
	.again {
		position: relative;
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		margin-top: 0.5rem;
		border-radius: 4px;
		color: var(--foreground);
		font-size: 1.0625rem;
		font-weight: 600;
		-webkit-tap-highlight-color: transparent;
	}

	.again::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0.3rem;
		height: 0.4rem;
		background: var(--ink-lit);
		mask: var(--ink-underline) center / 100% 100% no-repeat;
		opacity: 0.75;
		transition:
			opacity var(--dur-hover) ease,
			translate var(--dur-hover) var(--ease-settle);
	}

	.again:hover::after {
		opacity: 1;
		translate: 0 2px;
	}

	.again:focus-visible {
		outline-offset: 3px;
	}

	@media (prefers-reduced-motion: reduce) {
		.send:disabled .send-label::after {
			clip-path: none;
			animation: none;
		}

		.sent-title::after {
			clip-path: none;
			animation: none;
		}

		.seal,
		.seal::after,
		.send-label::after,
		.mark,
		.mark::after,
		.choice::after,
		.write-pad::before,
		.write-pad::after,
		.again::after {
			transition: none;
		}
	}
</style>
