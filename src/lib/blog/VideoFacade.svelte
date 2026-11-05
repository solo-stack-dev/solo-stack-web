<!--
	@component
	YouTube facade: a self-hosted thumbnail (/media/video-thumbnail/…, no request reaches YouTube) until the click swaps in a
	youtube-nocookie iframe with autoplay. `seek()` seeks a running player via the IFrame API postMessage protocol (no API
	script). Without `youtubeId`: the format's silhouette vignette with the "video follows" note set into its night. The
	thumbnail and the vignette sit on a torn paper edge; the running player gets clean corners.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import VideoThumbnail from '#lib/home/sections/cinema/VideoThumbnail.svelte';
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

	let root: HTMLElement;
	let iframe = $state<HTMLIFrameElement>();
	let playing = $state(false);
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

	/** Starts the player at `seconds` or seeks the running one, and scrolls it into view. */
	export function seek(seconds: number) {
		if (!youtubeId) return;
		if (playing) {
			command('seekTo', [seconds, true]);
			command('playVideo');
		} else {
			startAt = seconds;
			playing = true;
		}
		const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
		root.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' });
	}
</script>

<div bind:this={root} class={['video', !youtubeId && 'is-placeholder', playing && 'is-playing']} style:--deckle={DECKLE_MASK}>
	{#if youtubeId && playing}
		<iframe
			bind:this={iframe}
			class="frame"
			src={embedUrl}
			{title}
			allow="autoplay; encrypted-media; fullscreen; picture-in-picture; web-share"
			referrerpolicy="strict-origin-when-cross-origin"
			{@attach (element) => element.focus()}
		></iframe>
	{:else if youtubeId}
		<button type="button" class="facade group" aria-label={m.blog_video_play({ title })} onclick={() => (playing = true)}>
			<VideoThumbnail id={youtubeId} class="frame thumbnail" sizes={SIZES} fetchpriority="high" />
			<span class="play" aria-hidden="true">
				<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
			</span>
		</button>
	{:else}
		<FormatVignette class="frame placeholder-art" {format} sizes={SIZES} deckle={false} eager>
			<div class="placeholder">
				<p class="placeholder-title"><span class="spark" aria-hidden="true"></span>{m.blog_video_placeholder_title()}</p>
				<p class="placeholder-body">{m.blog_video_placeholder_body()}</p>
			</div>
		</FormatVignette>
	{/if}
</div>

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

	/* No video yet: a calmer wide band instead of an empty 16:9 */
	.video.is-placeholder {
		aspect-ratio: 16 / 7;
	}

	@media (max-width: 40rem) {
		.video.is-placeholder {
			aspect-ratio: 5 / 4;
		}
	}

	/* Cropped to a band: keep the lit horizon low so the sky above carries the note */
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

	/* The note hangs in the dark sky top left, above the lit horizon and away from the landmark */
	.placeholder {
		display: grid;
		align-content: start;
		gap: 0.6rem;
		height: 100%;
		padding: clamp(1.25rem, 5cqi, 3rem);
		padding-right: 45cqi;
		background: linear-gradient(to bottom, rgb(14 15 16 / 0.45), transparent 40%);
	}

	.placeholder-title {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 4.6cqi, 2.75rem);
		font-weight: 900;
		letter-spacing: var(--tracking-wordmark);
		line-height: 1;
		text-wrap: balance;
		text-shadow: 0 0 24px rgb(252 215 114 / 0.25);
	}

	.placeholder-body {
		max-width: 36ch;
		color: rgb(251 243 221 / 0.8);
		font-size: clamp(0.875rem, 1.9cqi, 1.0625rem);
		line-height: 1.5;
		text-wrap: pretty;
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
		.placeholder {
			padding-right: clamp(1.25rem, 5cqi, 3rem);
			background: linear-gradient(to bottom, rgb(14 15 16 / 0.7), transparent 55%);
		}
	}
</style>
