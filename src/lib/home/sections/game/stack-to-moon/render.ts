/** Canvas 2D renderer for Stack to the moon. Reads the engine state, never mutates it. */
import { BLOCK_H, ROPE, blockPoint, topCenter, type Game, type Paper } from './engine.ts';
import { PAD, cloudBank, cloudPuff, hexAlpha, moonTexture, paperTexture } from './paper.ts';
import { clamp, hash2, lerp, rng, smoothstep } from './rng.ts';

const CREAM = '#fbf3dd';
const BUTTER = '#fcd772';
const OCHRE = '#e2a93b';
const INK = '#0e0f10';
const DUST = ['#fbf3dd', '#e2a93b', '#8b8172'];
const CONFETTI = ['#fbf3dd', '#fcd772', '#e2a93b', '#fdeaa6'];

export interface DrawOptions {
	calm: boolean;
	/** placed / goal, can exceed 1 */
	progress: number;
	pendulum: boolean;
}

interface Texture {
	canvas: HTMLCanvasElement;
	frame: number;
}

export class Renderer {
	readonly canvas: HTMLCanvasElement;
	readonly context: CanvasRenderingContext2D;
	cssW = 1;
	cssH = 1;
	dpr = 1;
	/** CSS px per world unit */
	scale = 60;
	#textures = new Map<string, Texture>();
	#frame = 0;
	#moon: { canvas: HTMLCanvasElement; radius: number } | null = null;
	#cloudsBack: HTMLCanvasElement | null = null;
	#cloudsFront: HTMLCanvasElement | null = null;
	#puff: HTMLCanvasElement | null = null;
	#shakeX = 0;
	#shakeY = 0;
	#camX = 0;
	#camY = 0;
	/** camera height of the start view; parallax layers line up with the world there */
	#origin = 3;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d', { alpha: false })!;
	}

	/** Size the backing store; returns the visible world size. */
	resize(cssW: number, cssH: number, dpr: number): { viewW: number; viewH: number } {
		this.cssW = Math.max(1, cssW);
		this.cssH = Math.max(1, cssH);
		this.dpr = dpr;
		this.canvas.width = Math.round(this.cssW * dpr);
		this.canvas.height = Math.round(this.cssH * dpr);
		this.scale = Math.min(this.cssH / 9, this.cssW / 10);
		this.#textures.clear();
		this.#origin = this.cssH / this.scale / 2 - 1.7;
		return { viewW: this.cssW / this.scale, viewH: this.cssH / this.scale };
	}

	#sx(x: number): number {
		return this.cssW / 2 + (x - this.#camX) * this.scale + this.#shakeX;
	}

	#sy(y: number): number {
		return this.cssH / 2 - (y - this.#camY) * this.scale + this.#shakeY;
	}

	/** CSS px position of a world point in the last drawn frame (for DOM overlays). */
	toScreen(game: Game, x: number, y: number): { x: number; y: number } {
		return { x: this.cssW / 2 + (x - game.camX) * this.scale, y: this.cssH / 2 - (y - game.camY) * this.scale };
	}

	#texture(paper: Paper): HTMLCanvasElement {
		const key = `${paper.seed}|${paper.w.toFixed(3)}|${paper.cut}|${paper.tone}|${paper.label}`;
		let texture = this.#textures.get(key);
		if (!texture) {
			texture = { canvas: paperTexture(paper, BLOCK_H, this.scale, this.dpr), frame: this.#frame };
			this.#textures.set(key, texture);
		}
		texture.frame = this.#frame;
		return texture.canvas;
	}

	/** Paper block by its world center and lean, squashed around its bottom center. */
	#paper(paper: Paper, cx: number, cy: number, lean: number, squash = 0, crop0 = 0, crop1 = 1, alpha = 1) {
		const { context, scale } = this;
		const half = BLOCK_H / 2;
		const bx = cx - Math.sin(lean) * half;
		const by = cy - Math.cos(lean) * half;
		const sx = this.#sx(bx);
		const sy = this.#sy(by);
		const h = BLOCK_H * scale;
		if (sy < -h * 3 || sy - h * 3 > this.cssH) return;
		const texture = this.#texture(paper);
		const sw = paper.w * scale;
		context.save();
		context.globalAlpha = alpha;
		context.translate(sx, sy);
		context.rotate(lean);
		if (squash) context.scale(1 + squash * 0.55, 1 - squash);
		if (crop0 === 0 && crop1 === 1) {
			context.drawImage(texture, -sw / 2 - PAD, -h - PAD, sw + PAD * 2, h + PAD * 2);
		} else {
			const cw = (crop1 - crop0) * sw;
			const dpr = this.dpr;
			context.drawImage(texture, (PAD + crop0 * sw) * dpr, 0, cw * dpr, (h + PAD * 2) * dpr, -cw / 2, -h - PAD, cw, h + PAD * 2);
		}
		context.restore();
	}

	draw(game: Game, { calm, progress, pendulum }: DrawOptions) {
		this.#frame += 1;
		const context = this.context;
		const time = game.time;
		const shake = calm ? 0 : game.trauma * game.trauma * 14;
		this.#shakeX = shake * Math.sin(time * 53.1) * Math.cos(time * 17.3);
		this.#shakeY = shake * Math.cos(time * 47.7) * Math.sin(time * 21.9);
		this.#camX = game.camX;
		this.#camY = game.camY;
		context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

		const depth = game.moonReached ? clamp((game.camY - game.moon.ay) / 18, 0, 1) : 0;
		this.#sky(progress, depth);
		this.#stars(time, calm, depth);
		this.#puffs(game);
		this.#drawMoon(game);
		this.#clouds((this.#cloudsBack ??= cloudBank(1)), 4.4, 0.8, 0.95);

		// tower
		const { blocks, poses } = game;
		for (let i = 0; i < blocks.length; i++) {
			const block = blocks[i]!;
			const pose = poses[i]!;
			this.#paper(block.paper, pose.x, pose.y, pose.lean, block.squash);
			if (block.flash > 0) this.#flash(pose.x, pose.y, pose.lean, block.w, block.flash * (calm ? 0.3 : 0.7));
		}
		this.#bridge(game);
		this.#mascot(game, calm);
		this.#creak(game, time);
		this.#activeBlock(game, pendulum);
		for (const piece of game.debris) this.#paper(piece.paper, piece.x, piece.y, piece.angle, 0, piece.crop0, piece.crop1);
		this.#particles(game, 'back');
		this.#clouds((this.#cloudsFront ??= cloudBank(2)), 2.5, 1, 1);
		this.#particles(game, 'front');
		this.#rail(game, progress);

		// evict textures not used for a while
		if (this.#frame % 120 === 0) {
			for (const [key, texture] of this.#textures) if (this.#frame - texture.frame > 240) this.#textures.delete(key);
		}
	}

	#sky(progress: number, depth: number) {
		const { context, cssW, cssH } = this;
		const warm = 1 - smoothstep(progress * 1.4);
		const top = mix('#151618', '#08080b', depth);
		const bottom = mix(mix('#18191b', '#2d2620', warm), '#0f1013', depth);
		const gradient = context.createLinearGradient(0, 0, 0, cssH);
		gradient.addColorStop(0, top);
		gradient.addColorStop(1, bottom);
		context.fillStyle = gradient;
		context.fillRect(0, 0, cssW, cssH);
	}

	#stars(time: number, calm: boolean, depth: number) {
		const { context, cssW, cssH, scale } = this;
		const tile = 200;
		const ox = -this.#camX * scale * 0.06;
		const oy = this.#camY * scale * 0.14;
		const perTile = 5 + Math.round(depth * 4);
		for (let ty = Math.floor(-oy / tile); ty * tile + oy < cssH; ty++) {
			for (let tx = Math.floor(-ox / tile); tx * tile + ox < cssW; tx++) {
				const random = rng(hash2(tx, ty));
				for (let i = 0; i < perTile; i++) {
					const x = tx * tile + ox + random() * tile;
					const y = ty * tile + oy + random() * tile;
					const size = 0.6 + random() ** 3 * 2;
					const phase = random() * 6.28;
					const twinkle = calm ? 0.8 : 0.55 + 0.45 * Math.sin(time * (0.8 + random() * 2.2) + phase);
					context.fillStyle = hexAlpha(i % 4 === 0 ? BUTTER : CREAM, twinkle * (0.35 + size * 0.25));
					context.fillRect(x - size / 2, y - size / 2, size, size);
					if (size > 2) {
						context.fillStyle = hexAlpha(BUTTER, twinkle * 0.25);
						context.fillRect(x - size * 2, y - 0.5, size * 4, 1);
						context.fillRect(x - 0.5, y - size * 2, 1, size * 4);
					}
				}
			}
		}
	}

	#drawMoon(game: Game) {
		const moon = (this.#moon ??= moonTexture());
		const r = game.moon.r * this.scale;
		const k = r / moon.radius;
		const size = moon.canvas.width * k;
		const x = this.#sx(game.moon.x);
		const y = this.#sy(game.moon.y);
		if (y - size / 2 > this.cssH || y + size / 2 < 0) return;
		this.context.drawImage(moon.canvas, x - size / 2, y - size / 2, size, size);
	}

	#puffs(game: Game) {
		const puff = (this.#puff ??= cloudPuff(3));
		const { context, scale } = this;
		const parallax = 0.9;
		const camY = this.#origin + (this.#camY - this.#origin) * parallax;
		const first = Math.max(1, Math.floor((camY - 8) / 6.5));
		const last = Math.floor((camY + 8) / 6.5);
		for (let band = first; band <= last; band++) {
			const random = rng(hash2(band, 99));
			const side = band % 2 === 0 ? -1 : 1;
			const wx = side * (3 + random() * 3);
			const wy = band * 6.5 + random() * 2;
			const w = (5 + random() * 3) * scale;
			const h = w * (puff.height / puff.width);
			const x = this.cssW / 2 + (wx - this.#camX * parallax) * scale;
			const y = this.cssH / 2 - (wy - camY) * scale;
			context.globalAlpha = game.moonReached && wy > game.moon.ay ? 0.25 : 0.5;
			context.drawImage(puff, x - w / 2, y - h / 2, w, h);
		}
		context.globalAlpha = 1;
	}

	/** A tiled cloud bank whose top edge sits at world `y`, with vertical parallax. */
	#clouds(bank: HTMLCanvasElement, y: number, parallax: number, alpha: number) {
		const { context, scale, cssW, cssH } = this;
		const unitsWide = 26;
		const w = unitsWide * scale;
		const h = w * (bank.height / bank.width);
		const camY = this.#origin + (this.#camY - this.#origin) * parallax;
		const top = cssH / 2 - (y - camY) * scale + this.#shakeY;
		if (top > cssH) return;
		const ox = cssW / 2 - (unitsWide / 2 + this.#camX * parallax) * scale + this.#shakeX;
		const start = ox - Math.ceil(ox / w) * w;
		context.globalAlpha = alpha;
		for (let x = start; x < cssW; x += w) context.drawImage(bank, x, top, w + 1, h);
		if (top + h < cssH) {
			context.fillStyle = '#2a2723';
			context.fillRect(0, top + h - 1, cssW, cssH - top - h + 1);
		}
		context.globalAlpha = 1;
	}

	#flash(cx: number, cy: number, lean: number, w: number, amount: number) {
		const { context, scale } = this;
		context.save();
		context.translate(this.#sx(cx), this.#sy(cy));
		context.rotate(lean);
		context.globalCompositeOperation = 'lighter';
		context.fillStyle = hexAlpha(BUTTER, amount * 0.6);
		context.fillRect((-w / 2) * scale, (-BLOCK_H / 2) * scale, w * scale, BLOCK_H * scale);
		context.restore();
	}

	#activeBlock(game: Game, pendulum: boolean) {
		const active = game.active;
		if (!active) return;
		const context = this.context;
		const half = BLOCK_H / 2;
		const cx = active.x + Math.sin(active.angle) * half;
		const cy = active.y + Math.cos(active.angle) * half;
		const topX = active.x + Math.sin(active.angle) * BLOCK_H;
		const topY = active.y + Math.cos(active.angle) * BLOCK_H;
		context.save();
		context.setLineDash([6, 6]);
		context.lineWidth = 1.5;
		if (!active.falling) {
			// rope / thread from the sky
			context.strokeStyle = hexAlpha(CREAM, 0.6);
			context.beginPath();
			if (pendulum) {
				const pivotX = active.centerX;
				const pivotY = active.baseY + BLOCK_H + ROPE;
				context.moveTo(this.#sx(pivotX), Math.min(-10, this.#sy(pivotY + 20)));
				context.lineTo(this.#sx(pivotX), this.#sy(pivotY));
				context.lineTo(this.#sx(topX), this.#sy(topY));
			} else {
				context.moveTo(this.#sx(topX), -10);
				context.lineTo(this.#sx(topX), this.#sy(topY));
			}
			context.stroke();
			// aim guide down to the tower top
			if (game.state === 'play') {
				const top = topCenter(game);
				const block = game.blocks[game.blocks.length - 1]!;
				const pose = game.poses[game.poses.length - 1]!;
				context.strokeStyle = hexAlpha(CREAM, 0.22);
				context.beginPath();
				context.moveTo(this.#sx(active.x), this.#sy(active.y));
				context.lineTo(this.#sx(active.x), this.#sy(top.y));
				context.stroke();
				context.setLineDash([]);
				context.strokeStyle = hexAlpha(CREAM, 0.55);
				context.lineWidth = 2;
				const bracket = 0.22;
				for (const side of [-1, 1]) {
					const corner = blockPoint(pose, (side * block.w) / 2, BLOCK_H / 2 + 0.08);
					const inner = blockPoint(pose, (side * block.w) / 2 - side * bracket, BLOCK_H / 2 + 0.08);
					const below = blockPoint(pose, (side * block.w) / 2, BLOCK_H / 2 - 0.12);
					context.beginPath();
					context.moveTo(this.#sx(inner.x), this.#sy(inner.y));
					context.lineTo(this.#sx(corner.x), this.#sy(corner.y));
					context.lineTo(this.#sx(below.x), this.#sy(below.y));
					context.stroke();
				}
			}
		}
		context.restore();
		// stretch while falling
		const stretch = active.falling ? -Math.min(0.12, -active.vy * 0.008) : 0;
		this.#paper(active.paper, cx, cy, active.angle, stretch);
	}

	#creak(game: Game, time: number) {
		if (game.state !== 'play' || game.danger < 0.5 || game.blocks.length < 3) return;
		const { context, scale } = this;
		const amount = clamp((game.danger - 0.5) * 2, 0, 1);
		const side = Math.sign(game.theta) || 1;
		const n = game.blocks.length;
		context.save();
		context.lineWidth = 2;
		context.lineCap = 'round';
		for (let i = Math.max(1, n - 3); i < n; i++) {
			const pose = game.poses[i]!;
			const block = game.blocks[i]!;
			const edge = blockPoint(pose, side * (block.w / 2 + 0.2), 0);
			const flicker = 0.6 + 0.4 * Math.sin(time * 18 + i);
			for (let arc = 1; arc <= 3; arc++) {
				context.strokeStyle = hexAlpha(arc === 1 ? BUTTER : OCHRE, amount * flicker * (1 - arc * 0.22));
				context.beginPath();
				const r = arc * 0.12 * scale;
				const start = side > 0 ? -0.7 : Math.PI - 0.7;
				context.arc(this.#sx(edge.x) - side * 0.1 * scale, this.#sy(edge.y), r, start, start + 1.4);
				context.stroke();
			}
		}
		context.restore();
	}

	#bridge(game: Game) {
		const bridge = game.bridge;
		if (!bridge) return;
		const pose = game.poses[bridge.block];
		const block = game.blocks[bridge.block];
		if (!pose || !block) return;
		const { context, scale } = this;
		const start = blockPoint(pose, block.w / 2 - 0.05, BLOCK_H / 2);
		const dx = bridge.x1 + 0.3 - start.x;
		const dy = bridge.y1 - start.y;
		const length = Math.hypot(dx, dy);
		const angle = Math.atan2(dy, dx);
		const panels = 6;
		const panel = length / panels;
		const thickness = 0.17 * scale;
		let x = start.x;
		let y = start.y;
		for (let i = 0; i < panels; i++) {
			const p = clamp(bridge.t * panels - i, 0, 1);
			if (p <= 0) break;
			// each panel unfolds from hanging down to flat
			const eased = 1 - (1 - p) ** 3 * (1 + 2.2 * p);
			const a = lerp(-Math.PI / 2, angle, clamp(eased, 0, 1.1));
			const nx = x + Math.cos(a) * panel;
			const ny = y + Math.sin(a) * panel;
			const ax = this.#sx(x);
			const ay = this.#sy(y);
			const bx = this.#sx(nx);
			const by = this.#sy(ny);
			context.beginPath();
			context.moveTo(ax, ay);
			context.lineTo(bx, by);
			context.lineTo(bx, by + thickness);
			context.lineTo(ax, ay + thickness);
			context.closePath();
			context.fillStyle = i % 2 ? '#f7d26c' : '#fbf3dd';
			context.fill();
			context.strokeStyle = hexAlpha(INK, 0.8);
			context.lineWidth = 1.3;
			context.stroke();
			x = nx;
			y = ny;
		}
	}

	#mascot(game: Game, calm: boolean) {
		const mascot = game.mascot;
		const { context, scale } = this;
		const x = this.#sx(mascot.x);
		const y = this.#sy(mascot.y);
		if (y < -200 || y > this.cssH + 200) return;
		const t = mascot.t;
		const s = (scale * 1.05) / 100;
		let pop = 1;
		let bounce = 0;
		let arms = 0; // 0 down, 1 up
		let look = 0;
		if (mascot.mode === 'ground') {
			bounce = calm ? 0 : Math.abs(Math.sin(t * 2.2)) * 2;
			look = -1;
			arms = game.started ? 0.15 : 0.5 + 0.5 * Math.sin(t * 3);
		} else if (mascot.mode === 'hop') {
			pop = smoothstep(t / 0.3);
			bounce = Math.max(0, Math.sin(Math.min(1, t / 0.6) * Math.PI)) * 30;
			arms = 1;
		} else if (mascot.mode === 'walk') {
			arms = 0.3;
		} else {
			bounce = calm ? 0 : Math.abs(Math.sin(t * 6)) * 12;
			arms = 1;
		}
		context.save();
		context.translate(x, y - bounce * s);
		context.scale(s * pop, s * pop);
		context.lineJoin = 'round';
		context.lineCap = 'round';
		const wave = Math.sin(t * (mascot.mode === 'cheer' ? 14 : 6)) * 0.35;
		const stride = mascot.mode === 'walk' ? Math.sin(t * 14) * 6 : 0;
		// legs + sneakers
		context.fillStyle = '#2a2723';
		context.fillRect(-11 + stride, -30, 9, 24);
		context.fillRect(2 - stride, -30, 9, 24);
		context.fillStyle = CREAM;
		context.strokeStyle = INK;
		context.lineWidth = 2;
		for (const [fx, flip] of [
			[-7 + stride, -1],
			[7 - stride, 1]
		] as const) {
			context.beginPath();
			context.ellipse(fx + flip * 2, -4, 9, 5, 0, 0, Math.PI * 2);
			context.fill();
			context.stroke();
		}
		// arms
		context.strokeStyle = '#f2c9a0';
		context.lineWidth = 7;
		for (const side of [-1, 1]) {
			const up = arms;
			const swing = side * (up > 0.5 ? wave : 0);
			const hx = side * lerp(20, 26, up) + swing * 10;
			const hy = lerp(-30, -92, up) + Math.abs(swing) * 6;
			context.beginPath();
			context.moveTo(side * 15, -56);
			context.quadraticCurveTo(side * 26, lerp(-44, -70, up), hx, hy);
			context.stroke();
		}
		// body: black tee with a cream rim so it reads on the night
		context.fillStyle = '#18191b';
		context.strokeStyle = hexAlpha(CREAM, 0.65);
		context.lineWidth = 2.5;
		context.beginPath();
		context.roundRect(-17, -60, 34, 33, 8);
		context.fill();
		context.stroke();
		// head
		const hy = -80;
		context.fillStyle = '#f2c9a0';
		context.strokeStyle = INK;
		context.lineWidth = 2.5;
		context.beginPath();
		context.arc(0, hy, 21, 0, Math.PI * 2);
		context.fill();
		context.stroke();
		// short dark hair
		context.fillStyle = '#231f1b';
		context.beginPath();
		context.moveTo(-21, hy - 1);
		context.quadraticCurveTo(-24, hy - 26, -4, hy - 25);
		context.lineTo(0, hy - 30);
		context.lineTo(4, hy - 25);
		context.lineTo(10, hy - 28);
		context.quadraticCurveTo(25, hy - 20, 21, hy - 2);
		context.quadraticCurveTo(10, hy - 14, -8, hy - 12);
		context.quadraticCurveTo(-16, hy - 9, -21, hy - 1);
		context.fill();
		// stubble
		context.fillStyle = 'rgba(42, 39, 35, 0.18)';
		context.beginPath();
		context.ellipse(0, hy + 12, 12, 6, 0, 0, Math.PI);
		context.fill();
		// face
		const ey = hy + 1 + look * 3;
		context.fillStyle = INK;
		context.beginPath();
		context.arc(-7, ey, 2.6, 0, Math.PI * 2);
		context.arc(7, ey, 2.6, 0, Math.PI * 2);
		context.fill();
		context.fillStyle = 'rgba(226, 120, 90, 0.35)';
		context.beginPath();
		context.arc(-12, hy + 7, 3.5, 0, Math.PI * 2);
		context.arc(12, hy + 7, 3.5, 0, Math.PI * 2);
		context.fill();
		context.strokeStyle = INK;
		context.lineWidth = 2;
		context.beginPath();
		if (mascot.mode === 'cheer' || mascot.mode === 'hop') context.arc(0, hy + 8, 5, 0.1, Math.PI - 0.1);
		else context.arc(0, hy + 7, 4, 0.3, Math.PI - 0.3);
		context.stroke();
		context.restore();
	}

	#particles(game: Game, layer: 'back' | 'front') {
		const { context, scale } = this;
		for (const p of game.particles) {
			const front = p.kind === 'confetti' || p.kind === 'star';
			if (front !== (layer === 'front')) continue;
			const k = p.life / p.max;
			const x = this.#sx(p.x);
			const y = this.#sy(p.y);
			if (y < -40 || y > this.cssH + 40) continue;
			if (p.kind === 'dust') {
				context.fillStyle = hexAlpha(DUST[p.color]!, k * 0.45);
				context.beginPath();
				context.arc(x, y, p.w * scale, 0, Math.PI * 2);
				context.fill();
			} else if (p.kind === 'ring') {
				const grow = 1 - k;
				context.save();
				context.translate(x, y);
				context.rotate(p.angle);
				context.strokeStyle = hexAlpha(BUTTER, k);
				context.lineWidth = 1 + 3 * k;
				const w = p.w * scale * (1 + grow * 0.25);
				const h = p.h * scale * (1 + grow * 0.9);
				context.strokeRect(-w / 2, -h / 2, w, h);
				context.restore();
			} else {
				context.save();
				context.translate(x, y);
				context.rotate(p.angle);
				context.globalAlpha = Math.min(1, k * 3);
				context.fillStyle = CONFETTI[p.color]!;
				if (p.kind === 'confetti') {
					const flip = Math.cos(p.angle * 1.7);
					context.scale(1, flip);
					context.fillRect((-p.w / 2) * scale, (-p.h / 2) * scale, p.w * scale, p.h * scale);
					context.strokeStyle = hexAlpha(INK, 0.5);
					context.lineWidth = 1;
					context.strokeRect((-p.w / 2) * scale, (-p.h / 2) * scale, p.w * scale, p.h * scale);
				} else {
					star(context, p.w * scale);
					context.fillStyle = BUTTER;
					context.fill();
				}
				context.restore();
			}
		}
	}

	#rail(game: Game, progress: number) {
		const { context, cssW, cssH } = this;
		const x = cssW - 20;
		const top = 72;
		const bottom = Math.max(top + 80, cssH - 110);
		const p = clamp(progress, 0, 1);
		context.save();
		context.lineCap = 'round';
		context.strokeStyle = hexAlpha(CREAM, 0.22);
		context.lineWidth = 2;
		context.setLineDash([2, 6]);
		context.beginPath();
		context.moveTo(x, bottom);
		context.lineTo(x, top);
		context.stroke();
		context.setLineDash([]);
		context.strokeStyle = BUTTER;
		context.lineWidth = 3;
		context.beginPath();
		context.moveTo(x, bottom);
		context.lineTo(x, lerp(bottom, top, p));
		context.stroke();
		for (let i = 1; i < 5; i++) {
			context.fillStyle = i / 5 <= p ? BUTTER : hexAlpha(CREAM, 0.35);
			context.beginPath();
			context.arc(x, lerp(bottom, top, i / 5), 2.5, 0, Math.PI * 2);
			context.fill();
		}
		// moon at the end
		context.fillStyle = game.moonReached ? BUTTER : hexAlpha(BUTTER, 0.55);
		context.shadowColor = hexAlpha(BUTTER, 0.7);
		context.shadowBlur = game.moonReached ? 14 : 6;
		context.beginPath();
		context.arc(x, top - 10, 7, 0, Math.PI * 2);
		context.fill();
		context.shadowBlur = 0;
		if (game.moonReached) {
			context.strokeStyle = INK;
			context.lineWidth = 2;
			context.beginPath();
			context.moveTo(x - 3.5, top - 10);
			context.lineTo(x - 1, top - 7.5);
			context.lineTo(x + 3.5, top - 12.5);
			context.stroke();
		}
		// marker: a tiny paper block
		const my = lerp(bottom, top, p);
		context.fillStyle = CREAM;
		context.strokeStyle = INK;
		context.lineWidth = 1.5;
		context.fillRect(x - 7, my - 4, 14, 8);
		context.strokeRect(x - 7, my - 4, 14, 8);
		context.restore();
	}
}

function star(context: CanvasRenderingContext2D, r: number) {
	context.beginPath();
	for (let i = 0; i < 10; i++) {
		const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
		const radius = i % 2 ? r * 0.45 : r;
		context.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
	}
	context.closePath();
}

function mix(a: string, b: string, t: number): string {
	const x = Number.parseInt(a.slice(1), 16);
	const y = Number.parseInt(b.slice(1), 16);
	const channel = (shift: number) => Math.round(lerp((x >> shift) & 255, (y >> shift) & 255, clamp(t, 0, 1)));
	return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}
