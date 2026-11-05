/**
 * Stack to the moon: pure simulation (no DOM). World units, y up, origin at the base block's bottom center. The component
 * advances it in fixed `STEP`s; the renderer only reads state.
 *
 * Sway (fake physics): one lean angle `theta`, a damped spring toward the equilibrium lean set by the worst center-of-mass
 * offset (`imbalance`). Off-center drops kick it; the spring softens as the tower grows (taller = slower, wider wobble).
 * `|theta| > collapse` topples. Visually the lean bends the top `SWAY_SPAN` blocks, increasing toward the top.
 */
import { clamp, lerp, rng, smoothstep } from './rng.ts';

export const STEP = 1 / 240;
export const BLOCK_H = 0.7;
export const BASE_W = 3.8;
export const START_W = 3.2;
const MAX_W = 3.4;
const SWING_GAP = 3.2;
const SWING_AMP = 2.7;
export const ROPE = 7;
const SWAY_SPAN = 9;
const MIN_OVERLAP = 0.14;
export const MOON_R = 3.2;

/** The owner's tools (proper names, shown on the blocks). */
const TOOLS = [
	'SvelteKit',
	'Svelte',
	'Drizzle',
	'Cloudflare',
	'Postgres',
	'T3 Code',
	'AI',
	'Tailwind',
	'TypeScript',
	'Vite',
	'pnpm',
	'Workers',
	'valibot',
	'Paraglide',
	'Threlte',
	'mdsvex',
	'Git',
	'oxlint'
];

export interface Tuning {
	swingSpeed: number;
	/** 0 = slide, 1 = pendulum */
	swingMode: number;
	gravity: number;
	swayStiffness: number;
	swayDamping: number;
	swayKick: number;
	/** how strongly the stack's center-of-mass offset leans the tower */
	swayLean: number;
	/** radians */
	collapse: number;
	/** blocks */
	moonHeight: number;
	/** world units of offset that still count as perfect */
	perfect: number;
}

export const DEFAULT_TUNING: Tuning = {
	swingSpeed: 1,
	swingMode: 1,
	gravity: 30,
	swayStiffness: 14,
	swayDamping: 1.6,
	swayKick: 0.6,
	swayLean: 3,
	collapse: 0.2,
	moonHeight: 24,
	perfect: 0.1
};

export type Tone = 'cream' | 'butter' | 'ochre' | 'charcoal';

/** Texture spec of a paper block. Equal specs share one cached texture. */
export interface Paper {
	label: string;
	tone: Tone;
	seed: number;
	w: number;
	/** side cut straight by a slice: -1 left, 1 right, 0 none */
	cut: -1 | 0 | 1;
}

export interface Block {
	x: number;
	w: number;
	paper: Paper;
	squash: number;
	squashV: number;
	flash: number;
}

/** World pose of a tower block: center and lean (positive = top toward +x, also the canvas rotation). */
export interface Pose {
	x: number;
	y: number;
	lean: number;
}

export interface Active {
	paper: Paper;
	w: number;
	centerX: number;
	baseY: number;
	phase: number;
	enter: number;
	/** bottom center */
	x: number;
	y: number;
	angle: number;
	falling: boolean;
	vy: number;
}

export interface Debris {
	paper: Paper;
	/** horizontal crop of the paper texture, fractions 0…1 */
	crop0: number;
	crop1: number;
	w: number;
	x: number;
	y: number;
	angle: number;
	vx: number;
	vy: number;
	va: number;
}

export type ParticleKind = 'dust' | 'confetti' | 'star' | 'ring';

export interface Particle {
	kind: ParticleKind;
	x: number;
	y: number;
	vx: number;
	vy: number;
	angle: number;
	va: number;
	w: number;
	h: number;
	life: number;
	max: number;
	color: number;
}

export type GameEvent =
	| { type: 'drop' }
	| { type: 'land'; perfect: boolean; combo: number; x: number; y: number; cut: number }
	| { type: 'score'; score: number }
	| { type: 'moon' }
	| { type: 'over'; score: number };

export type State = 'play' | 'over' | 'topple';

export interface Game {
	random: () => number;
	time: number;
	state: State;
	stateT: number;
	blocks: Block[];
	poses: Pose[];
	active: Active | null;
	spawnT: number;
	debris: Debris[];
	particles: Particle[];
	theta: number;
	omega: number;
	lean: number;
	danger: number;
	jitter: number;
	overT: number;
	toppleDir: number;
	viewW: number;
	viewH: number;
	camX: number;
	camY: number;
	camVX: number;
	camVY: number;
	camSnap: boolean;
	trauma: number;
	combo: number;
	score: number;
	placed: number;
	labelIndex: number;
	labels: string[];
	lastTone: Tone;
	moonReached: boolean;
	/** moon offset from the camera before it is reached (it travels with the view), world position after */
	moon: { x: number; y: number; r: number; ox: number; oy: number; ax: number; ay: number };
	bridge: { block: number; t: number; x1: number; y1: number } | null;
	mascot: { mode: 'ground' | 'hop' | 'walk' | 'cheer'; t: number; x: number; y: number };
	started: boolean;
}

export interface StepOptions {
	tuning: Tuning;
	calm: boolean;
	emit: (event: GameEvent) => void;
}

export function createGame(seed = (Math.random() * 2 ** 31) | 0): Game {
	const random = rng(seed);
	const labels = [...TOOLS];
	for (let i = labels.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[labels[i], labels[j]] = [labels[j]!, labels[i]!];
	}
	const game: Game = {
		random,
		time: 0,
		state: 'play',
		stateT: 0,
		blocks: [{ x: 0, w: BASE_W, paper: { label: 'SOLO STACK', tone: 'charcoal', seed: 7, w: BASE_W, cut: 0 }, squash: 0, squashV: 0, flash: 0 }],
		poses: [],
		active: null,
		spawnT: 0,
		debris: [],
		particles: [],
		theta: 0,
		omega: 0,
		lean: 0,
		danger: 0,
		jitter: 0,
		overT: 0,
		toppleDir: 1,
		viewW: 16,
		viewH: 9,
		camX: 0,
		camY: 0,
		camVX: 0,
		camVY: 0,
		camSnap: true,
		trauma: 0,
		combo: 0,
		score: 0,
		placed: 0,
		labelIndex: 0,
		labels,
		lastTone: 'charcoal',
		moonReached: false,
		moon: { x: 0, y: 0, r: 0.95, ox: 5, oy: 3, ax: 0, ay: 0 },
		bridge: null,
		mascot: { mode: 'ground', t: 0, x: -2.75, y: 0.32 },
		started: false
	};
	computePoses(game);
	spawn(game, DEFAULT_TUNING);
	game.active!.enter = 1;
	return game;
}

/** Top center of the top tower block (world). */
export function topCenter(game: Game): { x: number; y: number; lean: number } {
	const pose = game.poses[game.poses.length - 1]!;
	return { x: pose.x + Math.sin(pose.lean) * (BLOCK_H / 2), y: pose.y + Math.cos(pose.lean) * (BLOCK_H / 2), lean: pose.lean };
}

/** World point of a tower block's local (u along the block, v up from its center). */
export function blockPoint(pose: Pose, u: number, v: number): { x: number; y: number } {
	const c = Math.cos(pose.lean);
	const s = Math.sin(pose.lean);
	return { x: pose.x + u * c + v * s, y: pose.y - u * s + v * c };
}

export function drop(game: Game): boolean {
	const active = game.active;
	if (game.state !== 'play' || !active || active.falling || active.enter < 0.5) return false;
	active.falling = true;
	active.vy = 0;
	game.started = true;
	return true;
}

/** The moon's progress for the HUD rail: placed blocks / goal, can exceed 1 in endless mode. */
export function progress(game: Game, tuning: Tuning): number {
	return game.placed / Math.max(1, Math.round(tuning.moonHeight));
}

function pickTone(game: Game): Tone {
	let tone: Tone;
	do {
		const roll = game.random();
		tone = roll < 0.44 ? 'cream' : roll < 0.8 ? 'butter' : roll < 0.93 ? 'ochre' : 'charcoal';
	} while (tone === game.lastTone);
	game.lastTone = tone;
	return tone;
}

function swingFrequency(game: Game, tuning: Tuning): number {
	return 0.34 * tuning.swingSpeed * (1 + Math.min(0.9, game.placed * 0.028));
}

function spawn(game: Game, tuning: Tuning) {
	const top = game.blocks[game.blocks.length - 1]!;
	const width = game.blocks.length === 1 ? START_W : top.w;
	const center = topCenter(game);
	const label = game.labels[game.labelIndex++ % game.labels.length]!;
	const side = game.placed % 2 === 0 ? -1 : 1;
	game.active = {
		paper: { label, tone: pickTone(game), seed: Math.floor(game.random() * 1e9), w: width, cut: 0 },
		w: width,
		centerX: center.x,
		baseY: center.y + SWING_GAP,
		phase: (side * Math.PI) / 2,
		enter: 0,
		x: center.x + side * SWING_AMP,
		y: center.y + SWING_GAP + 2,
		angle: 0,
		falling: false,
		vy: 0
	};
	positionSwing(game.active, tuning);
}

function positionSwing(active: Active, tuning: Tuning) {
	const s = Math.sin(active.phase);
	const rise = (1 - active.enter) ** 3 * 2.2;
	if (tuning.swingMode >= 0.5) {
		const angle = Math.asin(SWING_AMP / ROPE) * s;
		// rope from a pivot above; the block hangs at its top center, so it tilts against the swing
		const topX = active.centerX + ROPE * Math.sin(angle);
		const topY = active.baseY + BLOCK_H + ROPE * (1 - Math.cos(angle));
		active.x = topX + BLOCK_H * Math.sin(angle);
		active.y = topY - BLOCK_H * Math.cos(angle) + rise;
		active.angle = -angle;
	} else {
		active.x = active.centerX + SWING_AMP * s;
		active.y = active.baseY + rise;
		active.angle = 0;
	}
}

export function computePoses(game: Game) {
	const { blocks, poses } = game;
	const n = blocks.length;
	poses.length = n;
	poses[0] ??= { x: 0, y: 0, lean: 0 };
	poses[0].x = blocks[0]!.x;
	poses[0].y = BLOCK_H / 2;
	poses[0].lean = 0;
	const span = game.state === 'topple' ? SWAY_SPAN + game.stateT * 30 : SWAY_SPAN;
	for (let i = 1; i < n; i++) {
		const k = n - 1 - i;
		const f = clamp(1 - k / span, 0, 1);
		const lean = game.theta * f + (game.jitter ? game.jitter * f * Math.sin(game.time * 31 + i * 1.7) : 0);
		const prev = poses[i - 1]!;
		const du = blocks[i]!.x - blocks[i - 1]!.x;
		const pc = Math.cos(prev.lean);
		const ps = Math.sin(prev.lean);
		const bx = prev.x + (BLOCK_H / 2) * ps + du * pc;
		const by = prev.y + (BLOCK_H / 2) * pc - du * ps;
		const pose = (poses[i] ??= { x: 0, y: 0, lean: 0 });
		pose.lean = lean;
		pose.x = bx + Math.sin(lean) * (BLOCK_H / 2);
		pose.y = by + Math.cos(lean) * (BLOCK_H / 2);
	}
}

/** Worst normalized center-of-mass offset over all levels (signed, ±1 = at the edge of its support). */
function imbalance(blocks: Block[]): { weighted: number; raw: number } {
	let sumW = 0;
	let sumWX = 0;
	let weighted = 0;
	let raw = 0;
	for (let k = blocks.length - 1; k >= 1; k--) {
		const block = blocks[k]!;
		sumW += block.w;
		sumWX += block.w * block.x;
		const below = blocks[k - 1]!;
		const r = (sumWX / sumW - below.x) / (below.w / 2);
		const value = r * Math.min(1, (blocks.length - k) / 3);
		if (Math.abs(value) > Math.abs(weighted)) weighted = value;
		if (Math.abs(r) > Math.abs(raw)) raw = r;
	}
	return { weighted, raw };
}

function addParticle(game: Game, particle: Particle) {
	if (game.particles.length < 420) game.particles.push(particle);
}

function dust(game: Game, x: number, y: number, side: number, count: number) {
	for (let i = 0; i < count; i++) {
		const life = 0.4 + game.random() * 0.45;
		addParticle(game, {
			kind: 'dust',
			x: x + (game.random() - 0.5) * 0.15,
			y: y + game.random() * 0.1,
			vx: side * (0.6 + game.random() * 2.4),
			vy: game.random() * 0.9,
			angle: 0,
			va: 0,
			w: 0.03 + game.random() * 0.06,
			h: 0,
			life,
			max: life,
			color: Math.floor(game.random() * 3)
		});
	}
}

function confetti(game: Game, x: number, y: number, count: number) {
	for (let i = 0; i < count; i++) {
		const life = 2.6 + game.random() * 1.8;
		const star = game.random() < 0.3;
		addParticle(game, {
			kind: star ? 'star' : 'confetti',
			x: x + (game.random() - 0.5) * 0.6,
			y: y + game.random() * 0.4,
			vx: (game.random() - 0.5) * 10,
			vy: 3.5 + game.random() * 7.5,
			angle: game.random() * Math.PI * 2,
			va: (game.random() - 0.5) * 14,
			w: star ? 0.09 + game.random() * 0.08 : 0.12 + game.random() * 0.12,
			h: 0.07 + game.random() * 0.06,
			life,
			max: life,
			color: Math.floor(game.random() * 4)
		});
	}
}

function land(game: Game, tuning: Tuning, calm: boolean, emit: (event: GameEvent) => void) {
	const active = game.active!;
	const top = game.blocks[game.blocks.length - 1]!;
	const topPose = game.poses[game.poses.length - 1]!;
	const center = topCenter(game);
	const u = (active.x - center.x) / Math.cos(center.lean);
	const perfect = Math.abs(u) <= tuning.perfect;
	const newX = perfect ? top.x : top.x + u;
	const left = newX - active.w / 2;
	const right = newX + active.w / 2;
	const overlapL = perfect ? left : Math.max(left, top.x - top.w / 2);
	const overlapR = perfect ? right : Math.min(right, top.x + top.w / 2);
	const width = overlapR - overlapL;

	if (width < MIN_OVERLAP) {
		// clean miss: the block tumbles past, the tower gets a nudge, round over
		const side = Math.sign(u) || 1;
		game.debris.push({
			paper: active.paper,
			crop0: 0,
			crop1: 1,
			w: active.w,
			x: active.x,
			y: active.y + BLOCK_H / 2,
			angle: active.angle,
			vx: side * 1.2,
			vy: active.vy,
			va: side * 2.4
		});
		game.active = null;
		game.omega += side * tuning.swayKick * 0.8;
		game.trauma = Math.min(1, game.trauma + 0.35);
		game.combo = 0;
		gameOver(game, 'over', emit);
		return;
	}

	// slice off the overhangs; they fall with a spin
	const piece = (from: number, to: number, side: number) => {
		const mid = (from + to) / 2 - top.x;
		const point = blockPoint(topPose, mid, BLOCK_H);
		game.debris.push({
			paper: active.paper,
			crop0: (from - left) / active.w,
			crop1: (to - left) / active.w,
			w: to - from,
			x: point.x,
			y: point.y,
			angle: topPose.lean,
			vx: side * (0.5 + (to - from) * 0.5) + game.omega * 0.5,
			vy: 0.6,
			va: side * (1.4 + game.random() * 1.8)
		});
	};
	let cutSide: -1 | 0 | 1 = 0;
	if (!perfect) {
		if (overlapL > left + 0.004) {
			piece(left, overlapL, -1);
			cutSide = -1;
		}
		if (right > overlapR + 0.004) {
			piece(overlapR, right, 1);
			cutSide = 1;
		}
	}
	const cut = active.w - width;

	let w = width;
	let paper = active.paper;
	if (perfect) {
		game.combo += 1;
		if (game.combo >= 3 && w < MAX_W) w = Math.min(MAX_W, w + 0.1);
	} else {
		game.combo = 0;
	}
	if (w !== paper.w || cutSide) paper = { ...paper, w, cut: cutSide };

	const x = (overlapL + overlapR) / 2;
	top.squash += 0.06;
	game.blocks.push({ x, w, paper, squash: perfect ? 0.26 : 0.17, squashV: 0, flash: perfect ? 1 : 0 });
	game.active = null;
	game.placed += 1;
	computePoses(game);

	// sway: equilibrium from the stack's balance, kick from the offset, perfect drops settle it
	const balance = imbalance(game.blocks);
	game.lean = balance.weighted;
	if (perfect) game.omega *= 0.5;
	else game.omega += tuning.swayKick * clamp(u, -1, 1) * (1 + game.blocks.length * 0.02);

	const newPose = game.poses[game.poses.length - 1]!;
	const leftFoot = blockPoint(newPose, -w / 2, -BLOCK_H / 2);
	const rightFoot = blockPoint(newPose, w / 2, -BLOCK_H / 2);
	dust(game, leftFoot.x, leftFoot.y, -1, perfect ? 9 : 6);
	dust(game, rightFoot.x, rightFoot.y, 1, perfect ? 9 : 6);
	if (perfect) {
		addParticle(game, { kind: 'ring', x: newPose.x, y: newPose.y, vx: 0, vy: 0, angle: newPose.lean, va: 0, w, h: BLOCK_H, life: 0.45, max: 0.45, color: 0 });
	}
	const cutRatio = cut / active.w;
	if (cutRatio > 0.25) game.trauma = Math.min(1, game.trauma + 0.25 + cutRatio * 0.4);
	else game.trauma = Math.min(1, game.trauma + (perfect ? 0.12 : 0.08));

	game.score += perfect ? 10 + 5 * Math.min(game.combo, 10) : 10;
	emit({ type: 'land', perfect, combo: game.combo, x: newPose.x, y: newPose.y + BLOCK_H, cut: cutRatio });

	if (Math.abs(balance.raw) >= 1) {
		game.toppleDir = Math.sign(balance.raw);
		gameOver(game, 'topple', emit);
		return;
	}

	game.spawnT = 0.16;
	if (!game.moonReached && game.placed >= Math.round(tuning.moonHeight)) reachMoon(game, calm, emit);
	emit({ type: 'score', score: game.score });
}

function reachMoon(game: Game, calm: boolean, emit: (event: GameEvent) => void) {
	game.moonReached = true;
	game.score += 200;
	const top = game.blocks[game.blocks.length - 1]!;
	const pose = game.poses[game.poses.length - 1]!;
	const corner = blockPoint(pose, top.w / 2, BLOCK_H / 2);
	const moonX = corner.x + 1.3 + MOON_R;
	const moonY = corner.y + 0.25 * MOON_R;
	// switch the moon from camera-relative to world-anchored without a jump
	game.moon.x = game.camX + game.moon.ox;
	game.moon.y = game.camY + game.moon.oy;
	game.moon.ax = moonX;
	game.moon.ay = moonY;
	const dy = corner.y - moonY;
	game.bridge = { block: game.blocks.length - 1, t: 0, x1: moonX - Math.sqrt(MOON_R * MOON_R - dy * dy), y1: corner.y };
	game.mascot = { mode: 'hop', t: 0, x: pose.x, y: corner.y };
	game.spawnT = 2.6;
	confetti(game, corner.x - top.w / 4, corner.y + 0.4, calm ? 50 : 150);
	emit({ type: 'moon' });
}

function gameOver(game: Game, state: 'over' | 'topple', emit: (event: GameEvent) => void) {
	const wasPlaying = game.state === 'play';
	game.state = state;
	game.stateT = 0;
	if (state === 'topple') {
		game.toppleDir = Math.sign(game.theta) || game.toppleDir || 1;
		game.trauma = Math.min(1, game.trauma + 0.3);
		if (game.active && !game.active.falling) game.active.falling = true;
	}
	if (wasPlaying) emit({ type: 'over', score: game.score });
}

/** Break the top of the tower into tumbling debris (end of the topple). */
function shatter(game: Game) {
	const n = game.blocks.length;
	const first = Math.max(1, n - 20);
	for (let i = first; i < n; i++) {
		const block = game.blocks[i]!;
		const pose = game.poses[i]!;
		const h = (i - first + 1) / (n - first);
		game.debris.push({
			paper: block.paper,
			crop0: 0,
			crop1: 1,
			w: block.w,
			x: pose.x,
			y: pose.y,
			angle: pose.lean,
			vx: game.toppleDir * (0.4 + h * (2 + Math.abs(game.omega) * 2)) + (game.random() - 0.5) * 0.8,
			vy: 0.6 + game.random() * 1.2,
			va: game.toppleDir * (0.6 + h * 2.2) * (0.6 + game.random() * 0.8)
		});
	}
	game.blocks.length = first;
	game.theta = 0;
	game.omega = 0;
	game.jitter = 0;
	game.trauma = Math.min(1, game.trauma + 0.45);
	computePoses(game);
}

export function step(game: Game, dt: number, { tuning, calm, emit }: StepOptions) {
	game.time += dt;
	game.stateT += dt;

	// active block: swing, then fall and land
	const active = game.active;
	if (active) {
		if (!active.falling) {
			active.enter = Math.min(1, active.enter + dt / 0.28);
			active.phase += Math.PI * 2 * swingFrequency(game, tuning) * dt;
			positionSwing(active, tuning);
		} else {
			active.vy -= tuning.gravity * dt;
			active.y += active.vy * dt;
			active.angle *= Math.exp(-12 * dt);
			if (game.state === 'play') {
				const center = topCenter(game);
				const surfaceY = center.y - (active.x - center.x) * Math.tan(center.lean);
				if (active.y <= surfaceY) land(game, tuning, calm, emit);
			} else if (active.y < game.camY - game.viewH) {
				game.active = null;
			}
		}
	} else if (game.state === 'play') {
		game.spawnT -= dt;
		if (game.spawnT <= 0) spawn(game, tuning);
	}

	// sway
	if (game.state === 'topple') {
		game.omega += game.toppleDir * (4 + 12 * Math.abs(game.theta)) * dt;
		game.theta += game.omega * dt;
		if (game.stateT > 0.55 || Math.abs(game.theta) > 0.9) {
			shatter(game);
			game.state = 'over';
		}
	} else if (game.blocks.length > 1) {
		const n = game.blocks.length;
		const stiffness = tuning.swayStiffness / (1 + 0.03 * Math.max(0, n - 6));
		const target = clamp(game.lean * tuning.swayLean, -1.3, 1.3) * tuning.collapse * 0.7;
		const breeze = calm ? 0 : 0.012 * Math.sin(game.time * 1.3) * Math.min(1, n / 12);
		game.omega += (-stiffness * (game.theta - target) - tuning.swayDamping * game.omega + breeze) * dt;
		game.theta += game.omega * dt;
		game.danger = Math.abs(game.theta) / tuning.collapse;
		game.jitter = calm ? 0 : clamp((game.danger - 0.55) / 0.45, 0, 1) * 0.018;
		if (game.danger > 1) {
			game.overT += dt;
			if (game.overT > 0.08) gameOver(game, 'topple', emit);
		} else {
			game.overT = 0;
		}
	} else {
		game.theta = 0;
		game.omega = 0;
		game.danger = 0;
	}
	if (game.state === 'over' && game.blocks.length > 1) game.danger = 0;
	computePoses(game);

	// block squash springs and flashes
	for (const block of game.blocks) {
		if (block.squash !== 0 || block.squashV !== 0) {
			block.squashV += (-320 * block.squash - 18 * block.squashV) * dt;
			block.squash += block.squashV * dt;
			if (Math.abs(block.squash) < 1e-4 && Math.abs(block.squashV) < 1e-3) block.squash = block.squashV = 0;
		}
		if (block.flash > 0) block.flash = Math.max(0, block.flash - dt / 0.4);
	}

	// debris
	const floor = game.camY - game.viewH / 2 - 4;
	for (let i = game.debris.length - 1; i >= 0; i--) {
		const piece = game.debris[i]!;
		piece.vy -= tuning.gravity * 0.55 * dt;
		piece.x += piece.vx * dt;
		piece.y += piece.vy * dt;
		piece.angle += piece.va * dt;
		if (piece.y < floor) game.debris.splice(i, 1);
	}

	// particles
	for (let i = game.particles.length - 1; i >= 0; i--) {
		const p = game.particles[i]!;
		p.life -= dt;
		if (p.life <= 0) {
			game.particles.splice(i, 1);
			continue;
		}
		if (p.kind === 'dust') {
			const drag = Math.exp(-4 * dt);
			p.vx *= drag;
			p.vy = p.vy * drag + 0.5 * dt;
			p.w += 0.08 * dt;
		} else if (p.kind === 'confetti' || p.kind === 'star') {
			p.vy -= 6 * dt;
			p.vx *= Math.exp(-1.4 * dt);
			if (p.vy < -2.2) p.vy = -2.2;
			p.x += Math.sin(game.time * 4 + p.va) * 0.5 * dt;
			p.angle += p.va * dt;
		}
		p.x += p.vx * dt;
		p.y += p.vy * dt;
	}

	updateCamera(game, dt, calm);
	updateMoon(game, dt, tuning);
	updateMascot(game, dt);
	game.trauma = Math.max(0, game.trauma - dt * 1.6);
}

function updateCamera(game: Game, dt: number, calm: boolean) {
	if (game.state === 'play' || game.camSnap) {
		const center = topCenter(game);
		const targetY = Math.max(game.viewH / 2 - 1.7, center.y + 0.12 * game.viewH);
		const celebrating = game.moonReached && game.spawnT > 0 && !game.active ? 1.2 : 0;
		const targetX = center.x * 0.6 + celebrating;
		if (game.camSnap) {
			game.camX = targetX;
			game.camY = targetY;
			game.camVX = game.camVY = 0;
			game.camSnap = false;
			return;
		}
		const w = calm ? 3 : 5.5;
		game.camVX += (w * w * (targetX - game.camX) - 2 * w * game.camVX) * dt;
		game.camVY += (w * w * (targetY - game.camY) - 2 * w * game.camVY) * dt;
	} else {
		game.camVX *= Math.exp(-4 * dt);
		game.camVY *= Math.exp(-4 * dt);
	}
	game.camX += game.camVX * dt;
	game.camY += game.camVY * dt;
}

function updateMoon(game: Game, dt: number, tuning: Tuning) {
	const moon = game.moon;
	const ease = game.time < 0.02 ? 1 : 1 - Math.exp(-5 * dt);
	if (!game.moonReached) {
		const center = topCenter(game);
		const top = game.blocks[game.blocks.length - 1]!;
		const e = smoothstep(progress(game, tuning)) ** 1.5;
		const startX = Math.min(game.viewW / 2 - 1.5, 5.2);
		const startY = game.viewH / 2 - 2.3;
		const endX = center.x + top.w / 2 + 1.3 + MOON_R - game.camX;
		const endY = center.y + 0.25 * MOON_R - game.camY;
		moon.ox += (lerp(startX, endX, e) - moon.ox) * ease;
		moon.oy += (lerp(startY, endY, e) - moon.oy) * ease;
		moon.r += (lerp(0.95, MOON_R, e) - moon.r) * ease;
		moon.x = game.camX + moon.ox;
		moon.y = game.camY + moon.oy;
	} else {
		moon.x += (moon.ax - moon.x) * ease;
		moon.y += (moon.ay - moon.y) * ease;
		moon.r += (MOON_R - moon.r) * ease;
	}
	if (game.bridge) game.bridge.t = Math.min(1, game.bridge.t + dt / 0.9);
}

function updateMascot(game: Game, dt: number) {
	const mascot = game.mascot;
	mascot.t += dt;
	const bridge = game.bridge;
	if (!bridge || mascot.mode === 'ground') return;
	const pose = game.poses[bridge.block];
	const block = game.blocks[bridge.block];
	if (mascot.mode === 'hop' && pose && block) {
		const top = blockPoint(pose, block.w / 2 - 0.45, BLOCK_H / 2);
		mascot.x = top.x;
		mascot.y = top.y;
		if (mascot.t > 1.05) {
			mascot.mode = 'walk';
			mascot.t = 0;
		}
	} else if (mascot.mode === 'walk') {
		const start = pose && block ? blockPoint(pose, block.w / 2 - 0.45, BLOCK_H / 2) : { x: mascot.x, y: mascot.y };
		const t = smoothstep(mascot.t / 1.1);
		mascot.x = lerp(start.x, bridge.x1 + 0.45, t);
		mascot.y = lerp(start.y, bridge.y1, t) + Math.abs(Math.sin(mascot.t * 12)) * 0.08;
		if (mascot.t > 1.1) {
			mascot.mode = 'cheer';
			mascot.t = 0;
		}
	} else if (mascot.mode === 'cheer') {
		mascot.x = bridge.x1 + 0.45;
		mascot.y = bridge.y1;
	}
}

/** Advance `dt` seconds in fixed steps. Returns the leftover time to carry into the next frame. */
export function advance(game: Game, accumulator: number, options: StepOptions): number {
	let acc = accumulator;
	let steps = 0;
	while (acc >= STEP && steps < 48) {
		step(game, STEP, options);
		acc -= STEP;
		steps += 1;
	}
	return acc >= STEP ? 0 : acc;
}
