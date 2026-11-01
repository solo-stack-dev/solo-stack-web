import { COLORS, dustTile, glowSprite, paintBackdrop, pigmentSprite } from './paint.ts';
import { EXPLORE_WORLD, SIGNS, type SignDef } from './signs.ts';

/**
 * Constellation hunt engine: world state, rules, input, and Canvas 2D rendering. Framework free; the Svelte component
 * owns the DOM (HUD, note card, wheel) and talks to the engine through `EngineHooks`.
 *
 * World units: trace mode uses a fixed view box (160×90 landscape, 100×125 portrait) fitted into the stage; explore mode
 * uses `EXPLORE_WORLD` with a panning camera (110 units across the stage's short side).
 */

export type Mode = 'trace' | 'explore';
type Phase = 'intro' | 'play' | 'card' | 'outro' | 'over' | 'done';

export interface Box {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

export interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
}

export interface EngineHooks {
	score(score: number): void;
	/** Trace: a new round starts. */
	round(sign: SignDef, round: number, hint: number): void;
	/** A sign was completed (card opens). */
	complete(sign: SignDef): void;
	/** The open card closed. */
	cardClosed(): void;
	/** Trace: the timer ran out. */
	over(score: number): void;
	/** Explore: every sign is found. */
	allFound(score: number): void;
	/** The engine started a new game by itself (Space/Enter after the end). */
	restarted?(): void;
	/** A wrong link was made. */
	wrong(): void;
	/** Trace: remaining time 0…1. */
	timer(fraction: number): void;
	/** Position the note card next to a sign's screen box; returns the card's rect (for the threads) or null. */
	placeCard(box: Box): Rect | null;
}

export interface Tuning {
	timer: number;
	decoys: number;
	hint: number;
	snap: number;
	ramp: number;
	penalty: number;
	drift: number;
}

interface Star {
	x: number;
	y: number;
	r: number;
	phase: number;
	speed: number;
	/** Index into `signs`, or -1 for decoys. */
	sign: number;
	appear: number;
	delay: number;
	pop: number;
	lit: number;
}

interface Edge {
	a: number;
	b: number;
	drawn: boolean;
	t: number;
	bend: number;
}

interface Sign {
	def: SignDef;
	stars: number[];
	edges: Edge[];
	done: boolean;
	fill: number;
	bloom: number;
	hover: number;
	x: number;
	y: number;
	size: number;
	rotate: number;
	sprite: number;
}

interface Stray {
	a: number;
	b: number;
	life: number;
}

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
	max: number;
	size: number;
	ring: boolean;
}

interface Pointer {
	x: number;
	y: number;
	inside: boolean;
	touch: boolean;
}

interface Drag {
	id: number;
	x: number;
	y: number;
	/** Chaining from a star (true) or panning / tapping the sky (false). */
	chain: boolean;
	moved: boolean;
	camX: number;
	camY: number;
}

const DUST_TILE = 640;
const CARD_SECONDS = 4.5;
const TAU = Math.PI * 2;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const edgeKey = (a: number, b: number) => (a < b ? `${a}:${b}` : `${b}:${a}`);

function segmentDistance(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
	const dx = bx - ax;
	const dy = by - ay;
	const t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1);
	return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

function shuffle<T>(items: T[]): T[] {
	for (let index = items.length - 1; index > 0; index--) {
		const swap = Math.floor(Math.random() * (index + 1));
		[items[index], items[swap]] = [items[swap]!, items[index]!];
	}
	return items;
}

export class ConstellationEngine {
	mode: Mode = 'trace';
	reducedMotion = false;
	/** Set by the component while the pointer or focus is on the note card (holds the trace auto-advance). */
	cardHold = false;
	score = 0;

	#hooks: EngineHooks;
	#tuning: () => Tuning;
	#context: CanvasRenderingContext2D | null = null;
	#glow: HTMLCanvasElement | null = null;
	#pigments: HTMLCanvasElement[] = [];
	#dust: HTMLCanvasElement | null = null;
	#width = 0;
	#height = 0;
	#ratio = 1;
	#ridge = 0;

	#stars: Star[] = [];
	#signs: Sign[] = [];
	#edges = new Map<string, [number, number]>();
	#tabOrder: number[] = [];
	#strays: Stray[] = [];
	#particles: Particle[] = [];
	#world = { w: 160, h: 90 };
	#cam = { x: 80, y: 45, tx: 80, ty: 45, scale: 1 };
	#time = 0;
	#shake = 0;
	#phase: Phase = 'intro';
	#phaseTime = 0;
	#fade = 0;
	#round = 0;
	#timeLeft = 1;
	#timeMax = 1;
	#hint = 0;
	#bag: number[] = [];
	#anchor = -1;
	#cursor = -1;
	#keyboard = false;
	#hover = -1;
	#pointer: Pointer = { x: 0, y: 0, inside: false, touch: false };
	#drag: Drag | null = null;
	#card = -1;
	#cardTime = 0;

	constructor(hooks: EngineHooks, tuning: () => Tuning) {
		this.#hooks = hooks;
		this.#tuning = tuning;
	}

	// ---------------------------------------------------------------- setup

	/** Bind the canvases (call once on mount). */
	attach(foreground: HTMLCanvasElement): void {
		this.#context = foreground.getContext('2d');
		this.#glow = glowSprite();
		this.#pigments = [pigmentSprite(5), pigmentSprite(17), pigmentSprite(29)];
	}

	/** Stage size in CSS px. Repaints the static backdrop into `background`. */
	resize(width: number, height: number, ratio: number, background: CanvasRenderingContext2D | null): void {
		this.#width = width;
		this.#height = height;
		if (ratio !== this.#ratio || !this.#dust) this.#dust = dustTile(DUST_TILE, ratio);
		this.#ratio = ratio;
		if (background) {
			background.setTransform(ratio, 0, 0, ratio, 0, 0);
			this.#ridge = paintBackdrop(background, width, height);
		}
		this.#fitCamera(true);
	}

	// ---------------------------------------------------------------- flow

	start(mode: Mode): void {
		this.mode = mode;
		this.score = 0;
		this.#round = 0;
		this.#bag = [];
		this.#particles = [];
		this.#closeCard();
		this.#hooks.score(0);
		if (mode === 'trace') this.#buildTrace();
		else this.#buildExplore();
	}

	/** Trace: continue to the next sign after a completion. */
	next(): void {
		if (this.#phase !== 'card') return;
		this.#closeCard();
		this.#phase = 'outro';
		this.#phaseTime = 0;
	}

	/** Close the note card (explore). */
	closeCard(): void {
		if (this.mode === 'trace') this.next();
		else this.#closeCard();
	}

	#closeCard() {
		if (this.#card < 0) return;
		this.#card = -1;
		this.#hooks.cardClosed();
	}

	#resetWorld() {
		this.#stars = [];
		this.#signs = [];
		this.#edges.clear();
		this.#strays = [];
		this.#anchor = -1;
		this.#cursor = -1;
		this.#hover = -1;
		this.#drag = null;
		this.#phase = 'intro';
		this.#phaseTime = 0;
		this.#fade = 0;
	}

	#addSign(def: SignDef, x: number, y: number, size: number, rotate: number, appearDelay: number) {
		const index = this.#signs.length;
		const cos = Math.cos((rotate * Math.PI) / 180);
		const sin = Math.sin((rotate * Math.PI) / 180);
		const stars = def.points.map(([px, py]) => {
			const lx = ((px - 50) * size) / 100;
			const ly = ((py - 50) * size) / 100;
			this.#stars.push(this.#makeStar(x + lx * cos - ly * sin, y + lx * sin + ly * cos, index, appearDelay));
			return this.#stars.length - 1;
		});
		const edges = def.edges.map(([a, b], edgeIndex) => {
			this.#edges.set(edgeKey(stars[a]!, stars[b]!), [index, edgeIndex]);
			return { a: stars[a]!, b: stars[b]!, drawn: false, t: 0, bend: (Math.random() - 0.5) * 0.14 };
		});
		this.#signs.push({ def, stars, edges, done: false, fill: 0, bloom: 0, hover: 0, x, y, size, rotate, sprite: index % 3 });
	}

	#makeStar(x: number, y: number, sign: number, delay: number): Star {
		return {
			x,
			y,
			r: 1.5 + Math.random() * 1.1,
			phase: Math.random() * TAU,
			speed: 0.8 + Math.random() * 1.8,
			sign,
			appear: 0,
			delay: delay + Math.random() * 0.45,
			pop: 0,
			lit: 0
		};
	}

	/** Scatter decoys: away from other stars and from every sign line, `near` of them close to the signs. */
	#addDecoys(count: number, area: Box, near: number, gap: number) {
		const lines = this.#signs.flatMap((sign) => sign.edges);
		let placed = 0;
		for (let attempt = 0; attempt < count * 60 && placed < count; attempt++) {
			let x: number;
			let y: number;
			if (placed < near && this.#signs.length) {
				const sign = this.#signs[placed % this.#signs.length]!;
				x = sign.x + (Math.random() - 0.5) * sign.size * 1.4;
				y = sign.y + (Math.random() - 0.5) * sign.size * 1.4;
				if (x < area.minX || x > area.maxX || y < area.minY || y > area.maxY) continue;
			} else {
				x = area.minX + Math.random() * (area.maxX - area.minX);
				y = area.minY + Math.random() * (area.maxY - area.minY);
			}
			if (this.#stars.some((star) => Math.hypot(star.x - x, star.y - y) < gap)) continue;
			if (lines.some((edge) => segmentDistance(x, y, this.#stars[edge.a]!.x, this.#stars[edge.a]!.y, this.#stars[edge.b]!.x, this.#stars[edge.b]!.y) < gap * 0.55))
				continue;
			this.#stars.push(this.#makeStar(x, y, -1, 0));
			placed++;
		}
	}

	#buildTrace() {
		this.#resetWorld();
		this.#round += 1;
		if (!this.#bag.length) {
			const rest = shuffle(SIGNS.map((_, index) => index).filter((index) => index !== 0));
			this.#bag = this.#round === 1 ? [0, ...rest] : shuffle([0, ...rest]);
		}
		const def = SIGNS[this.#bag.shift()!]!;
		const tuning = this.#tuning();
		const step = this.#round - 1;
		const landscape = this.#width >= this.#height;
		this.#world = landscape ? { w: 160, h: 90 } : { w: 100, h: 125 };
		const { w, h } = this.#world;
		const top = landscape ? 22 : 30;
		const bottom = landscape ? 11 : 16;
		const size = landscape ? 50 : 60;
		const x = size / 2 + 8 + Math.random() * (w - size - 16);
		const y = top + size / 2 + Math.random() * Math.max(0, h - top - bottom - size);
		this.#addSign(def, x, y, size, (Math.random() - 0.5) * 24, 0);
		const decoys = Math.round(tuning.decoys + step * tuning.ramp * 6);
		this.#addDecoys(decoys, { minX: 4, minY: top - 8, maxX: w - 4, maxY: h - bottom + 3 }, Math.ceil(decoys * 0.45), landscape ? 6.5 : 7.5);
		this.#timeMax = Math.max(6, tuning.timer * (1 - 0.15 * tuning.ramp) ** step);
		this.#timeLeft = this.#timeMax;
		this.#hint = tuning.hint * (1 - 0.4 * tuning.ramp) ** step;
		this.#finishBuild();
		this.#hooks.timer(1);
		this.#hooks.round(def, this.#round, this.#hint);
	}

	#buildExplore() {
		this.#resetWorld();
		this.#world = { w: EXPLORE_WORLD.width, h: EXPLORE_WORLD.height };
		for (const def of SIGNS) this.#addSign(def, def.explore.x, def.explore.y, def.explore.size, def.explore.rotate, Math.random() * 0.4);
		const decoys = Math.round(this.#tuning().decoys * 3.5);
		this.#addDecoys(decoys, { minX: 6, minY: 6, maxX: this.#world.w - 6, maxY: this.#world.h - 6 }, Math.ceil(decoys * 0.4), 6.5);
		this.#finishBuild();
		const svelte = this.#signs[0]!;
		this.#cam.x = this.#cam.tx = svelte.x;
		this.#cam.y = this.#cam.ty = svelte.y;
		this.#fitCamera(true);
	}

	#finishBuild() {
		this.#tabOrder = this.#stars.map((_, index) => index).toSorted((a, b) => this.#stars[a]!.x - this.#stars[b]!.x || this.#stars[a]!.y - this.#stars[b]!.y);
		this.#fitCamera(true);
	}

	#fitCamera(snap: boolean) {
		if (!this.#width || !this.#height) return;
		const { w, h } = this.#world;
		if (this.mode === 'trace') {
			this.#cam.scale = Math.min(this.#width / w, this.#height / h);
			this.#cam.x = this.#cam.tx = w / 2;
			this.#cam.y = this.#cam.ty = h / 2;
			return;
		}
		this.#cam.scale = Math.min(this.#width, this.#height) / 110;
		this.#clampCamera();
		if (snap) {
			this.#cam.x = this.#cam.tx;
			this.#cam.y = this.#cam.ty;
		}
	}

	#clampCamera() {
		const viewW = this.#width / this.#cam.scale;
		const viewH = this.#height / this.#cam.scale;
		const pad = 8;
		const bottom = (this.#ridge * 0.8) / this.#cam.scale;
		const range = (target: number, size: number, view: number, after: number) =>
			view >= size + pad * 2 ? size / 2 : clamp(target, view / 2 - pad, size - view / 2 + pad + after);
		this.#cam.tx = range(this.#cam.tx, this.#world.w, viewW, 0);
		this.#cam.ty = range(this.#cam.ty, this.#world.h, viewH, bottom);
	}

	// ---------------------------------------------------------------- coordinates

	#drift(): [number, number] {
		if (this.reducedMotion) return [0, 0];
		const amount = this.#tuning().drift;
		return [Math.sin(this.#time * 0.11) * 1.8 * amount, Math.cos(this.#time * 0.083) * 1.2 * amount];
	}

	#toScreen(x: number, y: number, drift = this.#drift()): [number, number] {
		return [(x - this.#cam.x - drift[0]) * this.#cam.scale + this.#width / 2, (y - this.#cam.y - drift[1]) * this.#cam.scale + this.#height / 2];
	}

	/** Nearest visible star within the snap radius of a screen point, or -1. */
	#starAt(x: number, y: number, touch: boolean, except = -1): number {
		const radius = this.#tuning().snap + (touch ? 10 : 0);
		const drift = this.#drift();
		let best = -1;
		let bestDistance = radius;
		for (const [index, star] of this.#stars.entries()) {
			if (index === except || star.appear < 0.5) continue;
			const [sx, sy] = this.#toScreen(star.x, star.y, drift);
			const distance = Math.hypot(sx - x, sy - y);
			if (distance < bestDistance) {
				best = index;
				bestDistance = distance;
			}
		}
		return best;
	}

	get #interactive(): boolean {
		return this.#phase === 'play' || (this.mode === 'explore' && this.#phase === 'intro');
	}

	// ---------------------------------------------------------------- rules

	#activate(index: number) {
		if (!this.#interactive || index < 0) return;
		const star = this.#stars[index]!;
		if (this.#anchor < 0 || this.#anchor === index) {
			this.#anchor = index;
			star.pop = 1;
			return;
		}
		this.#link(this.#anchor, index);
	}

	#link(a: number, b: number) {
		const hit = this.#edges.get(edgeKey(a, b));
		if (!hit) {
			this.#wrong(a, b);
			return;
		}
		const sign = this.#signs[hit[0]]!;
		const edge = sign.edges[hit[1]]!;
		this.#anchor = b;
		this.#stars[b]!.pop = 1;
		if (edge.drawn) return;
		edge.drawn = true;
		edge.t = this.reducedMotion ? 1 : 0;
		this.#stars[a]!.lit = 1;
		this.#stars[b]!.lit = 1;
		this.#addScore(this.mode === 'trace' ? 10 : 5);
		this.#ring(this.#stars[b]!.x, this.#stars[b]!.y, 0.5);
		if (sign.edges.every((item) => item.drawn)) this.#complete(hit[0]);
	}

	#wrong(a: number, b: number) {
		this.#strays.push({ a, b, life: 1 });
		this.#anchor = -1;
		if (this.#drag) this.#drag.chain = false;
		if (!this.reducedMotion) this.#shake = 1;
		if (this.mode === 'trace') {
			this.#timeLeft = Math.max(0.01, this.#timeLeft - this.#tuning().penalty);
			this.#addScore(-5);
		}
		this.#hooks.wrong();
	}

	#addScore(delta: number) {
		this.score = Math.max(0, this.score + delta);
		this.#hooks.score(this.score);
	}

	#complete(index: number) {
		const sign = this.#signs[index]!;
		sign.done = true;
		sign.fill = this.reducedMotion ? 1 : 0;
		sign.bloom = 1;
		this.#anchor = -1;
		this.#drag = null;
		for (const star of sign.stars) {
			this.#stars[star]!.pop = 1;
			this.#stars[star]!.lit = 1;
		}
		this.#burst(sign);
		this.#addScore(100 + (this.mode === 'trace' ? Math.ceil(this.#timeLeft) * 10 : 0));
		this.#card = index;
		this.#cardTime = 0;
		this.#hooks.complete(sign.def);
		if (this.mode === 'trace') {
			this.#phase = 'card';
		} else if (this.#signs.every((item) => item.done)) {
			this.#phase = 'done';
			this.#addScore(500);
			for (const other of this.#signs) {
				other.bloom = 1;
				if (other !== sign) this.#burst(other, 10);
			}
			this.#hooks.allFound(this.score);
		}
	}

	#burst(sign: Sign, count = 26) {
		if (this.reducedMotion) return;
		for (let index = 0; index < count; index++) {
			const angle = Math.random() * TAU;
			const speed = 6 + Math.random() * 26;
			const life = 0.7 + Math.random() * 0.9;
			this.#particles.push({ x: sign.x, y: sign.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life, max: life, size: 2 + Math.random() * 4, ring: false });
		}
		for (const star of sign.stars) {
			const item = this.#stars[star]!;
			const angle = Math.random() * TAU;
			this.#particles.push({ x: item.x, y: item.y, vx: Math.cos(angle) * 4, vy: Math.sin(angle) * 4 - 3, life: 1, max: 1, size: 3 + Math.random() * 2, ring: false });
		}
		this.#ring(sign.x, sign.y, 1.6);
		if (this.#particles.length > 320) this.#particles.splice(0, this.#particles.length - 320);
	}

	#ring(x: number, y: number, size: number) {
		if (this.reducedMotion) return;
		this.#particles.push({ x, y, vx: 0, vy: 0, life: 0.6, max: 0.6, size, ring: true });
	}

	// ---------------------------------------------------------------- input

	pointerDown(x: number, y: number, id: number, touch: boolean): void {
		this.#keyboard = false;
		this.#pointer = { x, y, inside: true, touch };
		const star = this.#interactive ? this.#starAt(x, y, touch) : -1;
		this.#drag = { id, x, y, chain: star >= 0, moved: false, camX: this.#cam.x, camY: this.#cam.y };
		if (star >= 0) this.#activate(star);
	}

	pointerMove(x: number, y: number, id: number, touch: boolean): void {
		this.#pointer = { x, y, inside: true, touch };
		const drag = this.#drag;
		if (!drag || drag.id !== id) return;
		if (Math.hypot(x - drag.x, y - drag.y) > 6) drag.moved = true;
		if (drag.chain) {
			if (this.#anchor < 0) return;
			const star = this.#starAt(x, y, touch, this.#anchor);
			if (star >= 0) this.#activate(star);
		} else if (drag.moved && this.mode === 'explore') {
			this.#cam.tx = drag.camX - (x - drag.x) / this.#cam.scale;
			this.#cam.ty = drag.camY - (y - drag.y) / this.#cam.scale;
			this.#clampCamera();
			this.#cam.x = this.#cam.tx;
			this.#cam.y = this.#cam.ty;
		}
	}

	pointerUp(id: number): void {
		const drag = this.#drag;
		if (!drag || drag.id !== id) return;
		if (!drag.chain && !drag.moved) this.#anchor = -1;
		this.#drag = null;
		if (this.#pointer.touch) this.#pointer.inside = false;
	}

	pointerLeave(): void {
		if (!this.#drag) this.#pointer.inside = false;
	}

	/** Move the keyboard star cursor in a direction (arrow keys). */
	moveCursor(dx: number, dy: number): void {
		this.#keyboard = true;
		const from = this.#cursor >= 0 ? this.#stars[this.#cursor]! : null;
		if (!from) {
			this.#cursor = this.#nearestToView();
			this.#follow();
			return;
		}
		let best = -1;
		let bestScore = Infinity;
		for (const [index, star] of this.#stars.entries()) {
			if (index === this.#cursor || star.appear < 0.5) continue;
			const vx = star.x - from.x;
			const vy = star.y - from.y;
			const distance = Math.hypot(vx, vy);
			const cos = (vx * dx + vy * dy) / (distance || 1);
			if (cos < 0.4) continue;
			const score = distance * (1 + 1.8 * (1 - cos));
			if (score < bestScore) {
				best = index;
				bestScore = score;
			}
		}
		if (best >= 0) this.#cursor = best;
		this.#follow();
	}

	/** Tab through stars left to right. Returns false at the end of the list so focus can leave the game. */
	tabCursor(backwards: boolean): boolean {
		if (!this.#tabOrder.length) return false;
		const position = this.#cursor >= 0 ? this.#tabOrder.indexOf(this.#cursor) : -1;
		const next = position < 0 ? (backwards ? this.#tabOrder.length - 1 : 0) : position + (backwards ? -1 : 1);
		if (next < 0 || next >= this.#tabOrder.length) return false;
		this.#keyboard = true;
		this.#cursor = this.#tabOrder[next]!;
		this.#follow();
		return true;
	}

	/** Space / Enter: connect at the cursor, continue after a card, or restart after the end. */
	action(): void {
		if (this.#phase === 'card') return this.next();
		if (this.#phase === 'over' || this.#phase === 'done') {
			this.start(this.mode);
			this.#hooks.restarted?.();
			return;
		}
		this.#keyboard = true;
		if (this.#cursor < 0) {
			this.#cursor = this.#nearestToView();
			this.#follow();
			return;
		}
		if (this.#anchor === this.#cursor) this.#anchor = -1;
		else this.#activate(this.#cursor);
	}

	#nearestToView(): number {
		const anchor = this.#anchor >= 0 ? this.#stars[this.#anchor]! : null;
		const x = anchor?.x ?? this.#cam.x;
		const y = anchor?.y ?? this.#cam.y;
		let best = -1;
		let bestDistance = Infinity;
		for (const [index, star] of this.#stars.entries()) {
			const distance = Math.hypot(star.x - x, star.y - y);
			if (index !== this.#anchor && distance < bestDistance) {
				best = index;
				bestDistance = distance;
			}
		}
		return best;
	}

	/** Explore: keep the keyboard cursor inside the view. */
	#follow() {
		if (this.mode !== 'explore' || this.#cursor < 0) return;
		const star = this.#stars[this.#cursor]!;
		const [sx, sy] = this.#toScreen(star.x, star.y);
		const insetX = this.#width * 0.2;
		const insetY = this.#height * 0.2;
		if (sx < insetX || sx > this.#width - insetX || sy < insetY || sy > this.#height - insetY) {
			this.#cam.tx = star.x;
			this.#cam.ty = star.y;
			this.#clampCamera();
		}
	}

	/** Dev/test helper: screen segments of the undrawn edges of the first unfinished sign (headless playtests). */
	debugEdges(): [number, number, number, number][] {
		const sign = this.#signs.find((item) => !item.done);
		if (!sign) return [];
		const drift = this.#drift();
		return sign.edges
			.filter((edge) => !edge.drawn)
			.map((edge) => [
				...this.#toScreen(this.#stars[edge.a]!.x, this.#stars[edge.a]!.y, drift),
				...this.#toScreen(this.#stars[edge.b]!.x, this.#stars[edge.b]!.y, drift)
			]);
	}

	/** Dev/test helper: drop the current link anchor. */
	debugClear(): void {
		this.#anchor = -1;
	}

	/** Dev/test helper: center the explore camera on a sign. */
	debugFocus(index: number): void {
		const sign = this.#signs[index];
		if (!sign) return;
		this.#cam.tx = sign.x;
		this.#cam.ty = sign.y;
		this.#clampCamera();
		this.#cam.x = this.#cam.tx;
		this.#cam.y = this.#cam.ty;
	}

	// ---------------------------------------------------------------- loop

	tick(dt: number): void {
		this.#update(dt);
		this.render();
	}

	#update(dt: number) {
		this.#time += dt;
		this.#phaseTime += dt;
		const motion = this.reducedMotion ? 0 : 1;

		if (this.#phase === 'intro') {
			this.#fade = Math.min(1, this.#fade + dt / 0.4);
			if (this.#phaseTime > 0.7) this.#phase = 'play';
		} else if (this.#phase === 'outro') {
			this.#fade = Math.max(0, 1 - this.#phaseTime / 0.35);
			if (this.#phaseTime >= 0.35) this.#buildTrace();
		} else {
			this.#fade = Math.min(1, this.#fade + dt / 0.4);
		}

		if (this.mode === 'trace' && this.#phase === 'play') {
			this.#timeLeft -= dt;
			if (this.#timeLeft <= 0) {
				this.#timeLeft = 0;
				this.#phase = 'over';
				this.#anchor = -1;
				this.#drag = null;
				this.#hooks.over(this.score);
			}
			this.#hooks.timer(this.#timeLeft / this.#timeMax);
		}

		if (this.#phase === 'card' && !this.cardHold) {
			this.#cardTime += dt;
			if (this.#cardTime > CARD_SECONDS) this.next();
		}

		const ease = 1 - Math.exp(-dt * 7);
		if (this.mode === 'explore') {
			this.#cam.x += (this.#cam.tx - this.#cam.x) * ease;
			this.#cam.y += (this.#cam.ty - this.#cam.y) * ease;
		}
		this.#shake = Math.max(0, this.#shake - dt * 4);

		for (const star of this.#stars) {
			if (star.appear < 1) star.appear = this.#phaseTime > star.delay || this.reducedMotion ? Math.min(1, star.appear + dt / 0.35) : 0;
			star.pop = Math.max(0, star.pop - dt * 2.8);
		}
		for (const sign of this.#signs) {
			for (const edge of sign.edges) if (edge.drawn && edge.t < 1) edge.t = Math.min(1, edge.t + dt / 0.28);
			if (sign.done && sign.fill < 1) sign.fill = Math.min(1, sign.fill + dt / 1.3);
			sign.bloom = Math.max(0, sign.bloom - dt * (motion ? 0.9 : 3));
		}

		// Hover: nearest star under the pointer, and which sign is "felt" nearby (explore hint).
		const touchDrag = this.#pointer.touch && !this.#drag;
		this.#hover = this.#pointer.inside && !touchDrag && this.#interactive ? this.#starAt(this.#pointer.x, this.#pointer.y, this.#pointer.touch) : -1;
		const near = this.#nearSign();
		for (const [index, sign] of this.#signs.entries()) sign.hover += ((index === near ? 1 : 0) - sign.hover) * (1 - Math.exp(-dt * 5));

		for (const stray of this.#strays) stray.life -= dt / 0.7;
		this.#strays = this.#strays.filter((stray) => stray.life > 0);
		for (const particle of this.#particles) {
			particle.life -= dt;
			particle.x += particle.vx * dt;
			particle.y += particle.vy * dt;
			particle.vx *= 1 - dt * 2.2;
			particle.vy *= 1 - dt * 2.2;
		}
		this.#particles = this.#particles.filter((particle) => particle.life > 0);
	}

	/** Explore: the sign whose stars are near the pointer or the keyboard cursor. */
	#nearSign(): number {
		if (this.mode !== 'explore') return -1;
		if (this.#keyboard && this.#cursor >= 0) return this.#stars[this.#cursor]!.sign;
		if (!this.#pointer.inside) return -1;
		const radius = (this.#tuning().snap + 10) * 2.4;
		const drift = this.#drift();
		let best = -1;
		let bestDistance = radius;
		for (const star of this.#stars) {
			if (star.sign < 0) continue;
			const [sx, sy] = this.#toScreen(star.x, star.y, drift);
			const distance = Math.hypot(sx - this.#pointer.x, sy - this.#pointer.y);
			if (distance < bestDistance) {
				best = star.sign;
				bestDistance = distance;
			}
		}
		return best;
	}

	// ---------------------------------------------------------------- render

	render(): void {
		const context = this.#context;
		const glow = this.#glow;
		if (!context || !glow || !this.#width) return;
		const ratio = this.#ratio;
		const canvas = context.canvas;
		if (canvas.width !== Math.round(this.#width * ratio) || canvas.height !== Math.round(this.#height * ratio)) return;
		context.setTransform(ratio, 0, 0, ratio, 0, 0);
		context.clearRect(0, 0, this.#width, this.#height);

		const drift = this.#drift();
		const shakeX = this.#shake ? (Math.random() - 0.5) * 7 * this.#shake : 0;
		const shakeY = this.#shake ? (Math.random() - 0.5) * 7 * this.#shake : 0;
		const scale = this.#cam.scale;
		const at = (x: number, y: number): [number, number] => {
			const [sx, sy] = this.#toScreen(x, y, drift);
			return [sx + shakeX, sy + shakeY];
		};
		const unit = clamp(scale / 7, 0.65, 1.4);

		this.#drawDust(context, drift);

		context.globalAlpha = this.#fade;
		context.lineCap = 'round';
		context.lineJoin = 'round';

		// Watercolor fills and blooms of completed signs.
		for (const sign of this.#signs) {
			if (!sign.done && !sign.bloom) continue;
			const [cx, cy] = at(sign.x, sign.y);
			const radius = sign.size * scale * 0.62;
			if (sign.fill > 0) {
				const grow = this.reducedMotion ? 1 : 0.35 + 0.65 * easeOut(sign.fill);
				const sprite = this.#pigments[sign.sprite]!;
				context.save();
				context.globalCompositeOperation = 'screen';
				context.globalAlpha = this.#fade * easeOut(sign.fill) * 0.22;
				context.drawImage(sprite, cx - radius * 1.5 * grow, cy - radius * 1.5 * grow, radius * 3 * grow, radius * 3 * grow);
				const outline = sign.def.fill;
				if (outline) {
					context.beginPath();
					for (const [step, local] of outline.entries()) {
						const [x, y] = at(this.#stars[sign.stars[local]!]!.x, this.#stars[sign.stars[local]!]!.y);
						if (step === 0) context.moveTo(x, y);
						else context.lineTo(x, y);
					}
					context.closePath();
					context.clip();
				}
				context.globalAlpha = this.#fade * easeOut(sign.fill) * (outline ? 0.6 : 0.4);
				context.translate(cx, cy);
				context.rotate((sign.rotate * Math.PI) / 180);
				context.drawImage(sprite, -radius * grow, -radius * grow, radius * 2 * grow, radius * 2 * grow);
				context.restore();
			}
			if (sign.bloom > 0) {
				context.save();
				context.globalCompositeOperation = 'lighter';
				context.globalAlpha = this.#fade * sign.bloom * 0.45;
				const size = radius * (3 + (1 - sign.bloom) * 1.5);
				context.drawImage(glow, cx - size / 2, cy - size / 2, size, size);
				context.restore();
			}
		}

		// Silhouette hints (trace: the round's hint level; explore: stronger near the pointer).
		for (const sign of this.#signs) {
			if (sign.done) continue;
			const level = this.mode === 'trace' ? this.#hint * (this.#phase === 'over' ? 0 : 1) : this.#tuning().hint * (0.1 + 0.75 * sign.hover);
			if (level <= 0.01) continue;
			context.strokeStyle = `rgba(252, 215, 114, ${0.13 * level})`;
			context.lineWidth = 14 * unit;
			this.#strokeEdges(context, sign.edges, at, false);
			if (level > 0.55) {
				context.setLineDash([2 * unit, 6 * unit]);
				context.strokeStyle = `rgba(251, 243, 221, ${0.5 * (level - 0.55)})`;
				context.lineWidth = 1;
				this.#strokeEdges(context, sign.edges, at, false);
				context.setLineDash([]);
			}
		}

		// Trace time-up: reveal what was missing.
		if (this.#phase === 'over') {
			context.setLineDash([4 * unit, 5 * unit]);
			context.strokeStyle = 'rgba(226, 169, 59, 0.75)';
			context.lineWidth = 1.4;
			for (const sign of this.#signs)
				this.#strokeEdges(
					context,
					sign.edges.filter((edge) => !edge.drawn),
					at,
					true
				);
			context.setLineDash([]);
		}

		// Wrong links: a broken ochre scratch that fades.
		for (const stray of this.#strays) {
			const [ax, ay] = at(this.#stars[stray.a]!.x, this.#stars[stray.a]!.y);
			const [bx, by] = at(this.#stars[stray.b]!.x, this.#stars[stray.b]!.y);
			context.setLineDash([5, 4]);
			context.strokeStyle = `rgba(226, 169, 59, ${0.8 * stray.life})`;
			context.lineWidth = 1.6;
			context.beginPath();
			context.moveTo(ax, ay);
			context.lineTo(bx + (ax - bx) * (1 - stray.life) * 0.5, by + (ay - by) * (1 - stray.life) * 0.5);
			context.stroke();
			context.setLineDash([]);
		}

		// Ink lines.
		for (const sign of this.#signs) {
			const drawn = sign.edges.filter((edge) => edge.drawn);
			if (!drawn.length) continue;
			context.strokeStyle = sign.done ? 'rgba(252, 215, 114, 0.35)' : 'rgba(252, 215, 114, 0.2)';
			context.lineWidth = (sign.done ? 7 : 5) * unit;
			this.#strokeEdges(context, drawn, at, true);
			context.strokeStyle = sign.done ? COLORS.butter : 'rgba(251, 243, 221, 0.92)';
			context.lineWidth = 1.6 * unit;
			this.#strokeEdges(context, drawn, at, true);
			context.strokeStyle = 'rgba(251, 243, 221, 0.35)';
			context.lineWidth = 0.8;
			this.#strokeEdges(context, drawn, at, true, 0.55);
		}

		// Rubber band from the anchor to the pointer or the keyboard cursor.
		if (this.#anchor >= 0 && this.#interactive) {
			const [ax, ay] = at(this.#stars[this.#anchor]!.x, this.#stars[this.#anchor]!.y);
			let target: [number, number] | null = null;
			if (this.#keyboard && this.#cursor >= 0 && this.#cursor !== this.#anchor) target = at(this.#stars[this.#cursor]!.x, this.#stars[this.#cursor]!.y);
			else if (!this.#keyboard && this.#pointer.inside && (this.#drag?.chain || !this.#pointer.touch)) target = [this.#pointer.x, this.#pointer.y];
			if (target) {
				context.setLineDash([3, 5]);
				context.strokeStyle = 'rgba(251, 243, 221, 0.55)';
				context.lineWidth = 1.2;
				context.beginPath();
				context.moveTo(ax, ay);
				context.lineTo(target[0], target[1]);
				context.stroke();
				context.setLineDash([]);
			}
		}

		// Stars.
		const twinkle = !this.reducedMotion;
		for (const [index, star] of this.#stars.entries()) {
			if (star.appear <= 0) continue;
			const [x, y] = at(star.x, star.y);
			if (x < -30 || y < -30 || x > this.#width + 30 || y > this.#height + 30) continue;
			const sign = star.sign >= 0 ? this.#signs[star.sign]! : null;
			const boost = sign ? (this.mode === 'trace' ? this.#hint * 0.3 : this.#tuning().hint * (0.12 + 0.4 * sign.hover)) : 0;
			const shimmer = twinkle ? 0.78 + 0.22 * Math.sin(this.#time * star.speed + star.phase) : 0.9;
			const done = sign?.done ? 1 : 0;
			const light = Math.min(1, (0.5 + boost + star.lit * 0.3 + done * 0.25) * shimmer) * star.appear;
			const pop = 1 + star.pop * star.pop * 1.6;
			const radius = star.r * unit * pop * (1 + done * 0.35 + star.lit * 0.15);
			const halo = radius * (7 + light * 5);
			context.globalAlpha = this.#fade * light * 0.9;
			context.drawImage(glow, x - halo / 2, y - halo / 2, halo, halo);
			context.globalAlpha = this.#fade * Math.min(1, light + 0.2);
			context.fillStyle = star.lit || done ? COLORS.butter : COLORS.cream;
			context.beginPath();
			context.arc(x, y, radius, 0, TAU);
			context.fill();
			context.globalAlpha = this.#fade;
			if (index === this.#hover && index !== this.#anchor) this.#circle(context, x, y, 9 * unit, 'rgba(251, 243, 221, 0.55)', 1.2);
		}

		// Anchor and keyboard cursor rings.
		if (this.#anchor >= 0) {
			const [x, y] = at(this.#stars[this.#anchor]!.x, this.#stars[this.#anchor]!.y);
			const pulse = this.reducedMotion ? 0 : Math.sin(this.#time * 6) * 1.5;
			this.#circle(context, x, y, 10 * unit + pulse, COLORS.butter, 1.6);
		}
		if (this.#keyboard && this.#cursor >= 0) {
			const [x, y] = at(this.#stars[this.#cursor]!.x, this.#stars[this.#cursor]!.y);
			context.setLineDash([3, 3]);
			this.#circle(context, x, y, 15 * unit, COLORS.cream, 1.5);
			context.setLineDash([]);
		}

		// Sparkles and rings.
		for (const particle of this.#particles) {
			const [x, y] = at(particle.x, particle.y);
			const life = particle.life / particle.max;
			if (particle.ring) {
				const radius = (1 - life) * particle.size * 26 * unit + 4;
				this.#circle(context, x, y, radius, `rgba(252, 215, 114, ${life * 0.7})`, 1.4);
				continue;
			}
			context.globalAlpha = this.#fade * Math.min(1, life * 1.6);
			context.fillStyle = life > 0.5 ? COLORS.cream : COLORS.butter;
			this.#sparkle(context, x, y, particle.size * unit * (0.5 + life * 0.5));
			context.globalAlpha = this.#fade;
		}

		// Names under completed signs.
		context.font = `700 ${Math.round(11 * clamp(unit, 0.85, 1.25))}px Geist, ui-sans-serif, system-ui, sans-serif`;
		context.textAlign = 'center';
		context.textBaseline = 'top';
		if ('letterSpacing' in context) context.letterSpacing = '0.18em';
		for (const [index, sign] of this.#signs.entries()) {
			if (!sign.done || index === this.#card) continue;
			const box = this.#signBox(sign, drift);
			context.globalAlpha = this.#fade * easeOut(sign.fill) * 0.85;
			context.fillStyle = COLORS.cream;
			context.fillText(sign.def.name().toUpperCase(), (box.minX + box.maxX) / 2 + shakeX, box.maxY + 10 + shakeY);
		}
		context.globalAlpha = 1;

		// Note card: let the component place it, then hang it from the sign with two threads.
		if (this.#card >= 0) {
			const sign = this.#signs[this.#card]!;
			const box = this.#signBox(sign, drift);
			const rect = this.#hooks.placeCard(box);
			// Threads from the sign's nearest side to the card's facing edge; none when the card has to overlap the sign.
			if (rect) {
				const cx = (box.minX + box.maxX) / 2;
				const cy = (box.minY + box.maxY) / 2;
				let threads: [number, number, number, number, number, number] | null = null;
				if (rect.y >= box.maxY) threads = [cx, box.maxY + 6, rect.x + rect.w * 0.3, rect.y + 4, rect.x + rect.w * 0.7, rect.y + 4];
				else if (rect.y + rect.h <= box.minY) threads = [cx, box.minY - 6, rect.x + rect.w * 0.3, rect.y + rect.h - 4, rect.x + rect.w * 0.7, rect.y + rect.h - 4];
				else if (rect.x >= box.maxX) threads = [box.maxX + 6, cy, rect.x + 4, rect.y + rect.h * 0.3, rect.x + 4, rect.y + rect.h * 0.7];
				else if (rect.x + rect.w <= box.minX) threads = [box.minX - 6, cy, rect.x + rect.w - 4, rect.y + rect.h * 0.3, rect.x + rect.w - 4, rect.y + rect.h * 0.7];
				if (threads) {
					const [ax, ay, x1, y1, x2, y2] = threads;
					context.globalAlpha = this.#fade * 0.7;
					context.strokeStyle = COLORS.butter;
					context.lineWidth = 1;
					context.beginPath();
					context.moveTo(ax, ay);
					context.lineTo(x1, y1);
					context.moveTo(ax, ay);
					context.lineTo(x2, y2);
					context.stroke();
					context.fillStyle = COLORS.butter;
					this.#sparkle(context, ax, ay, 4);
				}
				context.globalAlpha = 1;
			}
		}
	}

	#drawDust(context: CanvasRenderingContext2D, drift: [number, number]) {
		const dust = this.#dust;
		if (!dust) return;
		const parallax = 0.35;
		const offsetX = ((((this.#cam.x + drift[0]) * this.#cam.scale * parallax) % DUST_TILE) + DUST_TILE) % DUST_TILE;
		const offsetY = ((((this.#cam.y + drift[1]) * this.#cam.scale * parallax) % DUST_TILE) + DUST_TILE) % DUST_TILE;
		context.globalAlpha = 0.85;
		for (let x = -offsetX; x < this.#width; x += DUST_TILE) for (let y = -offsetY; y < this.#height; y += DUST_TILE) context.drawImage(dust, x, y, DUST_TILE, DUST_TILE);
		context.globalAlpha = 1;
	}

	/** Hand-drawn strokes: each edge bends slightly (fixed per edge); `partial` honors the draw-in progress. */
	#strokeEdges(context: CanvasRenderingContext2D, edges: Edge[], at: (x: number, y: number) => [number, number], partial: boolean, bendScale = 1) {
		context.beginPath();
		for (const edge of edges) {
			const [ax, ay] = at(this.#stars[edge.a]!.x, this.#stars[edge.a]!.y);
			const [bx, by] = at(this.#stars[edge.b]!.x, this.#stars[edge.b]!.y);
			const bend = edge.bend * bendScale;
			const cx = (ax + bx) / 2 - (by - ay) * bend;
			const cy = (ay + by) / 2 + (bx - ax) * bend;
			const t = partial ? easeOut(edge.t) : 1;
			context.moveTo(ax, ay);
			if (t >= 1) {
				context.quadraticCurveTo(cx, cy, bx, by);
			} else {
				// de Casteljau split of the quadratic at t.
				const qx = ax + (cx - ax) * t;
				const qy = ay + (cy - ay) * t;
				const rx = cx + (bx - cx) * t;
				const ry = cy + (by - cy) * t;
				context.quadraticCurveTo(qx, qy, qx + (rx - qx) * t, qy + (ry - qy) * t);
			}
		}
		context.stroke();
	}

	#circle(context: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, width: number) {
		context.strokeStyle = color;
		context.lineWidth = width;
		context.beginPath();
		context.arc(x, y, Math.max(0.1, radius), 0, TAU);
		context.stroke();
	}

	#sparkle(context: CanvasRenderingContext2D, x: number, y: number, size: number) {
		const inner = size * 0.22;
		context.beginPath();
		context.moveTo(x, y - size);
		context.lineTo(x + inner, y - inner);
		context.lineTo(x + size, y);
		context.lineTo(x + inner, y + inner);
		context.lineTo(x, y + size);
		context.lineTo(x - inner, y + inner);
		context.lineTo(x - size, y);
		context.lineTo(x - inner, y - inner);
		context.closePath();
		context.fill();
	}

	#signBox(sign: Sign, drift: [number, number]): Box {
		const box: Box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
		for (const index of sign.stars) {
			const [x, y] = this.#toScreen(this.#stars[index]!.x, this.#stars[index]!.y, drift);
			box.minX = Math.min(box.minX, x);
			box.minY = Math.min(box.minY, y);
			box.maxX = Math.max(box.maxX, x);
			box.maxY = Math.max(box.maxY, y);
		}
		return box;
	}
}
