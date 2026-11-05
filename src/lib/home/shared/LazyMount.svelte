<!--
	@component
	Mounts a heavy component (dynamic `import()`, own chunk) when its slot comes near the viewport. Renders `fallback`
	until loaded; on failure keeps it (or renders `failed`).

	```svelte
	<LazyMount load={() => import('./MoonScene.svelte')} props={{ phase }} when={!reducedMotion.current} idle class="absolute inset-0">
		{#snippet fallback()}<img src={moon} alt="" />{/snippet}
	</LazyMount>
	```

	- `when`: extra condition (e.g. WebGL available, motion allowed, play clicked).
	- `idle`: also wait for `requestIdleCallback` (hero enhancements after first paint).
	- The wrapper is a `div` (IntersectionObserver needs a box); size it with `class` so nothing shifts on mount.
-->
<script lang="ts" generics="Props extends Record<string, unknown>">
	import type { Component, Snippet } from 'svelte';
	import { inView } from './motion.svelte.ts';

	interface LazyMountProps {
		load: () => Promise<{ default: Component<Props> }>;
		props?: Props;
		/** IntersectionObserver rootMargin. Default `100% 0px` (one viewport ahead). */
		rootMargin?: string;
		when?: boolean;
		idle?: boolean;
		fallback?: Snippet;
		failed?: Snippet<[unknown]>;
		onloaded?: () => void;
		class?: string;
	}

	let { load, props, rootMargin = '100% 0px', when = true, idle = false, fallback, failed, onloaded, class: className = '' }: LazyMountProps = $props();

	let near = $state(false);
	let Loaded = $state<Component<Props> | null>(null);
	let error = $state<unknown>(null);

	$effect(() => {
		if (!near || !when || Loaded || error) return;
		let cancelled = false;
		const start = () => {
			load().then(
				(module) => {
					if (cancelled) return;
					Loaded = module.default;
					onloaded?.();
				},
				(reason: unknown) => {
					if (!cancelled) error = reason ?? new Error('LazyMount: load failed');
				}
			);
		};
		if (idle && 'requestIdleCallback' in window) {
			const handle = requestIdleCallback(start, { timeout: 2500 });
			return () => {
				cancelled = true;
				cancelIdleCallback(handle);
			};
		}
		start();
		return () => {
			cancelled = true;
		};
	});
</script>

<div
	class={className}
	{@attach inView(
		(visible) => {
			if (visible) near = true;
		},
		{ rootMargin, once: true }
	)}
>
	{#if Loaded}
		<Loaded {...props as Props} />
	{:else if error && failed}
		{@render failed(error)}
	{:else}
		{@render fallback?.()}
	{/if}
</div>
