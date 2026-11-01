/**
 * Canvas 2D renderer for the moon planet prototype: programmer art in the night palette with ink outlines.
 * World space = sim space (moon radius `R`, y down); the camera maps it to CSS pixels. No text except digits.
 */
import { COLORS, LIVES, PLAYER_H, R, TAU, toXY, type Bug, type Game, type Player, type Star } from './sim.ts';

const MONO = "ui-monospace, 'SF Mono', 'Cascadia Mono', 'JetBrains Mono', Menlo, Consolas, 'Liberation Mono', monospace";
const SKIN = '#f1cfa6';
const HAIR = '#2b2420';
const TEE = '#1c1d20';
const PANTS = '#2a2b30';
const SHELL = '#25262a';
const LW = 1.15;

export interface View {
	w: number;
	h: number;
	dpr: number;
	/** Touch device: skip the keycap hint (the touch buttons explain themselves). */
	coarse: boolean;
	/** High score before this round (for the "new best" flourish). */
	best: number;
}

interface Layout {
	x: number;
	y: number;
	s: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Deterministic pseudo random (stable art across frames and resizes). */
function seeded(seed: number) {
	let state = seed;
	return () => {
		state = (state * 1664525 + 1013904223) % 4294967296;
		return state / 4294967296;
	};
}

const random = seeded(22);
const CRATERS = Array.from({ length: 9 }, (_, index) => {
	const a = index * 2.4 + random() * 0.8;
	const d = R * (0.2 + random() * 0.6);
	return { x: Math.sin(a) * d, y: -Math.cos(a) * d, r: R * (0.07 + random() * 0.13) };
});
const SPECKS = Array.from({ length: 46 }, () => {
	const a = random() * TAU;
	const d = R * Math.sqrt(random()) * 0.95;
	return { x: Math.sin(a) * d, y: -Math.cos(a) * d, r: 0.8 + random() * 1.6 };
});

export class Renderer {
	#sky: HTMLCanvasElement | null = null;
	#glowSprite: HTMLCanvasElement | null = null;

	/** Soft butter glow, rendered once and stamped with drawImage (cheaper and softer than gradients per frame). */
	#glow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, strength: number) {
		if (!this.#glowSprite) {
			const sprite = document.createElement('canvas');
			sprite.width = sprite.height = 64;
			const g = sprite.getContext('2d');
			if (g) {
				const gradient = g.createRadialGradient(32, 32, 0, 32, 32, 32);
				gradient.addColorStop(0, 'rgba(252, 215, 114, 0.55)');
				gradient.addColorStop(0.45, 'rgba(252, 215, 114, 0.18)');
				gradient.addColorStop(1, 'rgba(252, 215, 114, 0)');
				g.fillStyle = gradient;
				g.fillRect(0, 0, 64, 64);
			}
			this.#glowSprite = sprite;
		}
		const previous = ctx.globalAlpha;
		ctx.globalAlpha = previous * strength;
		ctx.drawImage(this.#glowSprite, x - radius, y - radius, radius * 2, radius * 2);
		ctx.globalAlpha = previous;
	}
	#skyKey = '';

	/** Camera layout, blending the rotating (big, cropped moon) and fixed (whole moon) framings. */
	layout(view: View, fixed: number): Layout {
		const { w, h } = view;
		const rotR = Math.min(h * 0.34, w * 0.42);
		// Keep room above for the jump arc, but never float the moon into the upper half (portrait).
		const rotate = { x: w / 2, y: Math.max(h * 0.06 + rotR * 2.2, h * 0.52 + rotR), s: rotR / R };
		const fixR = Math.min(w, h) * 0.22;
		const still = { x: w / 2, y: h * 0.53, s: fixR / R };
		return { x: lerp(rotate.x, still.x, fixed), y: lerp(rotate.y, still.y, fixed), s: lerp(rotate.s, still.s, fixed) };
	}

	render(ctx: CanvasRenderingContext2D, game: Game, view: View, alpha: number) {
		const { w, h, dpr } = view;
		const camA = lerp(game.cam.pa, game.cam.a, alpha);
		const fixed = lerp(game.cam.pfixed, game.cam.fixed, alpha);
		const L = this.layout(view, fixed);
		const time = game.time;

		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		this.#background(ctx, view, L, camA * (1 - fixed));

		// Screen shake (trauma², off in calm mode since trauma never rises there).
		const shake = game.trauma * game.trauma;
		const sx = shake * 12 * Math.sin(time * 71.3);
		const sy = shake * 12 * Math.sin(time * 53.7 + 1.3);
		const sr = shake * 0.025 * Math.sin(time * 61.1 + 2.1);

		ctx.save();
		ctx.translate(L.x + sx, L.y + sy);
		ctx.scale(L.s, L.s);
		ctx.rotate(sr - camA);
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';

		this.#orbit(ctx, time);
		this.#moon(ctx, camA - sr);
		for (const star of game.stars) if (star.respawn <= 0) this.#star(ctx, star, alpha, time);
		for (const bug of game.bugs) this.#bug(ctx, bug, alpha, game.calm);
		this.#player(ctx, game, game.player, alpha);
		this.#particles(ctx, game);
		this.#popups(ctx, game, camA - sr);
		ctx.restore();

		if (game.flash > 0) {
			ctx.fillStyle = `rgba(251, 243, 221, ${game.flash * 0.25})`;
			ctx.fillRect(0, 0, w, h);
		}
		this.#hud(ctx, game, view);
	}

	#background(ctx: CanvasRenderingContext2D, view: View, L: Layout, spin: number) {
		const { w, h, dpr } = view;
		const gradient = ctx.createLinearGradient(0, 0, 0, h);
		gradient.addColorStop(0, COLORS.ink);
		gradient.addColorStop(0.65, COLORS.night);
		gradient.addColorStop(1, '#221e19');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, w, h);

		const size = Math.ceil(Math.hypot(w, h));
		const key = `${size}:${dpr}`;
		if (!this.#sky || this.#skyKey !== key) {
			this.#sky = document.createElement('canvas');
			this.#sky.width = Math.round(size * dpr);
			this.#sky.height = Math.round(size * dpr);
			this.#skyKey = key;
			const sky = this.#sky.getContext('2d');
			if (sky) {
				const next = seeded(7);
				sky.scale(dpr, dpr);
				const count = Math.round((size * size) / 5200);
				for (let index = 0; index < count; index++) {
					const bright = next();
					sky.globalAlpha = 0.2 + bright * 0.6;
					sky.fillStyle = bright > 0.85 ? COLORS.butter : COLORS.cream;
					sky.beginPath();
					sky.arc(next() * size, next() * size, 0.4 + bright * bright * 1.3, 0, TAU);
					sky.fill();
				}
			}
		}
		// Slow parallax: the sky turns a little with the rotating camera.
		ctx.save();
		ctx.translate(L.x, L.y);
		ctx.rotate(-spin * 0.3);
		ctx.drawImage(this.#sky, -size / 2 - (L.x - w / 2), -size / 2 - (L.y - h / 2), size, size);
		ctx.restore();

		// Warm haze around the moon.
		const r = R * L.s;
		const glow = ctx.createRadialGradient(L.x, L.y, r * 0.9, L.x, L.y, r * 2.1);
		glow.addColorStop(0, 'rgba(252, 215, 114, 0.26)');
		glow.addColorStop(0.4, 'rgba(226, 169, 59, 0.08)');
		glow.addColorStop(1, 'rgba(226, 169, 59, 0)');
		ctx.fillStyle = glow;
		ctx.fillRect(0, 0, w, h);
	}

	#orbit(ctx: CanvasRenderingContext2D, time: number) {
		ctx.save();
		ctx.strokeStyle = 'rgba(252, 215, 114, 0.18)';
		ctx.lineWidth = 0.7;
		ctx.setLineDash([3, 5]);
		ctx.lineDashOffset = -time * 6;
		ctx.beginPath();
		ctx.arc(0, 0, R + 68, 0, TAU);
		ctx.stroke();
		ctx.restore();
	}

	#moon(ctx: CanvasRenderingContext2D, screenA: number) {
		ctx.save();
		ctx.beginPath();
		ctx.arc(0, 0, R, 0, TAU);
		ctx.fillStyle = COLORS.butter;
		ctx.fill();
		ctx.clip();

		ctx.fillStyle = 'rgba(226, 169, 59, 0.55)';
		for (const speck of SPECKS) {
			ctx.beginPath();
			ctx.arc(speck.x, speck.y, speck.r, 0, TAU);
			ctx.fill();
		}
		for (const crater of CRATERS) {
			ctx.beginPath();
			ctx.arc(crater.x, crater.y, crater.r, 0, TAU);
			ctx.fillStyle = 'rgba(226, 169, 59, 0.75)';
			ctx.fill();
			ctx.beginPath();
			ctx.arc(crater.x + crater.r * 0.18, crater.y + crater.r * 0.18, crater.r * 0.78, 0, TAU);
			ctx.fillStyle = 'rgba(252, 215, 114, 0.55)';
			ctx.fill();
			ctx.lineWidth = 0.8;
			ctx.strokeStyle = 'rgba(14, 15, 16, 0.25)';
			ctx.beginPath();
			ctx.arc(crater.x, crater.y, crater.r, Math.PI * 0.9, Math.PI * 1.7);
			ctx.stroke();
		}

		// Terminator: fixed in screen space (light from the top left), so the moon turns under its own shading.
		ctx.rotate(screenA);
		ctx.beginPath();
		ctx.rect(-R * 2, -R * 2, R * 4, R * 4);
		ctx.arc(-R * 0.32, -R * 0.34, R * 1.12, 0, TAU, true);
		ctx.fillStyle = 'rgba(42, 39, 35, 0.42)';
		ctx.fill('evenodd');
		ctx.restore();

		ctx.beginPath();
		ctx.arc(0, 0, R, 0, TAU);
		ctx.lineWidth = LW * 1.6;
		ctx.strokeStyle = COLORS.ink;
		ctx.stroke();
	}

	#star(ctx: CanvasRenderingContext2D, star: Star, alpha: number, time: number) {
		const a = lerp(star.pa, star.a, alpha);
		const h = lerp(star.ph, star.h, alpha);
		const grow = Math.min(1, star.t / 0.3);
		const { x, y } = toXY(a, h);
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(Math.sin(time * 1.6 + star.bob) * 0.35);
		ctx.scale(grow, grow);
		this.#glow(ctx, 0, 0, 18, 0.9);
		sparkle(ctx, 7.5, 2.4);
		ctx.fillStyle = COLORS.butter;
		ctx.fill();
		ctx.lineWidth = LW * 0.8;
		ctx.strokeStyle = COLORS.ink;
		ctx.stroke();
		ctx.restore();
	}

	#bug(ctx: CanvasRenderingContext2D, bug: Bug, alpha: number, calm: boolean) {
		const a = lerp(bug.pa, bug.a, alpha);
		const h = lerp(bug.ph, bug.h, alpha);
		const { w, hgt } = bug;
		const boss = bug.kind === 'boss';
		ctx.save();
		ctx.rotate(a);
		ctx.translate(0, -R);

		if (bug.state === 'emerge') {
			// Burrowing up: clip at the surface, wobbling crack below.
			ctx.beginPath();
			ctx.rect(-w * 2, -200, w * 4, 200);
			ctx.clip();
			if (boss) {
				ctx.strokeStyle = 'rgba(14, 15, 16, 0.6)';
				ctx.lineWidth = LW;
				ctx.beginPath();
				ctx.ellipse(0, 0, w * 0.7 * Math.min(1, bug.t * 2), 2.2, 0, 0, TAU);
				ctx.stroke();
			}
		}

		ctx.translate(0, -h);
		let fade = 1;
		if (bug.state === 'dead') {
			const t = bug.t / (boss ? 1.2 : 0.8);
			fade = 1 - t;
			ctx.globalAlpha = Math.max(0, fade);
			ctx.scale(1 + 0.3 * Math.min(1, t * 6), 0.28);
		}
		ctx.scale(bug.dir, 1);

		const wiggle = bug.state === 'walk' ? bug.phase : 0;
		const lift = bug.kind === 'hopper' && h > 0;

		// Legs.
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = boss ? LW * 1.4 : LW;
		for (let index = 0; index < 3; index++) {
			const x0 = -w * 0.26 + index * w * 0.24;
			const swing = Math.sin(wiggle + index * 2.1) * (boss ? 3 : 1.6);
			ctx.beginPath();
			ctx.moveTo(x0, -hgt * 0.32);
			ctx.lineTo(x0 + swing - (lift ? 2 : 0), lift ? 1.5 : 0);
			ctx.stroke();
		}

		const hurtBlink = bug.hurt > 0 && !calm && Math.floor(bug.hurt * 16) % 2 === 0;
		// Head.
		const hx = w * 0.36;
		const hy = -hgt * 0.42;
		const hr = hgt * 0.33;
		ctx.beginPath();
		ctx.arc(hx, hy, hr, 0, TAU);
		ctx.fillStyle = hurtBlink ? COLORS.cream : SHELL;
		ctx.fill();
		ctx.lineWidth = LW;
		ctx.stroke();

		// Shell.
		ctx.beginPath();
		ctx.ellipse(-w * 0.06, -hgt * 0.54, w * 0.42, hgt * 0.5, 0, Math.PI, TAU);
		ctx.lineTo(w * 0.36, -hgt * 0.3);
		ctx.quadraticCurveTo(0, -hgt * 0.12, -w * 0.48, -hgt * 0.4);
		ctx.closePath();
		ctx.fillStyle = hurtBlink ? COLORS.cream : boss ? '#1f2023' : SHELL;
		ctx.fill();
		ctx.lineWidth = boss ? LW * 1.5 : LW;
		ctx.stroke();
		// Shell seam + rim light.
		ctx.lineWidth = LW * 0.7;
		ctx.strokeStyle = 'rgba(226, 169, 59, 0.55)';
		ctx.beginPath();
		ctx.ellipse(-w * 0.06, -hgt * 0.54, w * 0.34, hgt * 0.38, 0, Math.PI * 1.15, Math.PI * 1.6);
		ctx.stroke();
		if (bug.kind === 'hopper') {
			ctx.fillStyle = 'rgba(226, 169, 59, 0.8)';
			for (const [sx, sy] of [
				[-0.2, -0.75],
				[0.05, -0.8],
				[-0.32, -0.55]
			] as const) {
				ctx.beginPath();
				ctx.arc(w * sx, hgt * sy, hgt * 0.08, 0, TAU);
				ctx.fill();
			}
			// Antennae.
			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = LW * 0.8;
			ctx.beginPath();
			ctx.moveTo(hx + hr * 0.3, hy - hr * 0.8);
			ctx.quadraticCurveTo(hx + hr, hy - hr * 2.2, hx + hr * 1.8, hy - hr * 2);
			ctx.stroke();
		}
		if (boss) {
			// Code braces etched on the shell.
			ctx.strokeStyle = 'rgba(226, 169, 59, 0.7)';
			ctx.lineWidth = LW * 1.1;
			const bx = -w * 0.08;
			const by = -hgt * 0.62;
			const bh = hgt * 0.2;
			for (const side of [-1, 1]) {
				const cx = bx + side * w * 0.12;
				ctx.beginPath();
				ctx.moveTo(cx + side * 2.2, by - bh);
				ctx.quadraticCurveTo(cx, by - bh, cx, by - bh * 0.4);
				ctx.quadraticCurveTo(cx, by, cx - side * 2, by);
				ctx.quadraticCurveTo(cx, by, cx, by + bh * 0.4);
				ctx.quadraticCurveTo(cx, by + bh, cx + side * 2.2, by + bh);
				ctx.stroke();
			}
		}

		// Glowing eyes.
		if (bug.state !== 'dead') {
			const er = boss ? 2.6 : 1.3;
			for (const [ex, ey] of [
				[hx + hr * 0.55, hy - hr * 0.15],
				[hx + hr * 0.05, hy - hr * 0.25]
			] as const) {
				ctx.fillStyle = 'rgba(252, 215, 114, 0.28)';
				ctx.beginPath();
				ctx.arc(ex, ey, er * 2.4, 0, TAU);
				ctx.fill();
				ctx.fillStyle = COLORS.butter;
				ctx.beginPath();
				ctx.arc(ex, ey, er, 0, TAU);
				ctx.fill();
				ctx.fillStyle = COLORS.cream;
				ctx.beginPath();
				ctx.arc(ex + er * 0.25, ey - er * 0.25, er * 0.4, 0, TAU);
				ctx.fill();
			}
		}

		ctx.restore();

		// Boss HP pips (screen-independent, above the boss).
		if (boss && bug.state !== 'dead') {
			ctx.save();
			ctx.rotate(a);
			ctx.translate(0, -R - h - hgt - 9);
			for (let index = 0; index < bug.maxHp; index++) {
				const x = (index - (bug.maxHp - 1) / 2) * 7;
				ctx.beginPath();
				ctx.arc(x, 0, 2.4, 0, TAU);
				ctx.fillStyle = index < bug.hp ? COLORS.butter : COLORS.ink;
				ctx.fill();
				ctx.lineWidth = LW * 0.8;
				ctx.strokeStyle = index < bug.hp ? COLORS.ink : 'rgba(251, 243, 221, 0.5)';
				ctx.stroke();
			}
			ctx.restore();
		}
	}

	#player(ctx: CanvasRenderingContext2D, game: Game, p: Player, alpha: number) {
		const a = lerp(p.pa, p.a, alpha);
		const h = lerp(p.ph, p.h, alpha);
		if (p.invuln > 0 && !p.dead) {
			if (game.calm) ctx.globalAlpha = 0.55;
			else if (Math.floor(p.invuln * 14) % 2 === 0) ctx.globalAlpha = 0.25;
		}
		ctx.save();
		ctx.rotate(a);
		ctx.translate(0, -R - h);

		// Soft ground shadow + body glow for readability against the dark sky.
		if (!p.dead) {
			ctx.save();
			ctx.translate(0, h);
			const k = Math.max(0.2, 1 - h / 120);
			ctx.fillStyle = `rgba(14, 15, 16, ${0.28 * k})`;
			ctx.beginPath();
			ctx.ellipse(0, 0, 9 * k, 2 * k, 0, 0, TAU);
			ctx.fill();
			ctx.restore();
		}
		this.#glow(ctx, 0, -PLAYER_H * 0.5, 30, 0.45);

		if (p.dead) {
			ctx.translate(0, -PLAYER_H * 0.5);
			ctx.rotate(p.spin);
			ctx.translate(0, PLAYER_H * 0.5);
		}
		const sy = Math.max(0.55, Math.min(1.5, p.stretch));
		ctx.scale(1 / Math.sqrt(sy), sy);
		ctx.scale(p.facing, 1);
		drawMascot(ctx, p);
		ctx.restore();
		ctx.globalAlpha = 1;
	}

	#particles(ctx: CanvasRenderingContext2D, game: Game) {
		for (const particle of game.particles) {
			const t = particle.life / particle.max;
			ctx.globalAlpha = Math.min(1, t * 1.6);
			if (particle.kind === 2) {
				ctx.strokeStyle = particle.color;
				ctx.lineWidth = 1.6 * t;
				ctx.beginPath();
				ctx.arc(particle.x, particle.y, particle.size * (1 - t * t) + 2, 0, TAU);
				ctx.stroke();
			} else if (particle.kind === 1) {
				ctx.save();
				ctx.translate(particle.x, particle.y);
				ctx.rotate(t * 3);
				sparkle(ctx, particle.size * 1.4 * (0.4 + t * 0.6), particle.size * 0.4);
				ctx.fillStyle = particle.color;
				ctx.fill();
				ctx.restore();
			} else {
				ctx.fillStyle = particle.color;
				const size = particle.size * (0.5 + t * 0.5);
				ctx.fillRect(particle.x - size / 2, particle.y - size / 2, size, size);
			}
		}
		ctx.globalAlpha = 1;
	}

	#popups(ctx: CanvasRenderingContext2D, game: Game, screenA: number) {
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		for (const popup of game.popups) {
			const { x, y } = toXY(popup.a, popup.h);
			const pop = Math.min(1, popup.t / 0.12);
			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(screenA);
			ctx.scale(pop, pop);
			ctx.globalAlpha = popup.t > 0.7 ? 1 - (popup.t - 0.7) / 0.3 : 1;
			ctx.font = `800 ${popup.big ? 13 : 9}px ${MONO}`;
			ctx.lineWidth = 3;
			ctx.strokeStyle = COLORS.ink;
			const label = `+${popup.value}`;
			ctx.strokeText(label, 0, 0);
			ctx.fillStyle = popup.big ? COLORS.butter : COLORS.cream;
			ctx.fillText(label, 0, 0);
			ctx.restore();
		}
		ctx.globalAlpha = 1;
	}

	#hud(ctx: CanvasRenderingContext2D, game: Game, view: View) {
		const { w, h } = view;
		const unit = Math.max(0.75, Math.min(1.25, Math.min(w, h) / 560));
		// Right column under GameFrame's pause/restart buttons (its score HUD owns the top left).
		const right = w - 18;
		const top = 66;

		// Lives: three moons (filled = left).
		const gap = 15 * unit;
		for (let index = 0; index < LIVES; index++) {
			const x = right - 5 * unit - (LIVES - 1 - index) * gap;
			ctx.beginPath();
			ctx.arc(x, top, 5 * unit, 0, TAU);
			ctx.fillStyle = index < game.lives ? COLORS.butter : 'rgba(14, 15, 16, 0.8)';
			ctx.fill();
			ctx.lineWidth = 1.5;
			ctx.strokeStyle = index < game.lives ? COLORS.ink : 'rgba(251, 243, 221, 0.4)';
			ctx.stroke();
		}

		// Round timer: bar + seconds.
		const remaining = Math.max(0, game.roundTime - game.elapsed);
		const barW = 3 * gap + 6 * unit;
		const barY = top + 12 * unit;
		const k = remaining / game.roundTime;
		const urgent = remaining < 10 && game.over === 'none' && game.started;
		const left = right - barW;
		ctx.fillStyle = 'rgba(251, 243, 221, 0.14)';
		roundRect(ctx, left, barY, barW, 4 * unit, 2 * unit);
		ctx.fill();
		ctx.fillStyle = urgent && !game.calm && Math.floor(game.time * 4) % 2 === 0 ? COLORS.cream : COLORS.butter;
		roundRect(ctx, left, barY, Math.max(0, barW * k), 4 * unit, 2 * unit);
		ctx.fill();
		ctx.font = `600 ${11 * unit}px ${MONO}`;
		ctx.textAlign = 'right';
		ctx.textBaseline = 'top';
		ctx.fillStyle = urgent ? COLORS.butter : 'rgba(251, 243, 221, 0.7)';
		ctx.fillText(String(Math.ceil(remaining)).padStart(2, '0'), right, barY + 9 * unit);

		if (!game.started && game.over === 'none' && !view.coarse) this.#keyHint(ctx, view, unit, game.calm ? 0 : game.time);
		if (game.over !== 'none') this.#gameOver(ctx, game, view, unit);
	}

	#keyHint(ctx: CanvasRenderingContext2D, view: View, unit: number, time: number) {
		const { w, h } = view;
		const bob = hintBob(time);
		const y = h - 46 * unit + bob;
		const size = 26 * unit;
		const gap = 6 * unit;
		const space = 92 * unit;
		const total = size * 2 + gap + 22 * unit + space;
		let x = w / 2 - total / 2;
		ctx.globalAlpha = 0.85;
		for (const dir of [-1, 1]) {
			keycap(ctx, x, y, size, size, unit);
			ctx.beginPath();
			ctx.moveTo(x + size / 2 - dir * 4 * unit, y + size / 2 - 5 * unit);
			ctx.lineTo(x + size / 2 + dir * 3 * unit, y + size / 2);
			ctx.lineTo(x + size / 2 - dir * 4 * unit, y + size / 2 + 5 * unit);
			ctx.strokeStyle = COLORS.night;
			ctx.lineWidth = 2.2 * unit;
			ctx.stroke();
			x += size + gap;
		}
		x += 22 * unit - gap;
		keycap(ctx, x, y, space, size, unit);
		// Up chevron on the space bar = jump.
		ctx.beginPath();
		ctx.moveTo(x + space / 2 - 6 * unit, y + size / 2 + 3 * unit);
		ctx.lineTo(x + space / 2, y + size / 2 - 3.5 * unit);
		ctx.lineTo(x + space / 2 + 6 * unit, y + size / 2 + 3 * unit);
		ctx.strokeStyle = COLORS.night;
		ctx.lineWidth = 2.2 * unit;
		ctx.stroke();
		ctx.globalAlpha = 1;
	}

	#gameOver(ctx: CanvasRenderingContext2D, game: Game, view: View, unit: number) {
		const { w, h } = view;
		const delay = game.over === 'dead' ? 0.8 : 0.9;
		const t = Math.max(0, Math.min(1, (game.overT - delay) / 0.35));
		if (t <= 0) return;
		ctx.fillStyle = `rgba(14, 15, 16, ${0.6 * t})`;
		ctx.fillRect(0, 0, w, h);
		const ease = 1 - (1 - t) ** 3;
		const best = game.score > view.best && game.score > 0;
		const cy = h * 0.44 + (1 - ease) * 20;
		ctx.globalAlpha = t;

		if (best) {
			// New best: a big slow sparkle behind the score.
			ctx.save();
			ctx.translate(w / 2, cy);
			ctx.rotate(game.calm ? 0 : game.time * 0.4);
			sparkle(ctx, Math.min(w, h) * 0.24, Math.min(w, h) * 0.05);
			ctx.fillStyle = 'rgba(252, 215, 114, 0.22)';
			ctx.fill();
			ctx.restore();
		}

		ctx.font = `800 ${Math.round(Math.min(w, h) * 0.13)}px ${MONO}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = best ? COLORS.butter : COLORS.cream;
		ctx.fillText(String(game.score), w / 2, cy);

		// Restart glyph (jump to restart).
		const ry = cy + Math.min(w, h) * 0.16;
		const pulse = game.calm ? 1 : 1 + Math.sin(game.time * 5) * 0.06;
		const rr = 20 * unit * pulse;
		ctx.beginPath();
		ctx.arc(w / 2, ry, rr, 0, TAU);
		ctx.fillStyle = COLORS.butter;
		ctx.fill();
		ctx.beginPath();
		ctx.arc(w / 2, ry, rr * 0.48, -Math.PI * 0.6, Math.PI * 1.15);
		ctx.strokeStyle = COLORS.night;
		ctx.lineWidth = 2.6 * unit;
		ctx.stroke();
		const tip = { x: w / 2 + Math.cos(-Math.PI * 0.6) * rr * 0.48, y: ry + Math.sin(-Math.PI * 0.6) * rr * 0.48 };
		ctx.beginPath();
		ctx.moveTo(tip.x - 5 * unit, tip.y - 3 * unit);
		ctx.lineTo(tip.x + 1 * unit, tip.y);
		ctx.lineTo(tip.x - 3 * unit, tip.y + 5 * unit);
		ctx.stroke();
		ctx.globalAlpha = 1;
	}
}

const hintBob = (time: number) => Math.sin(time * 3) * 2;

function sparkle(ctx: CanvasRenderingContext2D, outer: number, inner: number) {
	ctx.beginPath();
	for (let index = 0; index < 8; index++) {
		const r = index % 2 === 0 ? outer : inner;
		const angle = (index * Math.PI) / 4;
		const x = Math.sin(angle) * r;
		const y = -Math.cos(angle) * r;
		if (index === 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
	}
	ctx.closePath();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
	ctx.beginPath();
	ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
}

function keycap(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, unit: number) {
	roundRect(ctx, x, y + 3 * unit, w, h, 6 * unit);
	ctx.fillStyle = COLORS.ochre;
	ctx.fill();
	roundRect(ctx, x, y, w, h, 6 * unit);
	ctx.fillStyle = COLORS.cream;
	ctx.fill();
	ctx.lineWidth = 1.5;
	ctx.strokeStyle = COLORS.ink;
	ctx.stroke();
}

/** Placeholder chibi mascot, facing +x, feet at the origin, about PLAYER_H tall. */
function drawMascot(ctx: CanvasRenderingContext2D, p: Player) {
	const air = !p.grounded;
	const run = Math.min(1, Math.abs(p.vt) / 90);
	const swing = Math.sin(p.runPhase) * run;
	const lift = Math.max(0, Math.cos(p.runPhase)) * run;

	let front: [number, number];
	let back: [number, number];
	let handF: [number, number];
	let handB: [number, number];
	if (p.dead) {
		front = [4, -3];
		back = [-4, -2];
		handF = [6, -21];
		handB = [-6, -21];
	} else if (air && p.vr > 0) {
		front = [3.5, -6];
		back = [-2.5, -3.5];
		handF = [4.5, -21];
		handB = [-5, -19];
	} else if (air) {
		front = [3, -2];
		back = [-2.5, -1];
		handF = [6.5, -17];
		handB = [-6.5, -16.5];
	} else {
		front = [swing * 4.2, -1.8 - lift * 2.4];
		back = [-swing * 4.2, -1.8 - Math.max(0, -Math.cos(p.runPhase)) * run * 2.4];
		handF = [-swing * 3.4 + 1, -11.5];
		handB = [swing * 3.4 - 1, -11.5];
	}

	const limb = (from: [number, number], to: [number, number], color: string, width: number) => {
		ctx.beginPath();
		ctx.moveTo(from[0], from[1]);
		ctx.lineTo(to[0], to[1]);
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = width + LW * 1.6;
		ctx.stroke();
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.stroke();
	};
	const shoe = (at: [number, number]) => {
		ctx.beginPath();
		ctx.ellipse(at[0] + 1, at[1] - 0.2, 3.4, 2, 0, 0, TAU);
		ctx.fillStyle = COLORS.cream;
		ctx.fill();
		ctx.lineWidth = LW;
		ctx.strokeStyle = COLORS.ink;
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(at[0] - 2, at[1] + 1.2);
		ctx.lineTo(at[0] + 4, at[1] + 1.2);
		ctx.strokeStyle = 'rgba(226, 169, 59, 0.9)';
		ctx.lineWidth = 0.7;
		ctx.stroke();
	};

	// Back limbs.
	limb([-1.4, -9.5], back, PANTS, 3.2);
	shoe(back);
	limb([-2.6, -15.5], handB, SKIN, 2.2);

	// Torso (black tee).
	ctx.beginPath();
	ctx.roundRect(-4.8, -18.2, 9.6, 10, [3.4, 3.4, 2, 2]);
	ctx.fillStyle = TEE;
	ctx.fill();
	ctx.lineWidth = LW;
	ctx.strokeStyle = COLORS.ink;
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(-4, -16);
	ctx.quadraticCurveTo(-4.4, -12, -3.6, -9.6);
	ctx.strokeStyle = 'rgba(252, 215, 114, 0.35)';
	ctx.lineWidth = 0.8;
	ctx.stroke();

	// Front limbs.
	limb([1.4, -9.5], front, PANTS, 3.2);
	shoe(front);
	limb([2.4, -15.5], handF, SKIN, 2.2);
	ctx.beginPath();
	ctx.arc(2.4, -15.8, 2.2, 0, TAU);
	ctx.fillStyle = TEE;
	ctx.fill();

	// Head.
	const hx = 0.6;
	const hy = -24.6;
	ctx.beginPath();
	ctx.arc(hx, hy, 7.2, 0, TAU);
	ctx.fillStyle = SKIN;
	ctx.fill();
	ctx.lineWidth = LW;
	ctx.strokeStyle = COLORS.ink;
	ctx.stroke();

	// Hair: dark cap with a spiky fringe toward the face.
	ctx.beginPath();
	ctx.moveTo(hx - 7.6, hy + 1.5);
	ctx.arc(hx, hy, 7.9, Math.PI * 0.94, Math.PI * 1.98);
	ctx.lineTo(hx + 8.6, hy - 1.6);
	ctx.lineTo(hx + 5.8, hy - 2.4);
	ctx.lineTo(hx + 5.2, hy - 0.6);
	ctx.lineTo(hx + 3.4, hy - 2.8);
	ctx.lineTo(hx + 1.4, hy - 1.6);
	ctx.lineTo(hx - 0.4, hy - 3.2);
	ctx.lineTo(hx - 2.6, hy - 1.2);
	ctx.lineTo(hx - 3.6, hy + 2.4);
	ctx.lineTo(hx - 5.6, hy + 0.6);
	ctx.closePath();
	ctx.fillStyle = HAIR;
	ctx.fill();
	ctx.stroke();
	// Crown tufts.
	ctx.beginPath();
	ctx.moveTo(hx - 3, hy - 7.4);
	ctx.lineTo(hx - 4.2, hy - 10.2);
	ctx.lineTo(hx - 0.6, hy - 7.9);
	ctx.lineTo(hx + 1.2, hy - 10.4);
	ctx.lineTo(hx + 2.6, hy - 7.6);
	ctx.closePath();
	ctx.fillStyle = HAIR;
	ctx.fill();
	ctx.stroke();

	// Ear, eye, cheek, mouth.
	ctx.beginPath();
	ctx.arc(hx - 1.6, hy + 0.8, 1.5, 0, TAU);
	ctx.fillStyle = SKIN;
	ctx.fill();
	ctx.lineWidth = LW * 0.7;
	ctx.stroke();
	if (p.dead) {
		ctx.beginPath();
		ctx.moveTo(hx + 2.8, hy - 0.4);
		ctx.lineTo(hx + 5, hy + 1.6);
		ctx.moveTo(hx + 5, hy - 0.4);
		ctx.lineTo(hx + 2.8, hy + 1.6);
		ctx.stroke();
	} else {
		ctx.beginPath();
		ctx.ellipse(hx + 4, hy + 0.6, 0.95, 1.5, 0, 0, TAU);
		ctx.fillStyle = COLORS.ink;
		ctx.fill();
	}
	ctx.beginPath();
	ctx.arc(hx + 3.6, hy + 3.4, 1.2, 0, TAU);
	ctx.fillStyle = 'rgba(226, 169, 59, 0.45)';
	ctx.fill();
	ctx.beginPath();
	ctx.arc(hx + 5.4, hy + 3.4, 1.1, 0.2 * Math.PI, 0.8 * Math.PI);
	ctx.lineWidth = LW * 0.6;
	ctx.strokeStyle = COLORS.ink;
	ctx.stroke();
	// Stubble hint.
	ctx.beginPath();
	ctx.arc(hx + 3.4, hy + 3.2, 3.6, 0.05 * Math.PI, 0.55 * Math.PI);
	ctx.strokeStyle = 'rgba(43, 36, 32, 0.25)';
	ctx.lineWidth = 1.2;
	ctx.stroke();
}
