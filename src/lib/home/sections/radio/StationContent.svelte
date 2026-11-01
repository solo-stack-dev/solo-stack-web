<!--
	@component
	Live content of a station on the display strip: YouTube → latest video title, GitHub → latest commit (repo ·
	message). Both are prerendered remote functions; this component only mounts when such a station is tuned, so the
	data loads then (a small prerendered JSON on the client). Wrap it in a `<svelte:boundary>` with a pending snippet.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { YOUTUBE_CHANNEL_URL } from '#lib/home/data/socials.ts';
	import { getRecentCommits } from '#lib/home/data/github.remote.ts';
	import { getLatestVideo } from '#lib/home/data/youtube.remote.ts';

	interface Props {
		kind: 'youtube' | 'github';
	}

	let { kind }: Props = $props();
</script>

{#if kind === 'youtube'}
	{@const video = await getLatestVideo()}
	{#if video}
		<span class="label font-mono">{m.home_radio_latest_video()}</span>
		<a class="line" href={video.url} rel="noopener" target="_blank">{video.title}</a>
	{:else}
		<a class="line" href={YOUTUBE_CHANNEL_URL} rel="noopener" target="_blank">{m.home_radio_latest_video_fallback()}</a>
	{/if}
{:else}
	{@const commit = (await getRecentCommits())[0]}
	{#if commit}
		<span class="label font-mono">{m.home_radio_latest_commit()}</span>
		<a class="line" href={commit.url} rel="noopener" target="_blank"><span class="font-mono">{commit.repo}</span> · {commit.message}</a>
	{:else}
		<span class="line">{m.home_radio_commits_empty()}</span>
	{/if}
{/if}

<style>
	.label {
		flex: none;
		font-size: 0.66rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-butter);
		opacity: 0.8;
	}

	.line {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: inherit;
	}

	a.line:hover {
		color: var(--color-cream);
		text-decoration: underline;
	}
</style>
