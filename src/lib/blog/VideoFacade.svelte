<!--
	@component
	YouTube facade: a self-hosted thumbnail (/media/video-thumbnail/…, no request reaches YouTube). The click opens the consent
	panel (#lib/components/site/YouTubeConsent.svelte); its button swaps in a youtube-nocookie iframe with autoplay. `seek()` seeks a running player via the IFrame API postMessage protocol (no API
	script). Without `youtubeId`: the format's silhouette vignette with the "video follows" note on an ink scrim in its sky
	(phones: as a caption below the art). The thumbnail and the vignette sit on a torn paper edge; the running player gets
	clean corners.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import VideoThumbnail from '#lib/home/sections/cinema/VideoThumbnail.svelte';
	import YouTubeConsent from '#lib/components/site/YouTubeConsent.svelte';
	import FormatVignette from './FormatVignette.svelte';
	import { DECKLE_MASK } from './materials.ts';
	import type { PostFormat } from './schema.ts';

	interface Props {
		youtubeId: string | null;
		title: string;
		/** Picks the vignette shown while there is no video. */
		format: PostFormat;
	}

	let { youtubeId, title, format }: Props = $props();

	// Post page: max-w-6xl (72rem) with px-4 (sm: px-6, lg: px-8)
	const SIZES = '(min-width: 64rem) min(calc(100vw - 4rem), 68rem), (min-width: 40rem) calc(100vw - 3rem), calc(100vw - 2rem)';
	const YOUTUBE_ORIGIN = 'https://www.youtube-nocookie.com';

	let root = $state<HTMLElement>();
	let iframe = $state<HTMLIFrameElement>();
	let playing = $state(false);
	let asking = $state(false);
	let startAt = $state(0);

	const embedUrl = $derived.by(() => {
		if (!youtubeId) return '';
		const params = new URLSearchParams({ autoplay: '1', rel: '0', playsinline: '1', enablejsapi: '1', origin: location.origin });
		if (startAt) params.set('start', String(Math.floor(startAt)));
		return `${YOUTUBE_ORIGIN}/embed/${youtubeId}?${params}`;
	});

	function command(func: string, args: unknown[] = []) {
		iframe?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), YOUTUBE_ORIGIN);
	}

	/** Seeks the running player, or asks for consent and starts at `seconds` once given; scrolls it into view. */
	export function seek(seconds: number) {
		if (!youtubeId) return;
		if (playing) {
			command('seekTo', [seconds, true]);
			command('playVideo');
		} else {
			startAt = seconds;
			asking = true;
		}
		const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
		root?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' });
	}
</script>

{#if youtubeId}
	<div bind:this={root} class={['video', playing && 'is-playing']} style:--deckle={DECKLE_MASK}>
		{#if playing}
			<iframe
				bind:this={iframe}
				class="frame"
				src={embedUrl}
				{title}
				allow="autoplay; encrypted-media; fullscreen; picture-in-picture; web-share"
				referrerpolicy="strict-origin-when-cross-origin"
				{@attach (element) => element.focus()}
			></iframe>
		{:else}
			<button type="button" class="facade group" aria-label={m.blog_video_play({ title })} inert={asking} onclick={() => (asking = true)}>
				<VideoThumbnail id={youtubeId} class="frame thumbnail" sizes={SIZES} fetchpriority="high" />
				<span class="play" aria-hidden="true">
					<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
				</span>
			</button>
			{#if asking}
				<YouTubeConsent onaccept={() => (playing = true)} />
			{/if}
		{/if}
	</div>
{:else}
	<!-- No video yet: the note hangs in the night sky on a dark scrim (desktop), or sits under the art as a caption (phones) -->
	<div bind:this={root} class="pending">
		<div class="video is-placeholder" style:--deckle={DECKLE_MASK}>
			<FormatVignette class="frame placeholder-art" {format} sizes={SIZES} deckle={false} eager />
		</div>
		<div class="placeholder">
			<p class="placeholder-title"><span class="spark" aria-hidden="true"></span>{m.blog_video_placeholder_title()}</p>
			<p class="placeholder-body">{m.blog_video_placeholder_body()}</p>
		</div>
	</div>
{/if}

<style>
	.video {
		position: relative;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		background: var(--color-ink);
		/* a torn-out sheet of the night; the running player keeps plain edges */
		mask: var(--deckle) center / 100% 100% no-repeat;
		scroll-margin-top: 5rem;
	}

	.video.is-playing {
		mask: none;
		border-radius: 0.375rem;
	}

	/* No video yet: a calmer wide band instead of an empty 16:9 (phones keep 16:9, the note moves below) */
	.video.is-placeholder {
		aspect-ratio: 16 / 7;
	}

	@media (max-width: 40rem) {
		.video.is-placeholder {
			aspect-ratio: 16 / 9;
		}
	}

	/* Cropped to a band: keep the lit horizon and the landmark */
	.video :global(.placeholder-art img) {
		object-position: 72% 75%;
	}

	.video :global(.frame) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border: 0;
	}

	.facade {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		cursor: pointer;
	}

	.facade :global(.thumbnail) {
		object-fit: cover;
		transition: scale 600ms var(--ease-settle);
	}

	.facade[inert] .play {
		display: none;
	}

	.facade:hover :global(.thumbnail) {
		scale: 1.02;
	}

	/* Play: a lit disc with a halo, like the laptop screen in the night */
	.play {
		position: relative;
		display: grid;
		place-items: center;
		width: 4.75rem;
		height: 4.75rem;
		border-radius: 999px;
		background: radial-gradient(circle at 38% 32%, var(--color-moonlight), var(--color-butter) 62%);
		color: var(--color-ink);
		box-shadow:
			0 0 0 0.55rem rgb(252 215 114 / 0.22),
			0 0 3.5rem rgb(252 215 114 / 0.5);
		transition:
			scale var(--dur-state) cubic-bezier(0.3, 1.35, 0.5, 1),
			box-shadow var(--dur-state) ease;
	}

	.play svg {
		width: 1.9rem;
		translate: 0.12rem 0;
	}

	.facade:hover .play,
	.facade:focus-visible .play {
		scale: 1.08;
		box-shadow:
			0 0 0 0.8rem rgb(252 215 114 / 0.28),
			0 0 4.5rem rgb(252 215 114 / 0.65);
	}

	/* The mask clips outer rings: focus is drawn inside the frame */
	.facade:focus-visible {
		outline: 3px solid var(--color-butter);
		outline-offset: -0.75rem;
		box-shadow: none;
	}

	.pending {
		position: relative;
		container-type: inline-size;
	}

	/*
	 * Desktop: the note hangs in the sky top left. The painted sky turns bright orange toward the horizon, so an ink scrim
	 * spreads from the corner behind the text (inside the torn edge): cream on ≥ 85 % ink, well over 4.5:1.
	 */
	.placeholder {
		position: absolute;
		inset: 0 auto auto 0;
		display: grid;
		gap: 0.6rem;
		max-width: min(30rem, 52cqi);
		padding: clamp(1.5rem, 4.5cqi, 3rem);
		color: var(--color-cream);
	}

	.video.is-placeholder::after {
		content: '';
		position: absolute;
		inset: 0;
		background:
			radial-gradient(70% 95% at 0% 0%, rgb(14 15 16 / 0.9) 0 32%, rgb(14 15 16 / 0.6) 52%, transparent 78%),
			linear-gradient(to bottom, rgb(14 15 16 / 0.35), transparent 45%);
		pointer-events: none;
	}

	.placeholder-title {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 4cqi, 2.75rem);
		font-weight: 900;
		letter-spacing: var(--tracking-wordmark);
		line-height: 1;
		text-wrap: balance;
		text-shadow: 0 0 24px rgb(252 215 114 / 0.25);
	}

	.placeholder-body {
		max-width: 34ch;
		color: var(--color-cream);
		font-size: clamp(0.9375rem, 1.6cqi, 1.0625rem);
		line-height: 1.5;
		text-wrap: pretty;
		text-shadow: 0 1px 2px rgb(14 15 16 / 0.8);
	}

	/* Phones: the art stays a clean 16:9 window, the note becomes its caption in the page's own ink */
	@media (max-width: 40rem) {
		.placeholder {
			position: static;
			max-width: none;
			padding: 1.1rem 0 0;
			color: var(--foreground);
		}

		.video.is-placeholder::after {
			display: none;
		}

		.placeholder-title {
			font-size: 1.5rem;
			text-shadow: none;
		}

		.placeholder-body {
			color: var(--muted-foreground);
			text-shadow: none;
		}
	}

	/* A firefly as the pilot light of the note */
	.spark {
		flex: none;
		width: 0.32em;
		height: 0.32em;
		border-radius: 50%;
		background: var(--color-moonlight);
		box-shadow:
			0 0 3px 1px var(--color-butter),
			0 0 14px 4px rgb(252 215 114 / 0.6);
		translate: 0 -0.12em;
	}

	@media (max-width: 40rem) {
		:global(html:not(.dark)) .spark {
			background: #f1b73e;
			box-shadow:
				0 0 2px 1px rgb(226 169 59 / 0.9),
				0 0 10px 3px rgb(252 215 114 / 0.75);
		}
	}
</style>
