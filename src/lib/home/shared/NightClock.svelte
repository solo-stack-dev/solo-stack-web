<!--
	@component
	Hour label of a section (`20:00`). Same position in every section: `--clock-top` / `--page-gutter` (layout.css),
	a section heading sits under it at `--heading-top`. The section root must be `position: relative`.

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

<time datetime={time} class={['night-clock label-sm', placement === 'section' && 'is-section', className]}>
	{time}
</time>

<style>
	.night-clock {
		display: inline-block;
		/* Override per section on light backgrounds (sunrise): --night-clock-color and --night-clock-halo */
		color: var(--night-clock-color, var(--color-cream));
		font-weight: 500;
		/* the clock crosses butter pigment in several plates (making clouds, hero clouds) */
		text-shadow: var(--night-clock-halo, var(--halo-ink));
	}

	.is-section {
		position: absolute;
		z-index: 2;
		top: var(--night-clock-top, var(--clock-top, clamp(5rem, 9vh, 7rem)));
		left: var(--night-clock-left, var(--page-gutter, clamp(1.25rem, 4vw, 3.5rem)));
	}
</style>
