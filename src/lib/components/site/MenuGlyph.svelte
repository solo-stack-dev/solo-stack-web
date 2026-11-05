<!--
	@component
	The menu icon of the whole site: two drawn strokes, the lower one shorter (same as the homepage menu button), in
	`currentColor`. The close state is the same two strokes crossed.
-->
<script lang="ts">
	let { close = false }: { close?: boolean } = $props();
</script>

<span class={['menu-glyph', close && 'is-close']} aria-hidden="true"></span>

<style>
	.menu-glyph {
		position: relative;
		display: block;
		width: 1.4rem;
		height: 1rem;
	}

	.menu-glyph::before,
	.menu-glyph::after {
		content: '';
		position: absolute;
		right: 0;
		height: 2px;
		border-radius: 2px;
		background: currentColor;
	}

	.menu-glyph::before {
		top: 0.25rem;
		width: 100%;
	}

	.menu-glyph::after {
		top: calc(0.25rem + 8px);
		width: 68%;
	}

	.is-close::before,
	.is-close::after {
		top: calc(50% - 1px);
		width: 100%;
		rotate: 45deg;
	}

	.is-close::after {
		rotate: -45deg;
	}
</style>
