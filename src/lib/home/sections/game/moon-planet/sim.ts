/**
 * Moon planet simulation: pure data + fixed-timestep `step()`, no DOM. Polar coordinates around the moon center:
 * `a` = angle (radians, 0 = up, clockwise, unwrapped), `h` = height above the surface. `pa`/`ph` = previous values for
 * render interpolation.
 */
import type { Tuning } from './tuning.ts';

export const R = 100;
export const STEP = 1 / 120;
export const TAU = Math.PI * 2;
export const PLAYER_W = 13;
export const PLAYER_H = 30;
export const LIVES = 3;

const COYOTE = 0.1;
const BUFFER = 0.14;
const INVULN = 1.6;
const MAX_PARTICLES = 360;
const STAR_COUNT = 5;
const STAR_RADIUS = 15;

export const COLORS = {
	butter: '#fcd772',
	ochre: '#e2a93b',
	cream: '#fbf3dd',
	night: '#18191b',
	ink: '#0e0f10',
	dusk: '#2a2723'
} as const;

export const wrap = (angle: number) => {
	const value = (angle + Math.PI) % TAU;
	return (value < 0 ? value + TAU : value) - Math.PI;
};
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]!;

export interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
	max: number;
	size: number;
	color: string;
	/** 0 = dot, 1 = sparkle, 2 = ring */
	kind: 0 | 1 | 2;
	drag: number;
	pull: number;
}

export interface Popup {
	a: number;
	h: number;
	value: number;
	t: number;
	big: boolean;
}

export interface Player {
	a: number;
	h: number;
	pa: number;
	ph: number;
	vt: number;
	vr: number;
	facing: 1 | -1;
	grounded: boolean;
	coyote: number;
	buffer: number;
	held: boolean;
	diving: boolean;
	/** Squash & stretch: 1 neutral, > 1 tall, < 1 squashed (damped spring). */
	stretch: number;
	stretchV: number;
	runPhase: number;
	invuln: number;
	dead: boolean;
	spin: number;
}

export type BugKind = 'crawler' | 'hopper' | 'boss';

export interface Bug {
	kind: BugKind;
	a: number;
	h: number;
	pa: number;
	ph: number;
	vr: number;
	dir: 1 | -1;
	speed: number;
	state: 'emerge' | 'walk' | 'dead';
	t: number;
	emergeTime: number;
	hp: number;
	maxHp: number;
	hurt: number;
	hopIn: number;
	turnIn: number;
	w: number;
	hgt: number;
	phase: number;
}

export interface Star {
	a: number;
	h: number;
	pa: number;
	ph: number;
	base: number;
	orbit: number;
	bob: number;
	t: number;
	/** > 0: collected, waiting to respawn */
	respawn: number;
}

export type Over = 'none' | 'dead' | 'time';

export interface Game {
	player: Player;
	bugs: Bug[];
	stars: Star[];
	particles: Particle[];
	popups: Popup[];
	score: number;
	lives: number;
	squashes: number;
	nextBoss: number;
	bossesBeaten: number;
	combo: number;
	started: boolean;
	elapsed: number;
	roundTime: number;
	over: Over;
	overT: number;
	spawnIn: number;
	hitStop: number;
	trauma: number;
	/** Cream flash strength (0..1), skipped in calm mode. */
	flash: number;
	time: number;
	cam: { a: number; pa: number; fixed: number; pfixed: number };
	calm: boolean;
}

export interface StepInput {
	axis: number;
	held: boolean;
	dive: boolean;
}

function makeStar(game: Game | null, awayFrom: number): Star {
	const a = awayFrom + (Math.random() < 0.5 ? -1 : 1) * rand(0.9, Math.PI);
	const base = rand(38, 96);
	return { a, h: base, pa: a, ph: base, base, orbit: rand(0.06, 0.2) * (Math.random() < 0.5 ? -1 : 1), bob: rand(0, TAU), t: game ? 0 : 1, respawn: 0 };
}

export function createGame(tuning: Tuning, calm: boolean): Game {
	const game: Game = {
		player: {
			a: 0,
			h: 0,
			pa: 0,
			ph: 0,
			vt: 0,
			vr: 0,
			facing: 1,
			grounded: true,
			coyote: 0,
			buffer: 0,
			held: false,
			diving: false,
			stretch: 1,
			stretchV: 0,
			runPhase: 0,
			invuln: 0,
			dead: false,
			spin: 0
		},
		bugs: [],
		stars: [],
		particles: [],
		popups: [],
		score: 0,
		lives: LIVES,
		squashes: 0,
		nextBoss: Math.round(tuning.bossThreshold),
		bossesBeaten: 0,
		combo: 0,
		started: false,
		elapsed: 0,
		roundTime: tuning.roundTime,
		over: 'none',
		overT: 0,
		spawnIn: 1.2,
		hitStop: 0,
		trauma: 0,
		flash: 0,
		time: 0,
		cam: { a: 0, pa: 0, fixed: tuning.cameraMode >= 0.5 ? 1 : 0, pfixed: tuning.cameraMode >= 0.5 ? 1 : 0 },
		calm
	};
	for (let index = 0; index < STAR_COUNT; index++) game.stars.push(makeStar(null, 0));
	return game;
}

export const toXY = (a: number, h: number) => ({ x: Math.sin(a) * (R + h), y: -Math.cos(a) * (R + h) });

/** Queue a jump press (buffered for a short window, so early presses still count). */
export function pressJump(game: Game) {
	game.player.buffer = BUFFER;
	game.started = true;
}

function particle(game: Game, x: number, y: number, vx: number, vy: number, life: number, size: number, color: string, kind: 0 | 1 | 2 = 0, drag = 2.5, pull = 0) {
	if (game.particles.length >= MAX_PARTICLES) game.particles.shift();
	game.particles.push({ x, y, vx, vy, life, max: life, size, color, kind, drag, pull });
}

/** Burst at polar position. `spread` in radians around the outward normal (π = full circle). */
function burst(
	game: Game,
	a: number,
	h: number,
	count: number,
	speed: number,
	colors: readonly string[],
	options: { spread?: number; size?: number; life?: number; kind?: 0 | 1; pull?: number } = {}
) {
	const n = game.calm ? Math.ceil(count * 0.35) : count;
	const { x, y } = toXY(a, h);
	const spread = options.spread ?? Math.PI;
	for (let index = 0; index < n; index++) {
		const dir = a + rand(-spread, spread);
		const v = speed * rand(0.35, 1);
		particle(
			game,
			x,
			y,
			Math.sin(dir) * v,
			-Math.cos(dir) * v,
			(options.life ?? 0.6) * rand(0.6, 1.2),
			(options.size ?? 2.4) * rand(0.6, 1.3),
			pick(colors),
			options.kind ?? 0,
			2.5,
			options.pull ?? 260
		);
	}
}

function ring(game: Game, a: number, h: number, size: number, color: string) {
	const { x, y } = toXY(a, h);
	particle(game, x, y, 0, 0, 0.35, size, color, 2, 0, 0);
}

function shake(game: Game, amount: number) {
	if (!game.calm) game.trauma = Math.min(1, game.trauma + amount);
}

function addScore(game: Game, value: number, a: number, h: number, big = false) {
	game.score += value;
	game.popups.push({ a, h, value, t: 0, big });
}

function spawnBug(game: Game, tuning: Tuning, kind: BugKind) {
	const level = Math.min(1, game.elapsed / game.roundTime);
	const side = Math.random() < 0.5 ? -1 : 1;
	const a = game.player.a + side * rand(kind === 'boss' ? 2.2 : 1.1, Math.PI);
	const boss = kind === 'boss';
	const speed = boss ? tuning.bugSpeed * 0.75 : tuning.bugSpeed * rand(0.8, 1.2) * (1 + 0.9 * level);
	const bug: Bug = {
		kind,
		a,
		h: 0,
		pa: a,
		ph: 0,
		vr: 0,
		dir: Math.random() < 0.5 ? -1 : 1,
		speed,
		state: 'emerge',
		t: 0,
		emergeTime: boss ? 1.6 : 0.6,
		hp: boss ? 3 : 1,
		maxHp: boss ? 3 : 1,
		hurt: 0,
		hopIn: rand(0.8, 2),
		turnIn: rand(2, 5),
		w: boss ? 46 : kind === 'hopper' ? 17 : 19,
		hgt: boss ? 29 : kind === 'hopper' ? 12 : 11,
		phase: rand(0, TAU)
	};
	bug.h = -bug.hgt;
	bug.ph = bug.h;
	game.bugs.push(bug);
	burst(game, a, 0, boss ? 26 : 10, boss ? 160 : 90, [COLORS.ochre, COLORS.butter, COLORS.dusk], { spread: 1.1, size: boss ? 3.2 : 2.2 });
	if (boss) shake(game, 0.35);
}

function hurtPlayer(game: Game, from: number) {
	const p = game.player;
	game.lives -= 1;
	game.combo = 0;
	p.invuln = INVULN;
	p.vt = (from > 0 ? -1 : 1) * 230;
	p.vr = 330;
	p.grounded = false;
	p.diving = false;
	p.coyote = COYOTE;
	p.stretch = 0.7;
	game.hitStop = Math.max(game.hitStop, 0.07);
	game.flash = game.calm ? 0 : 0.5;
	shake(game, 0.5);
	burst(game, p.a, p.h + PLAYER_H * 0.5, 14, 170, [COLORS.cream, COLORS.butter], { size: 2.6, pull: 0 });
	if (game.lives <= 0) {
		game.over = 'dead';
		game.overT = 0;
		p.dead = true;
		p.vr = 520;
		p.vt *= 0.6;
		shake(game, 0.4);
	}
}

function stomp(game: Game, bug: Bug, tuning: Tuning) {
	const p = game.player;
	const top = bug.h + bug.hgt;
	const boosted = p.buffer > 0 || p.held;
	p.h = top;
	p.buffer = 0;
	p.diving = false;
	p.stretch = 0.62;
	p.stretchV = 0;
	if (bug.kind === 'boss') {
		p.vr = tuning.jump * (boosted ? 1.12 : 0.9);
		if (bug.hurt > 0) return;
		bug.hp -= 1;
		bug.hurt = 0.85;
		game.hitStop = Math.max(game.hitStop, 0.14);
		shake(game, 0.6);
		game.flash = game.calm ? 0 : 0.35;
		burst(game, bug.a, top, 22, 220, [COLORS.butter, COLORS.cream, COLORS.ochre], { size: 3, kind: 1 });
		ring(game, bug.a, top * 0.6, 34, COLORS.butter);
		if (bug.hp <= 0) {
			bug.state = 'dead';
			bug.t = 0;
			game.hitStop = 0.22;
			shake(game, 0.9);
			game.bossesBeaten += 1;
			game.nextBoss = game.squashes + Math.round(tuning.bossThreshold);
			addScore(game, 500, bug.a, top + 10, true);
			burst(game, bug.a, bug.hgt * 0.5, 60, 320, [COLORS.butter, COLORS.cream, COLORS.ochre, COLORS.dusk], { size: 3.4, life: 1, kind: 1 });
			ring(game, bug.a, bug.hgt * 0.5, 70, COLORS.cream);
			// Loot: a fan of bonus stars right above the wreck.
			for (let index = 0; index < 5; index++) {
				const star = makeStar(game, 0);
				star.a = bug.a + (index - 2) * 0.16;
				star.base = 64 - Math.abs(index - 2) * 9;
				star.h = star.ph = bug.hgt;
				star.pa = star.a;
				star.orbit = 0;
				game.stars.push(star);
			}
		} else {
			addScore(game, 100, bug.a, top + 6);
			bug.speed *= 1.35;
			bug.dir = wrap(p.a - bug.a) > 0 ? -1 : 1;
		}
		return;
	}
	p.vr = tuning.jump * (boosted ? 1 : 0.72);
	bug.state = 'dead';
	bug.t = 0;
	game.squashes += 1;
	game.combo += 1;
	const value = Math.min(400, 50 * 2 ** (game.combo - 1));
	addScore(game, value, bug.a, top + 4, game.combo > 1);
	game.hitStop = Math.max(game.hitStop, 0.04);
	shake(game, 0.2);
	burst(game, bug.a, top * 0.5, 16, 190, [COLORS.butter, COLORS.ochre, COLORS.cream], { spread: 1.4, size: 2.6 });
	ring(game, bug.a, top * 0.5, 18 + game.combo * 4, COLORS.butter);
}

/** Advance one fixed step. */
export function step(game: Game, tuning: Tuning, input: StepInput) {
	const dt = STEP;
	const p = game.player;
	game.time += dt;
	game.roundTime = tuning.roundTime;

	// Interpolation snapshot.
	p.pa = p.a;
	p.ph = p.h;
	game.cam.pa = game.cam.a;
	game.cam.pfixed = game.cam.fixed;
	for (const bug of game.bugs) {
		bug.pa = bug.a;
		bug.ph = bug.h;
	}
	for (const star of game.stars) {
		star.pa = star.a;
		star.ph = star.h;
	}

	game.trauma = Math.max(0, game.trauma - dt * 1.6);
	game.flash = Math.max(0, game.flash - dt * 3);

	if (game.hitStop > 0) {
		game.hitStop -= dt;
		return;
	}

	if (game.over !== 'none') game.overT += dt;
	if (!game.started && (input.axis !== 0 || input.dive)) game.started = true;
	const playing = game.over === 'none';
	if (game.started && playing) game.elapsed += dt;
	const level = Math.min(1, game.elapsed / game.roundTime);

	updatePlayer(game, tuning, input, playing, dt);
	updateBugs(game, tuning, dt);
	if (playing) collide(game, tuning);
	updateStars(game, dt, playing);
	updateFx(game, dt);
	updateCamera(game, tuning, dt);

	if (playing && game.started) {
		const boss = game.bugs.some((bug) => bug.kind === 'boss' && bug.state !== 'dead');
		if (!boss && game.squashes >= game.nextBoss) spawnBug(game, tuning, 'boss');
		game.spawnIn -= dt;
		const alive = game.bugs.filter((bug) => bug.state !== 'dead').length;
		const maxBugs = boss ? 2 : Math.floor(3 + 5 * level);
		if (game.spawnIn <= 0) {
			if (alive < maxBugs) spawnBug(game, tuning, level > 0.3 && Math.random() < 0.35 ? 'hopper' : 'crawler');
			game.spawnIn = 2.3 / (Math.max(0.05, tuning.spawnRate) * (1 + 1.4 * level));
		}
		if (game.elapsed >= game.roundTime) endRound(game);
	}
}

function endRound(game: Game) {
	game.over = 'time';
	game.overT = 0;
	const p = game.player;
	// Every surviving bug pops into sparkles; leftover lives pay out.
	for (const bug of game.bugs) {
		if (bug.state === 'dead') continue;
		bug.state = 'dead';
		bug.t = 0;
		burst(game, bug.a, bug.hgt * 0.5, 10, 160, [COLORS.butter, COLORS.cream], { kind: 1 });
	}
	if (game.lives > 0) addScore(game, game.lives * 100, p.a, p.h + PLAYER_H + 10, true);
	burst(game, p.a, p.h + PLAYER_H, 40, 300, [COLORS.butter, COLORS.cream, COLORS.ochre], { kind: 1, life: 1.1, pull: 120 });
}

function updatePlayer(game: Game, tuning: Tuning, input: StepInput, playing: boolean, dt: number) {
	const p = game.player;
	p.held = input.held;
	p.invuln = Math.max(0, p.invuln - dt);
	p.buffer = Math.max(0, p.buffer - dt);

	if (p.dead) {
		// Knocked out: tumble off into space.
		p.vr -= tuning.gravity * 0.25 * dt;
		p.h += p.vr * dt;
		p.a += (p.vt * dt) / R;
		p.spin += dt * 9;
		return;
	}

	const axis = playing ? input.axis : 0;
	const target = axis * tuning.runSpeed;
	const turning = axis !== 0 && Math.sign(axis) !== Math.sign(p.vt) && Math.abs(p.vt) > 10;
	const accel = (p.grounded ? 2200 : 1300) * (turning ? 1.7 : 1) * (tuning.runSpeed / 170);
	const decel = p.grounded ? 2600 : 600;
	const rate = axis === 0 ? decel : accel;
	p.vt += Math.max(-rate * dt, Math.min(rate * dt, target - p.vt));
	if (axis !== 0) p.facing = axis > 0 ? 1 : -1;

	if (p.grounded) p.coyote = COYOTE;
	else p.coyote = Math.max(0, p.coyote - dt);

	// Jump (buffered, coyote time). After round end: little victory hops.
	const victoryHop = game.over === 'time' && p.grounded && game.overT > 0.2;
	if ((playing && p.buffer > 0 && (p.grounded || p.coyote > 0) && p.vr <= 0) || victoryHop) {
		p.vr = victoryHop ? tuning.jump * 0.55 : tuning.jump;
		p.grounded = false;
		p.coyote = 0;
		p.buffer = 0;
		p.stretch = 1.38;
		p.stretchV = 0;
		burst(game, p.a, 0, 7, 70, [COLORS.ochre, COLORS.dusk], { spread: 1.2, size: 2, life: 0.4, pull: 200 });
	}

	if (playing && input.dive && !p.grounded && !p.diving) {
		p.diving = true;
		p.vr = Math.min(p.vr, -tuning.jump * 1.15);
		p.stretch = 1.3;
	}

	// Variable jump height: extra gravity while rising without holding, heavier fall.
	let mult = 1;
	if (p.vr > 0 && !p.held && game.over !== 'time') mult = 2.7;
	else if (p.vr <= 0) mult = 1.45;
	p.vr -= tuning.gravity * mult * dt;
	if (p.diving) p.vr = Math.min(p.vr, -tuning.jump * 1.15);
	p.vr = Math.max(p.vr, -tuning.jump * 2);
	p.h += p.vr * dt;
	p.a += (p.vt * dt) / R;

	if (p.h <= 0) {
		if (!p.grounded) {
			const impact = Math.min(1, -p.vr / (tuning.jump * 1.4));
			p.stretch = 1 - 0.38 * impact;
			p.stretchV = 0;
			burst(game, p.a, 0, Math.round(4 + 10 * impact), 60 + 90 * impact, [COLORS.ochre, COLORS.dusk, COLORS.butter], { spread: 1.3, size: 2, life: 0.45, pull: 220 });
			if (p.diving) shake(game, 0.15);
			game.combo = 0;
		}
		p.h = 0;
		p.vr = 0;
		p.grounded = true;
		p.diving = false;
	} else if (p.h > 0.01) {
		p.grounded = false;
	}

	// Squash & stretch spring.
	p.stretchV += (-(p.stretch - 1) * 520 - p.stretchV * 20) * dt;
	p.stretch += p.stretchV * dt;
	if (p.grounded) p.runPhase += (Math.abs(p.vt) / 6.5) * dt;
}

function updateBugs(game: Game, tuning: Tuning, dt: number) {
	const p = game.player;
	for (let index = game.bugs.length - 1; index >= 0; index--) {
		const bug = game.bugs[index]!;
		bug.t += dt;
		bug.hurt = Math.max(0, bug.hurt - dt);
		if (bug.state === 'dead') {
			if (bug.t > (bug.kind === 'boss' ? 1.2 : 0.8)) game.bugs.splice(index, 1);
			continue;
		}
		if (bug.state === 'emerge') {
			bug.h = -bug.hgt * (1 - Math.min(1, bug.t / bug.emergeTime));
			if (bug.kind === 'boss' && Math.random() < 0.3) burst(game, bug.a, 0, 1, 80, [COLORS.ochre, COLORS.dusk], { spread: 1, size: 2.4 });
			if (bug.t >= bug.emergeTime) {
				bug.state = 'walk';
				bug.h = 0;
				if (bug.kind === 'boss') shake(game, 0.3);
			}
			continue;
		}
		const speed = bug.speed * (bug.hurt > 0 ? 0.3 : 1);
		bug.a += (bug.dir * speed * dt) / R;
		bug.phase += speed * dt * 0.45;
		bug.turnIn -= dt;
		if (bug.turnIn <= 0) {
			bug.turnIn = rand(2.5, 5);
			if (bug.kind === 'boss') bug.dir = wrap(p.a - bug.a) > 0 ? 1 : -1;
			else if (Math.random() < 0.4) bug.dir = bug.dir === 1 ? -1 : 1;
		}
		if (bug.kind === 'hopper' && bug.h <= 0) {
			bug.hopIn -= dt;
			if (bug.hopIn <= 0) {
				bug.vr = rand(230, 300);
				bug.hopIn = rand(1.3, 2.6);
			}
		}
		if (bug.h > 0 || bug.vr > 0) {
			bug.vr -= tuning.gravity * 0.9 * dt;
			bug.h += bug.vr * dt;
			if (bug.h <= 0) {
				bug.h = 0;
				bug.vr = 0;
				burst(game, bug.a, 0, 3, 50, [COLORS.ochre, COLORS.dusk], { spread: 1.2, size: 1.6, life: 0.3 });
			}
		}
	}
}

function collide(game: Game, tuning: Tuning) {
	const p = game.player;
	if (p.dead) return;
	for (const bug of game.bugs) {
		if (bug.state !== 'walk') continue;
		const dx = wrap(bug.a - p.a) * R;
		const halfW = (PLAYER_W + bug.w) / 2;
		if (Math.abs(dx) > halfW + 3) continue;
		const top = bug.h + bug.hgt;
		if (p.h > top || p.h + PLAYER_H < bug.h + 1) continue;
		const fromAbove = p.vr <= 60 && !p.grounded && p.ph >= top - bug.hgt * 0.55;
		if (fromAbove) {
			stomp(game, bug, tuning);
			if (game.over !== 'none') return;
			continue;
		}
		if (Math.abs(dx) > halfW - 2 || p.invuln > 0 || bug.hurt > 0) continue;
		hurtPlayer(game, dx);
		return;
	}
}

function updateStars(game: Game, dt: number, playing: boolean) {
	const p = game.player;
	const { x: px, y: py } = toXY(p.a, p.h + PLAYER_H * 0.55);
	for (let index = game.stars.length - 1; index >= 0; index--) {
		const star = game.stars[index]!;
		if (star.respawn > 0) {
			star.respawn -= dt;
			if (star.respawn <= 0) {
				if (game.stars.length > STAR_COUNT) {
					game.stars.splice(index, 1);
					continue;
				}
				Object.assign(star, makeStar(game, p.a));
			}
			continue;
		}
		star.t += dt;
		star.a += star.orbit * dt;
		star.h += (star.base + Math.sin(game.time * 2 + star.bob) * 5 - star.h) * Math.min(1, dt * 6);
		if (!playing || p.dead || star.t < 0.3) continue;
		const { x, y } = toXY(star.a, star.h);
		if ((x - px) ** 2 + (y - py) ** 2 < STAR_RADIUS ** 2) {
			star.respawn = 1.4;
			addScore(game, 25, star.a, star.h + 6);
			burst(game, star.a, star.h, 12, 150, [COLORS.butter, COLORS.cream], { kind: 1, size: 2.6, pull: 0, life: 0.55 });
			ring(game, star.a, star.h, 16, COLORS.butter);
		}
	}
}

function updateFx(game: Game, dt: number) {
	for (let index = game.particles.length - 1; index >= 0; index--) {
		const dot = game.particles[index]!;
		dot.life -= dt;
		if (dot.life <= 0) {
			game.particles.splice(index, 1);
			continue;
		}
		if (dot.pull) {
			const dist = Math.hypot(dot.x, dot.y) || 1;
			dot.vx -= (dot.x / dist) * dot.pull * dt;
			dot.vy -= (dot.y / dist) * dot.pull * dt;
		}
		const damp = Math.exp(-dot.drag * dt);
		dot.vx *= damp;
		dot.vy *= damp;
		dot.x += dot.vx * dt;
		dot.y += dot.vy * dt;
		// Dust settles on the surface instead of sinking into the moon.
		const dist = Math.hypot(dot.x, dot.y);
		if (dist < R && dot.kind === 0) {
			dot.x *= R / dist;
			dot.y *= R / dist;
			dot.vx *= 0.5;
			dot.vy *= 0.5;
		}
	}
	for (let index = game.popups.length - 1; index >= 0; index--) {
		const popup = game.popups[index]!;
		popup.t += dt;
		popup.h += dt * (26 - popup.t * 20);
		if (popup.t > 1) game.popups.splice(index, 1);
	}
}

function updateCamera(game: Game, tuning: Tuning, dt: number) {
	const p = game.player;
	const fixed = tuning.cameraMode >= 0.5 ? 1 : 0;
	game.cam.fixed += (fixed - game.cam.fixed) * (1 - Math.exp(-4 * dt));
	// Rotating camera: follow the player's angle with a little look-ahead. Fixed: settle on the nearest upright turn.
	const target = fixed ? Math.round(game.cam.a / TAU) * TAU : p.a + (p.vt / R) * 0.18;
	game.cam.a += (target - game.cam.a) * (1 - Math.exp(-tuning.cameraSmooth * dt));
}
