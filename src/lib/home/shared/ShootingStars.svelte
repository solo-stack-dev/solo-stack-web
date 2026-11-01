<!--
	@component
	Occasional shooting stars: one CSS-animated SVG streak every `minDelay`…`maxDelay` ms (default 8–20 s).
	Fills its positioned parent. Off under reduced motion; no new streaks while the tab is hidden.

	Every streak dispatches `window` event `night:shooting-star` (detail: `ShootingStarDetail`), so other parts of
	the page can react (e.g. the hero mascot turns its head):

	```ts
	import { SHOOTING_STAR_EVENT } from '#lib/home/shared/ShootingStars.svelte';
	$effect(() => on(window, SHOOTING_STAR_EVENT, (event) => look((event as CustomEvent<ShootingStarDetail>).detail)));
	```
-->
<script module lang="ts">
	export const SHOOTING_STAR_EVENT = 'night:shooting-star';

	export interface ShootingStarDetail {
		/** Start position in % of the container. */
		x: number;
		y: number;
		/** Direction in degrees (0 = to the right, positive = downwards). */
		angle: number;
		/** Flight duration in ms. */
		duration: number;
	}
</script>

<script lang="ts">
	import { reducedMotion } from './motion.svelte.ts';

	interface Props {
		/** Minimum pause between streaks in ms. Default 8000. */
		minDelay?: number;
		/** Maximum pause between streaks in ms. Default 20000. */
		maxDelay?: number;
		/** Limit spawn positions to the top part of the container (0…1). Default 0.6. */
		maxY?: number;
		class?: string;
	}

	let { minDelay = 8000, maxDelay = 20000, maxY = 0.6, class: className = '' }: Props = $props();

	interface Streak extends ShootingStarDetail {
		id: number;
		length: number;
	}

	const uid = $props.id();
	let streaks = $state<Streak[]>([]);
	let nextId = 0;

	$effect(() => {
		if (reducedMotion.current) {
			streaks = [];
			return;
		}
		let timer: ReturnType<typeof setTimeout>;
		const schedule = () => {
			timer = setTimeout(spawn, minDelay + Math.random() * Math.max(0, maxDelay - minDelay));
		};
		const spawn = () => {
			if (document.visibilityState === 'visible') {
				const streak: Streak = {
					id: nextId++,
					x: 5 + Math.random() * 80,
					y: Math.random() * maxY * 100,
					angle: 12 + Math.random() * 28,
					duration: 900 + Math.random() * 700,
					length: 120 + Math.random() * 160
				};
				streaks.push(streak);
				const { x, y, angle, duration } = streak;
				window.dispatchEvent(new CustomEvent<ShootingStarDetail>(SHOOTING_STAR_EVENT, { detail: { x, y, angle, duration } }));
			}
			schedule();
		};
		schedule();
		return () => clearTimeout(timer);
	});

	function remove(id: number) {
		streaks = streaks.filter((streak) => streak.id !== id);
	}
</script>

<div aria-hidden="true" class={['shooting-stars', className]}>
	{#each streaks as streak (streak.id)}
		<div
			class="streak"
			style:left="{streak.x}%"
			style:top="{streak.y}%"
			style:--angle="{streak.angle}deg"
			style:--duration="{streak.duration}ms"
			style:--length="{streak.length}px"
			onanimationend={() => remove(streak.id)}
		>
			<svg width={streak.length} height="6" viewBox="0 0 {streak.length} 6">
				<defs>
					<linearGradient id="{uid}-{streak.id}" x1="0" x2="1" y1="0" y2="0">
						<stop offset="0" stop-color="#fbf3dd" stop-opacity="0" />
						<stop offset="0.85" stop-color="#fcd772" stop-opacity="0.7" />
						<stop offset="1" stop-color="#fbf3dd" stop-opacity="1" />
					</linearGradient>
				</defs>
				<path d="M0 3 L{streak.length - 3} 2 Q{streak.length} 3 {streak.length - 3} 4 Z" fill="url(#{uid}-{streak.id})" />
				<circle cx={streak.length - 3} cy="3" r="1.6" fill="#fbf3dd" />
			</svg>
		</div>
	{/each}
</div>

<style>
	.shooting-stars {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
	}

	.streak {
		position: absolute;
		transform-origin: 0 50%;
		opacity: 0;
		animation: shoot var(--duration) cubic-bezier(0.3, 0.1, 0.5, 1) forwards;
		will-change: transform, opacity;
	}

	.streak svg {
		display: block;
	}

	@keyframes shoot {
		0% {
			opacity: 0;
			transform: rotate(var(--angle)) translateX(0) scaleX(0.3);
		}
		15% {
			opacity: 1;
		}
		70% {
			opacity: 0.9;
		}
		100% {
			opacity: 0;
			transform: rotate(var(--angle)) translateX(calc(var(--length) * 2.2)) scaleX(1);
		}
	}
</style>
