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
				<section class="grid justify-items-start gap-5 py-6" aria-labelledby="contact-sent">
					<h2
						id="contact-sent"
						tabindex="-1"
						bind:this={successHeading}
						class="font-display text-5xl leading-none font-black tracking-wordmark focus:outline-none sm:text-6xl"
					>
						{m.contact_success_title()}
					</h2>
					<p class="text-lg text-pretty text-muted-foreground" role="status">{m.contact_success_body()}</p>
					<button type="button" class="again" onclick={() => (sent = false)}>{m.contact_success_again()}</button>
				</section>
			{:else}
				<form {...enhanced} class="relative grid gap-12" novalidate>
					<fieldset class="grid gap-4" aria-describedby="contact-topic-error">
						<legend class="label mb-4">{m.contact_topic_legend()}</legend>
						<div class="-mx-4 [scrollbar-width:none] overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
							<div class="track flex w-max gap-0.5 rounded-full bg-foreground/[0.06] p-1 ring-1 ring-foreground/10 ring-inset">
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
							<input
								id="contact-name"
								class="line"
								autocomplete="name"
								maxlength={CONTACT_LIMITS.name}
								required
								aria-describedby="contact-name-error"
								{...fields.name.as('text')}
							/>
							{@render fieldError('contact-name-error', invalid.name(), m.contact_error_name())}
						</div>

						<div class="field">
							<label class="label" for="contact-email">{m.contact_email_label()}</label>
							<input
								id="contact-email"
								class="line"
								autocomplete="email"
								maxlength={CONTACT_LIMITS.email}
								required
								aria-describedby="contact-email-hint contact-email-error"
								{...fields.email.as('email')}
							/>
							<p id="contact-email-hint" class="hint">{m.contact_email_hint()}</p>
							{@render fieldError('contact-email-error', invalid.email(), m.contact_error_email())}
						</div>
					</div>

					<div class="field">
						<label class="label" for="contact-message">{m.contact_message_label()}</label>
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
							<p class="text-sm text-muted-foreground">
								{m.contact_privacy_note()}
								<!-- TODO(owner): drop rel="external" once /datenschutz exists (keeps the prerender crawler from failing on it) -->
								<a href={localizeHref('/datenschutz')} rel="external" class="underline decoration-ochre underline-offset-4 hover:text-foreground">
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

	.label {
		font-size: 0.9375rem;
		font-weight: 600;
	}

	.field {
		display: grid;
		gap: 0.25rem;
		align-content: start;
	}

	/* Inputs are ruled lines that warm to ochre while you write */
	.line {
		width: 100%;
		min-height: 3rem;
		border: 0;
		border-bottom: 1.5px solid color-mix(in oklab, var(--foreground) 22%, transparent);
		background: transparent;
		font-size: 1.125rem;
		transition: border-color 200ms ease;
	}

	/* Lined letter pad; the lines scroll with the text */
	.pad {
		--rule: 2.25rem;
		width: 100%;
		min-height: calc(var(--rule) * 7 + 0.5rem);
		padding: 0.25rem 0 0;
		border: 0;
		border-bottom: 1.5px solid color-mix(in oklab, var(--foreground) 22%, transparent);
		resize: vertical;
		background: linear-gradient(transparent calc(var(--rule) - 1px), color-mix(in oklab, var(--foreground) 10%, transparent) 0) local;
		background-size: 100% var(--rule);
		background-position: 0 0.25rem;
		font-size: 1.125rem;
		line-height: var(--rule);
		transition: border-color 200ms ease;
	}

	.pad::placeholder {
		color: var(--muted-foreground);
		opacity: 0.7;
	}

	.line:hover,
	.pad:hover {
		border-color: color-mix(in oklab, var(--foreground) 40%, transparent);
	}

	.line:focus,
	.pad:focus {
		border-color: var(--color-ochre);
	}

	.line[aria-invalid='true'],
	.pad[aria-invalid='true'] {
		border-color: var(--destructive);
	}

	.hint {
		font-size: 0.8125rem;
		color: var(--muted-foreground);
	}

	.error {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--destructive);
	}

	.error:empty {
		display: none;
	}

	/* Topic pills: the chosen one is a butter disc (as the blog filter) */
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
		transition:
			color 300ms ease,
			background-color 300ms ease,
			box-shadow 300ms ease;
	}

	.topic:hover {
		color: var(--foreground);
	}

	.topic:has(:checked) {
		background: var(--color-butter);
		box-shadow: 0 2px 16px -2px rgb(252 215 114 / 0.6);
		color: var(--color-night);
	}

	.topic:has(:focus-visible) {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}

	/* Butter pill; its moon rises on hover */
	.send {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		min-height: 3.25rem;
		padding: 0 1.75rem 0 1.25rem;
		border-radius: 999px;
		background: var(--color-butter);
		color: var(--color-night);
		font-weight: 700;
		box-shadow: 0 6px 24px -6px rgb(226 169 59 / 0.7);
		transition:
			translate 200ms ease,
			box-shadow 200ms ease;
	}

	.send:hover:not(:disabled) {
		translate: 0 -2px;
		box-shadow: 0 10px 32px -8px rgb(226 169 59 / 0.8);
	}

	.send:disabled {
		cursor: progress;
		opacity: 0.75;
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

	.again {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		padding: 0 1.25rem;
		border-radius: 999px;
		font-weight: 600;
		box-shadow: inset 0 0 0 1.5px color-mix(in oklab, var(--foreground) 25%, transparent);
		transition: box-shadow 200ms ease;
	}

	.again:hover {
		box-shadow: inset 0 0 0 1.5px var(--color-ochre);
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
