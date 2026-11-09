<!--
	@component
	Threlte moon, a lazy chunk: Hero.svelte loads it after hydration + idle, only with WebGL, motion allowed, and not on narrow or low-end
	devices. Fills its parent (= the moon circle). Rendering: 30 fps RafLoop in MoonBody.svelte.
-->
<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { NoToneMapping } from 'three';
	import MoonBody from './MoonBody.svelte';

	type Props = {
		/** First frame with the texture is on screen. */
		onready?: () => void;
		/** WebGL context lost: the hero falls back to the painted image. */
		onlost?: () => void;
	};

	let { onready, onlost }: Props = $props();
</script>

<div class="moon-scene">
	<Canvas renderMode="on-demand" dpr={[1, 1.5]} toneMapping={NoToneMapping}>
		<MoonBody {onready} {onlost} />
	</Canvas>
</div>

<style>
	.moon-scene {
		position: absolute;
		inset: 0;
	}
</style>
