<!--
	@component
	Live terminal: a fixed-size HTML box mapped onto the painted screen quad via matrix3d (perspective). Decorative
	(aria-hidden) mirror of NightShift's accessible commit list.
-->
<script lang="ts">
	import { quadToMatrix3d, scaleQuad } from './homography.ts';
	import type { SceneLayout } from './layout.ts';
	import type { Terminal } from './terminal.svelte.ts';

	interface Props {
		monitor: SceneLayout['monitor'];
		terminal: Terminal;
		/** Stage size in CSS px (0 before measuring). */
		stage: { width: number; height: number };
		blink: boolean;
	}

	let { monitor, terminal, stage, blink }: Props = $props();

	const matrix = $derived(stage.width ? quadToMatrix3d(monitor.box.width, monitor.box.height, scaleQuad(monitor.quad, stage.width, stage.height)) : null);
	const visible = $derived(terminal.visible());
	const cursorLine = $derived(terminal.done ? -1 : visible.findLastIndex((line) => line !== null));
</script>

<div
	class="monitor font-mono"
	class:ready={!!matrix}
	aria-hidden="true"
	style:width="{monitor.box.width}px"
	style:height="{monitor.box.height}px"
	style:padding="{monitor.padding}px"
	style:font-size="{monitor.fontSize}px"
	style:transform={matrix}
>
	{#each terminal.lines as line, index (index)}
		{@const shown = visible[index]}
		{#if shown != null}
			<div class="line">
				{#if line.kind === 'command'}<span class="prompt">$&nbsp;</span>{shown}{:else if line.kind === 'commit'}<span class="hash">{shown.slice(0, 7)}</span>{shown.slice(
						7
					)}{:else}<span class="note">{shown}</span>{/if}{#if index === cursorLine}<span class="cursor"></span>{/if}
			</div>
		{/if}
	{/each}
	{#if terminal.done}
		<div class="line gap"></div>
		<div class="line"><span class="prompt">$&nbsp;</span><span class="cursor" class:blink></span></div>
	{/if}
</div>

<style>
	.monitor {
		position: absolute;
		z-index: 2;
		left: 0;
		top: 0;
		box-sizing: border-box;
		overflow: hidden;
		transform-origin: 0 0;
		color: color-mix(in oklab, var(--color-cream) 92%, transparent);
		line-height: 1.5;
		letter-spacing: 0.01em;
		text-shadow: 0 0 6px color-mix(in oklab, var(--color-butter) 28%, transparent);
		background: radial-gradient(120% 90% at 30% 20%, color-mix(in oklab, var(--color-butter) 6%, transparent), transparent 70%);
		pointer-events: none;
		visibility: hidden;
	}

	.monitor.ready {
		visibility: visible;
	}

	.line {
		min-height: 1.5em;
		white-space: pre;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.gap {
		min-height: 0.6em;
	}

	.prompt {
		color: color-mix(in oklab, var(--color-cream) 60%, transparent);
	}

	.hash {
		color: var(--color-butter);
	}

	.note {
		white-space: normal;
		color: color-mix(in oklab, var(--color-cream) 75%, transparent);
	}

	.cursor {
		display: inline-block;
		width: 0.55em;
		height: 1.05em;
		margin-left: 0.08em;
		vertical-align: -0.15em;
		background: var(--color-cream);
		box-shadow: 0 0 6px color-mix(in oklab, var(--color-butter) 50%, transparent);
	}

	@media (prefers-reduced-motion: no-preference) {
		.cursor.blink {
			animation: blink 1.05s steps(1) infinite;
		}
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}
</style>
