<!--
	@component
	Consent step of the YouTube facades (home cinema, blog post video): the first click on the thumbnail shows this panel over
	it; only `onaccept` (the button) loads the youtube-nocookie player. The panel names YouTube/Google and the data transfer and
	links the YouTube section of the privacy policy (`## YouTube` in src/content/legal/datenschutz.md → `#youtube`). Nothing
	is stored: every embed asks again after a reload. Covers its positioned parent (inset 0); sizes itself by container query.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';

	let { onaccept }: { onaccept: () => void } = $props();

	const privacyHref = $derived(`${localizeHref('/datenschutz')}#youtube`);
</script>

<div class="consent" role="region" aria-label={m.site_youtube_consent_label()}>
	<div class="body">
		<p class="text">
			{m.site_youtube_consent_text()}
			<a class="link" href={privacyHref}>{m.site_youtube_consent_privacy_link()}</a>
		</p>
		<button type="button" class="accept" onclick={onaccept} {@attach (element) => element.focus()}>
			<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
			{m.site_youtube_consent_accept()}
		</button>
	</div>
</div>

<style>
	.consent {
		position: absolute;
		inset: 0;
		z-index: 1;
		display: grid;
		place-items: center;
		container-type: size;
		padding: 0.75rem;
		/* the thumbnail stays visible as a dim picture behind the question */
		background: radial-gradient(80% 90% at 50% 50%, rgb(14 15 16 / 0.92), rgb(14 15 16 / 0.78)), rgb(14 15 16 / 0.2);
		color: var(--color-cream);
		pointer-events: auto;
		animation: settle var(--dur-state) var(--ease-settle);
	}

	.body {
		display: grid;
		justify-items: center;
		gap: clamp(0.6rem, 5cqh, 1.25rem);
		max-width: 34rem;
		text-align: center;
	}

	.text {
		margin: 0;
		font-family: var(--font-body);
		font-size: clamp(0.75rem, 2.6cqi, 1rem);
		line-height: 1.45;
		text-wrap: pretty;
	}

	.link {
		color: var(--color-moonlight);
		text-decoration: underline;
		text-underline-offset: 0.2em;
		white-space: nowrap;
	}

	.link:hover {
		color: var(--color-butter);
	}

	.accept {
		display: inline-flex;
		align-items: center;
		gap: 0.5em;
		min-height: 2.75rem;
		padding: 0 1.15em 0 0.95em;
		border: 0;
		border-radius: 999px;
		background: radial-gradient(circle at 38% 32%, var(--color-moonlight), var(--color-butter) 70%);
		color: var(--color-ink);
		font-family: var(--font-body);
		font-size: clamp(0.8125rem, 2.6cqi, 1rem);
		font-weight: 600;
		cursor: pointer;
		box-shadow:
			0 0 0 0.35rem rgb(252 215 114 / 0.18),
			0 0 2rem rgb(252 215 114 / 0.4);
		transition:
			scale var(--dur-state) cubic-bezier(0.3, 1.35, 0.5, 1),
			box-shadow var(--dur-state) ease;
	}

	.accept svg {
		width: 1.1em;
	}

	.accept:hover,
	.accept:focus-visible {
		scale: 1.05;
		box-shadow:
			0 0 0 0.5rem rgb(252 215 114 / 0.26),
			0 0 2.75rem rgb(252 215 114 / 0.55);
	}

	.accept:focus-visible,
	.link:focus-visible {
		outline: 2px solid var(--color-moonlight);
		outline-offset: 3px;
	}

	/* Very short windows (the cinema screen on small phones): tighter type, smaller button */
	@container (max-height: 11rem) {
		.text {
			font-size: 0.6875rem;
			line-height: 1.35;
		}

		.accept {
			min-height: 2.25rem;
			font-size: 0.75rem;
		}
	}

	@keyframes settle {
		from {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.consent {
			animation: none;
		}

		.accept {
			transition: none;
		}
	}
</style>
