<!--
	@component
	The Threlte moon (lazy chunk, loaded by Hero.svelte only after hydration + idle, with WebGL, motion allowed,
	and not on narrow or low-end devices). Fills its parent, which has exactly the size of the moon circle.
	Rendering is driven by a RafLoop at 30 fps that stops off screen, in hidden tabs, and when unmounted.
-->
<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { NoToneMapping } from 'three';
	import MoonBody from './MoonBody.svelte';

	type Props = {
		/** Phase angle in degrees (see moon.ts). */
		angle: number;
		/** First frame with the texture is on screen. */
		onready?: () => void;
		/** WebGL context lost: the hero falls back to the painted image. */
		onlost?: () => void;
	};

	let { angle, onready, onlost }: Props = $props();
</script>

<div class="moon-scene">
	<Canvas renderMode="on-demand" dpr={[1, 1.5]} toneMapping={NoToneMapping}>
		<MoonBody {angle} {onready} {onlost} />
	</Canvas>
</div>

<style>
	.moon-scene {
		position: absolute;
		inset: 0;
	}
</style>
