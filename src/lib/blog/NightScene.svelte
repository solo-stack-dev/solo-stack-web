<!--
	@component
	Small painted night (sky, stars, moon, mascot): CSS gradients plus one 28 kB cutout, cheap anywhere (video placeholder,
	cards, blog header). Always night, also in light mode (a window into the homepage). `moonrise` is used on post cards so
	they do not repeat the blog header. Decorative; `children` sit above the art.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import PaperGrain from '#lib/home/shared/PaperGrain.svelte';
	import mascotArt from './assets/blog-mascot-sitting.webp?w=363;240;160&enhanced';

	interface Props {
		/** `watch`: the mascot looking up at the moon (default). `moonrise`: big moon over a ridge, no mascot. */
		variant?: 'watch' | 'moonrise';
		/** `sizes` of the mascot image. */
		mascotSizes?: string;
		/** Load the mascot eagerly (above the fold). Default lazy. */
		eager?: boolean;
		class?: string;
		children?: Snippet;
	}

	let { variant = 'watch', mascotSizes = '10rem', eager = false, class: className = '', children }: Props = $props();
</script>

<div class={['night-scene', `is-${variant}`, className]}>
	<div class="sky" aria-hidden="true">
		<span class="moon"></span>
		<span class="horizon"></span>
		{#if variant === 'moonrise'}<span class="ridge"></span>{/if}
	</div>
	{#if variant === 'watch'}
		<enhanced:img class="mascot" src={mascotArt} alt="" sizes={mascotSizes} loading={eager ? 'eager' : 'lazy'} decoding="async" />
	{/if}
	<PaperGrain fixed={false} opacity={0.1} />
	{#if children}
		<div class="content">{@render children()}</div>
	{/if}
</div>

<style>
	.night-scene {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		background: radial-gradient(120% 90% at 78% 18%, #2d2620 0%, #1a1a1b 48%, #111213 100%);
		color: var(--color-cream);
		container-type: inline-size;
	}

	.sky {
		position: absolute;
		inset: 0;
		z-index: -1;
		/* Stars as radial dots, no canvas */
		background-image:
			radial-gradient(1.5px 1.5px at 12% 22%, rgb(251 243 221 / 0.85), transparent), radial-gradient(1px 1px at 28% 12%, rgb(251 243 221 / 0.7), transparent),
			radial-gradient(1.5px 1.5px at 44% 30%, rgb(251 243 221 / 0.6), transparent), radial-gradient(1px 1px at 58% 9%, rgb(251 243 221 / 0.8), transparent),
			radial-gradient(1px 1px at 91% 48%, rgb(251 243 221 / 0.6), transparent), radial-gradient(1.5px 1.5px at 8% 52%, rgb(251 243 221 / 0.5), transparent),
			radial-gradient(1px 1px at 36% 58%, rgb(251 243 221 / 0.45), transparent), radial-gradient(2px 2px at 64% 40%, rgb(252 215 114 / 0.8), transparent);
	}

	.moon {
		position: absolute;
		top: 14%;
		right: 12%;
		width: clamp(2.5rem, 18cqi, 9rem);
		aspect-ratio: 1;
		border-radius: 999px;
		background:
			radial-gradient(circle at 34% 30%, rgb(255 246 214 / 0.9) 0 12%, transparent 46%),
			radial-gradient(circle at 62% 64%, rgb(226 169 59 / 0.45) 0 10%, transparent 26%), radial-gradient(circle at 30% 70%, rgb(226 169 59 / 0.35) 0 7%, transparent 18%),
			var(--color-butter);
		box-shadow:
			0 0 2.5rem rgb(252 215 114 / 0.35),
			0 0 7rem rgb(252 215 114 / 0.18);
	}

	/* Warm bottom glow, like the cliff light */
	.horizon {
		position: absolute;
		inset: auto 0 0;
		height: 45%;
		background: radial-gradient(70% 100% at 50% 100%, rgb(226 169 59 / 0.16), transparent 70%);
	}

	.mascot {
		position: absolute;
		left: 6%;
		bottom: 0;
		width: clamp(4.5rem, 26cqi, 11rem);
		height: auto;
		z-index: 0;
		pointer-events: none;
	}

	.is-moonrise .moon {
		top: auto;
		right: auto;
		left: 50%;
		bottom: 8%;
		width: 42cqi;
		translate: -50% 0;
	}

	/* A dark ink ridge in front of the rising moon */
	.ridge {
		position: absolute;
		inset: auto 0 0;
		height: 30%;
		background: #0e0f10;
		clip-path: polygon(0 55%, 12% 40%, 24% 52%, 38% 30%, 50% 46%, 63% 26%, 76% 44%, 88% 34%, 100% 48%, 100% 100%, 0 100%);
	}

	.content {
		position: relative;
		z-index: 1;
		height: 100%;
	}
</style>
