<!--
	@component
	Hour label of a section (`20:00`). Same position in every section: top left of the section's content area.
	The section root must be `position: relative`.

	```svelte
	<NightClock time="22:00" />
	<NightClock time="22:00" placement="inline" />
	```
-->
<script lang="ts">
	interface Props {
		/** Clock label, `HH:MM`. */
		time: string;
		/** `section` (default): absolutely positioned top left of the section. `inline`: in the flow. */
		placement?: 'section' | 'inline';
		class?: string;
	}

	let { time, placement = 'section', class: className = '' }: Props = $props();
</script>

<time datetime={time} class={['night-clock font-mono text-xs tracking-clock tabular-nums', placement === 'section' && 'is-section', className]}>
	{time}
</time>

<style>
	.night-clock {
		display: inline-block;
		line-height: 1;
		/* Override per section on light backgrounds (sunrise): style="--night-clock-color: var(--color-night)" */
		color: var(--night-clock-color, color-mix(in oklab, var(--color-cream) 80%, transparent));
	}

	.is-section {
		position: absolute;
		z-index: 2;
		top: var(--night-clock-top, clamp(5rem, 9vh, 7rem));
		left: var(--night-clock-left, clamp(1.25rem, 4vw, 3.5rem));
	}
</style>
