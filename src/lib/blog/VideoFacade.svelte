<!--
	@component
	YouTube facade for a blog post. Before the click only the self-hosted thumbnail is shown (prerendered by
	/media/video-thumbnail/[id].jpg, so no request reaches YouTube); the click swaps in a youtube-nocookie iframe with
	autoplay. `seek(seconds)` (chapter links) starts the player at that time, or seeks the running player through the
	IFrame API postMessage protocol (no API script needed). Without a `youtubeId` it shows the painted night with a
	"video follows" note instead.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { thumbnailPath } from '#lib/home/sections/cinema/thumbnail.ts';
	import NightScene from './NightScene.svelte';

	interface Props {
		youtubeId: string | null;
		title: string;
	}

	let { youtubeId, title }: Props = $props();

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

	/** Jump to `seconds`: starts the player there, or seeks the running one. Brings the player into view. */
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

<div bind:this={root} class={['video', !youtubeId && 'is-placeholder']}>
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
			<img class="frame thumbnail" src={thumbnailPath(youtubeId)} alt="" width="1280" height="720" decoding="async" fetchpriority="high" />
			<span class="play" aria-hidden="true">
				<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
			</span>
		</button>
	{:else}
		<NightScene class="frame" mascotSizes="(min-width: 48rem) 11rem, 26vw" eager>
			<div class="placeholder">
				<p class="placeholder-title">{m.blog_video_placeholder_title()}</p>
				<p class="placeholder-body">{m.blog_video_placeholder_body()}</p>
			</div>
		</NightScene>
	{/if}
</div>

<style>
	.video {
		position: relative;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		border-radius: calc(var(--radius) + 0.25rem);
		background: var(--color-night);
		box-shadow:
			0 1px 0 rgb(255 255 255 / 0.04) inset,
			0 1.5rem 3rem -1.5rem rgb(24 25 27 / 0.45);
		scroll-margin-top: 5rem;
	}

	/* No video yet: a wide, calmer band instead of a big empty 16:9 screen */
	.video.is-placeholder {
		aspect-ratio: 16 / 7;
	}

	@media (max-width: 40rem) {
		.video.is-placeholder {
			aspect-ratio: 4 / 3;
		}
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

	.thumbnail {
		object-fit: cover;
		transition: scale 400ms ease;
	}

	.facade:hover .thumbnail {
		scale: 1.02;
	}

	.play {
		position: relative;
		display: grid;
		place-items: center;
		width: 4.5rem;
		height: 4.5rem;
		border-radius: 999px;
		background: var(--color-butter);
		color: var(--color-night);
		box-shadow:
			0 0 0 0.5rem rgb(252 215 114 / 0.25),
			0 0 3rem rgb(252 215 114 / 0.45);
		transition: scale 200ms ease;
	}

	.play svg {
		width: 1.9rem;
		translate: 0.12rem 0;
	}

	.facade:hover .play,
	.facade:focus-visible .play {
		scale: 1.08;
	}

	.facade:focus-visible {
		outline: 3px solid var(--color-butter);
		outline-offset: -3px;
	}

	.placeholder {
		display: grid;
		align-content: end;
		justify-items: end;
		gap: 0.35rem;
		height: 100%;
		/* keep clear of the mascot in the lower left */
		padding: 1.25rem clamp(1.25rem, 6cqi, 3rem) 1.25rem 36cqi;
		text-align: right;
	}

	.placeholder-title {
		max-width: 22ch;
		font-size: clamp(1.15rem, 4.2cqi, 2rem);
		font-weight: 800;
		letter-spacing: -0.02em;
		line-height: 1.1;
		text-wrap: balance;
	}

	.placeholder-body {
		max-width: 34ch;
		color: rgb(251 243 221 / 0.72);
		font-size: clamp(0.8rem, 2.4cqi, 1rem);
		line-height: 1.5;
		text-wrap: pretty;
	}
</style>
