<!--
	@component
	The page's only filter: 7, 30 or 90 days, each drawn as a slice of the growth tree's trunk with one, two or three growth rings
	(rings are how a tree keeps time; the moon stays on the homepage). No tray, no pill: three open choices set in the ink; the
	chosen slice glows in butter and its label gets the site's hand-drawn selection stroke. Native radio inputs, so arrow keys
	work; 44 px targets.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { cn } from '#lib/utils.js';
	import { PERIODS, type Period } from './schema.ts';

	let { value = $bindable(), class: className }: { value: Period; class?: string } = $props();

	/** Growth rings per period in a 16×16 box: slightly eccentric, like a real trunk slice (cx, cy, r). */
	const RINGS: [number, number, number][] = [
		[8.35, 8.3, 2.5],
		[8.15, 8.1, 4.5],
		[8, 8, 6.5]
	];
	const COUNT: Record<Period, number> = { 7: 1, 30: 2, 90: 3 };

	const name = $props.id();
</script>

<fieldset class={cn('flex flex-wrap gap-x-5 gap-y-1 sm:gap-x-7', className)}>
	<legend class="sr-only">{m.stats_period_label()}</legend>
	{#each PERIODS as days (days)}
		<label class="choice relative flex min-h-11 cursor-pointer items-center gap-2.5 rounded-sm text-sm font-medium whitespace-nowrap tabular-nums">
			<input type="radio" {name} value={days} bind:group={value} class="sr-only" />
			<span class="slice relative grid size-7 place-items-center rounded-full" aria-hidden="true">
				<svg viewBox="0 0 16 16" class="relative size-5">
					<circle cx="8.45" cy="8.4" r="0.9" fill="currentColor" />
					{#each RINGS.slice(0, COUNT[days]) as [cx, cy, r], ring (ring)}
						<circle
							{cx}
							{cy}
							{r}
							fill="none"
							stroke="currentColor"
							stroke-width={ring === COUNT[days] - 1 ? 1.4 : 1}
							stroke-opacity={ring === COUNT[days] - 1 ? 1 : 0.55}
						/>
					{/each}
				</svg>
			</span>
			<span class="word relative">{m.stats_period_days({ days })}</span>
		</label>
	{/each}
</fieldset>

<style>
	.choice {
		color: var(--muted-foreground);
		transition: color var(--dur-state, 300ms);
	}

	.choice:hover,
	.choice:has(:checked) {
		color: var(--foreground);
	}

	.choice:has(:focus-visible) {
		outline: 2px solid var(--focus-ring);
		outline-offset: 4px;
	}

	/* The chosen trunk slice: a butter disc of light behind the rings */
	.slice::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: var(--color-butter);
		box-shadow: 0 0 18px -2px rgb(252 215 114 / 0.75);
		scale: 0.4;
		opacity: 0;
		transition:
			scale 0.45s cubic-bezier(0.3, 1.35, 0.5, 1),
			opacity 0.3s;
	}

	.choice:has(:checked) .slice {
		color: var(--color-night);
	}

	.choice:has(:checked) .slice::before {
		scale: 1;
		opacity: 1;
	}

	/* The site's one selection mark under the chosen label */
	.word::after {
		content: '';
		position: absolute;
		left: -2px;
		right: -2px;
		bottom: -0.4rem;
		height: 0.4rem;
		background: var(--ink-lit);
		mask: var(--ink-underline) center / 100% 100% no-repeat;
		clip-path: inset(0 100% 0 0);
		transition: clip-path 0.45s var(--ease-settle, ease-out);
	}

	.choice:has(:checked) .word::after {
		clip-path: inset(0 0 0 0);
	}

	@media (prefers-reduced-motion: reduce) {
		.slice::before,
		.word::after {
			transition: none;
		}
	}
</style>
