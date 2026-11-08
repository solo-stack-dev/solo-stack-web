<!--
	@component
	Easter egg triggers (docs/HANDOFF-HOMEPAGE.md §5.8, docs/HOMEPAGE-DEV.md §11). Mounted once inside NightPage.

	The only egg code in the initial bundle. Each egg is a dynamic import loaded on its trigger: a `pointer-events: none`
	overlay that unmounts itself. Escape removes all running eggs.

	| Egg            | Trigger                                                                  |
	| -------------- | ------------------------------------------------------------------------ |
	| crescent slash | `night:moon-phase` with `crescent` (hero), at most once per 10 s          |
	| eclipse moon   | 3rd crescent of a visit, `?eclipse=1` / `?eclipse=0` (site/eclipse-moon.ts) |
	| moon presence  | `night:moon-full-clicks` count 10, 20, 30 …                              |
	| ARISE          | Konami code (not while typing), `arise()` in the console (site/console-egg.ts), `night:egg-arise` |
	| three stars    | 1 in 6 page views after 30–90 s idle in a dark section, `night:egg-three-stars` |
	| shiny mascot   | 1 in 4096 sessions, `?shiny=1` (forces on) / `?shiny=0` (forces off)      |
-->
<script module lang="ts">
	/** The shiny roll of this page load (module scope: survives remounts, gone on reload). */
	let shinyRoll: boolean | undefined;
</script>

<script lang="ts">
	import type { Component } from 'svelte';
	import { on } from 'svelte/events';
	import { reducedMotion } from '#lib/home/shared/motion.svelte.ts';
	import { MOON_FULL_CLICKS_EVENT, MOON_PHASE_EVENT, type MoonFullClicksDetail, type MoonPhaseDetail } from '#lib/home/sections/hero/moon.ts';
	import { ECLIPSE_AFTER_SLASHES, wakeEclipseMoon } from '#lib/components/site/eclipse-moon.ts';
	import { ARISE_EVENT, EGG_MOON_ATTR, SHINY_ATTR, THREE_STARS_EVENT, type EggProps } from './events.ts';

	type EggId = 'slash' | 'presence' | 'arise' | 'stars';
	type EggModule = Promise<{ default: Component<EggProps> }>;

	const loaders: Record<EggId, () => EggModule> = {
		slash: () => import('./crescent-slash/CrescentSlash.svelte'),
		presence: () => import('./moon-presence/MoonPresence.svelte'),
		arise: () => import('./arise/Arise.svelte'),
		stars: () => import('./three-stars/ThreeStars.svelte')
	};

	const SLASH_COOLDOWN = 10_000;
	const PRESENCE_EVERY = 10;
	const STARS_CHANCE = 1 / 6;
	const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];

	interface RunningEgg {
		key: number;
		id: EggId;
		component: Component<EggProps>;
		props: Omit<EggProps, 'ondone'>;
	}

	let anchor: HTMLElement;
	let running = $state.raw<RunningEgg[]>([]);
	let Shiny = $state.raw<Component | null>(null);
	let nextKey = 0;
	const loading = new Set<EggId>();

	async function play(id: EggId, props: Partial<EggProps> = {}) {
		if (loading.has(id) || running.some((egg) => egg.id === id)) return;
		loading.add(id);
		try {
			const { default: component } = await loaders[id]();
			running = [...running, { key: ++nextKey, id, component, props: { reducedMotion: reducedMotion.current, ...props } }];
		} catch {
			// Chunk failed to load (offline, new deploy): no egg, no error.
		} finally {
			loading.delete(id);
		}
	}

	function finish(key: number) {
		running = running.filter((egg) => egg.key !== key);
	}

	/** The section crossing the viewport center. */
	function centerSection() {
		const middle = window.innerHeight / 2;
		for (const section of document.querySelectorAll<HTMLElement>('[data-night-hour]')) {
			const { top, bottom } = section.getBoundingClientRect();
			if (top <= middle && bottom > middle) return section;
		}
		return null;
	}

	function arise() {
		void play('arise');
	}

	function isTyping(target: EventTarget | null) {
		if (!(target instanceof HTMLElement)) return false;
		return target.isContentEditable || target.matches('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
	}

	// Hero moon: crescent slash and presence
	$effect(() => {
		let lastSlash = -Infinity;
		let crescents = 0;
		const offPhase = on(window, MOON_PHASE_EVENT, (event) => {
			if ((event as CustomEvent<MoonPhaseDetail>).detail?.phase !== 'crescent') return;
			// The eclipse moon is static, so it wakes under reduced motion too
			if (++crescents === ECLIPSE_AFTER_SLASHES) wakeEclipseMoon();
			if (reducedMotion.current) return;
			const now = performance.now();
			if (now - lastSlash < SLASH_COOLDOWN) return;
			lastSlash = now;
			void play('slash');
		});
		const offClicks = on(window, MOON_FULL_CLICKS_EVENT, (event) => {
			const count = (event as CustomEvent<MoonFullClicksDetail>).detail?.count ?? 0;
			if (count < PRESENCE_EVERY || count % PRESENCE_EVERY !== 0) return;
			const moon = document.querySelector(`[${EGG_MOON_ATTR}]`);
			if (moon) void play('presence', { target: moon });
		});
		return () => {
			offPhase();
			offClicks();
		};
	});

	// Konami code, ARISE event, Escape
	$effect(() => {
		let progress = 0;
		const offKeys = on(window, 'keydown', (event) => {
			if (event.key === 'Escape') {
				running = [];
				return;
			}
			if (event.ctrlKey || event.metaKey || event.altKey || isTyping(event.target)) return;
			const key = event.key.toLowerCase();
			if (key === KONAMI[progress]) progress += 1;
			// A third ↑ keeps the last two as a valid start
			else if (key === KONAMI[0]) progress = progress === 2 ? 2 : 1;
			else progress = 0;
			if (progress === KONAMI.length) {
				progress = 0;
				arise();
			}
		});
		const offArise = on(window, ARISE_EVENT, arise);
		const offStars = on(window, THREE_STARS_EVENT, () => void play('stars'));
		return () => {
			offKeys();
			offArise();
			offStars();
		};
	});

	// Three stars at random (trigger in the table above).
	$effect(() => {
		if (Math.random() >= STARS_CHANCE) return;
		const idleFor = 30_000 + Math.random() * 60_000;
		let lastActivity = performance.now();
		const touch = () => (lastActivity = performance.now());
		const offs = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'scroll', 'touchstart'].map((type) => on(window, type, touch, { passive: true }));
		const timer = setInterval(() => {
			if (document.visibilityState !== 'visible' || performance.now() - lastActivity < idleFor) return;
			const hour = centerSection()?.dataset.nightHour;
			if (!hour || hour === '20:00' || hour === '06:00') return;
			stop();
			void play('stars');
		}, 2000);
		function stop() {
			clearInterval(timer);
			for (const off of offs) off();
		}
		return stop;
	});

	// Shiny mascot: one 12-bit draw per page load, kept in memory (not in browser storage) so remounts never reroll.
	$effect(() => {
		const forced = new URLSearchParams(location.search).get('shiny');
		let shiny = forced === '1';
		if (forced !== '1' && forced !== '0') {
			shinyRoll ??= (crypto.getRandomValues(new Uint16Array(1))[0] & 0xfff) === 0;
			shiny = shinyRoll;
		}
		if (!shiny) return;
		const page = anchor.closest('[data-night-page]');
		page?.setAttribute(SHINY_ATTR, '');
		import('./shiny/Shiny.svelte').then((module) => (Shiny = module.default)).catch(() => {});
		return () => page?.removeAttribute(SHINY_ATTR);
	});
</script>

<div bind:this={anchor} class="eggs" hidden></div>

{#each running as egg (egg.key)}
	<egg.component {...egg.props} ondone={() => finish(egg.key)} />
{/each}

{#if Shiny}
	<Shiny />
{/if}
