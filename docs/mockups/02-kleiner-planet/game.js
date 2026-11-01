/* Original radial-gravity toy. No engine, sprites, dependencies or network. */
'use strict';
window.startPlanet = function () {
	const canvas = document.querySelector('#planet-canvas'),
		ctx = canvas.getContext('2d'),
		shell = document.querySelector('#game-shell');
	document.querySelector('#planet-poster').hidden = true;
	canvas.hidden = false;
	canvas.focus({ preventScroll: true });
	const buttons = [...document.querySelectorAll('[data-key]')];
	buttons.forEach((b) => (b.disabled = false));
	const pause = document.querySelector('#pause-game');
	pause.disabled = false;
	const reduced = matchMedia('(prefers-reduced-motion: reduce)');
	const keys = { left: false, right: false, jump: false };
	let angle = -Math.PI / 2,
		alt = 0,
		velocity = 0,
		stars = 0,
		features = 0,
		last = 0,
		raf = 0,
		visible = true,
		paused = false,
		jumpHeld = false,
		invulnerable = 0;
	let bugs = [
		{ a: -0.7, alive: true },
		{ a: 1.5, alive: true },
		{ a: 3.2, alive: true }
	];
	let pickups = [-0.5, 0.7, 2, 3.1, 4.4].map((a) => ({ a, alive: true }));
	const radius = 115,
		cx = 450,
		cy = 250;
	function wrap(a) {
		return Math.atan2(Math.sin(a), Math.cos(a));
	}
	function clear() {
		keys.left = keys.right = keys.jump = false;
		jumpHeld = false;
	}
	function shouldRun() {
		return visible && !paused && !document.hidden;
	}
	function schedule() {
		if (!raf && shouldRun()) {
			last = 0;
			raf = requestAnimationFrame(frame);
		}
	}
	function stop() {
		cancelAnimationFrame(raf);
		raf = 0;
		last = 0;
		clear();
	}
	function setScore() {
		document.querySelector('#score').textContent = stars + ' ★ · ' + features + ' FEATURES';
	}
	function resetWorld() {
		bugs = bugs.map((b, i) => ({ a: i * 2 + 0.4, alive: true }));
		pickups = pickups.map((p, i) => ({ a: i * 1.25, alive: true }));
	}
	function update(dt) {
		const move = Number(keys.right) - Number(keys.left);
		angle += move * 1.7 * dt;
		if (keys.jump && !jumpHeld && alt <= 0.01) {
			velocity = 245;
		}
		jumpHeld = keys.jump;
		velocity -= 480 * dt;
		alt += velocity * dt;
		if (alt < 0) {
			alt = 0;
			velocity = 0;
		}
		invulnerable = Math.max(0, invulnerable - dt);
		for (const b of bugs) {
			if (!b.alive) continue;
			b.a += 0.21 * dt;
			if (Math.abs(wrap(angle - b.a)) < 0.15) {
				if (alt < 25 && alt > 7 && velocity < 0) {
					b.alive = false;
					stars++;
					velocity = 180;
					setScore();
				} else if (alt < 8 && !invulnerable) {
					velocity = 165;
					invulnerable = 1.1;
					angle -= 0.15;
				}
			}
		}
		for (const p of pickups)
			if (p.alive && Math.abs(wrap(angle - p.a)) < 0.16 && alt > 28 && alt < 83) {
				p.alive = false;
				stars++;
				setScore();
			}
		if (pickups.every((p) => !p.alive) && bugs.every((b) => !b.alive)) {
			features++;
			setScore();
			resetWorld();
		}
	}
	function circle(x, y, r, color) {
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();
	}
	function star(x, y, size) {
		ctx.fillStyle = '#f4d875';
		ctx.beginPath();
		for (let i = 0; i < 8; i++) {
			const a = (i * Math.PI) / 4,
				r = i % 2 ? size * 0.35 : size;
			ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
		}
		ctx.closePath();
		ctx.fill();
	}
	function draw() {
		ctx.clearRect(0, 0, 900, 500);
		for (let i = 0; i < 22; i++) circle((i * 167 + 40) % 880, (i * 89 + 19) % 440, i % 3 ? 1 : 1.7, '#8a8b7e');
		ctx.strokeStyle = '#51534b';
		ctx.setLineDash([3, 8]);
		ctx.beginPath();
		ctx.arc(cx, cy, radius + 70, 0, Math.PI * 2);
		ctx.stroke();
		ctx.setLineDash([]);
		circle(cx, cy, radius, '#f4d875');
		circle(cx - 39, cy - 42, 22, '#dfbf61');
		circle(cx + 53, cy + 27, 15, '#dfbf61');
		circle(cx - 27, cy + 57, 9, '#dfbf61');
		for (const p of pickups) if (p.alive) star(cx + Math.cos(p.a) * (radius + 52), cy + Math.sin(p.a) * (radius + 52), 10);
		for (const b of bugs) {
			ctx.save();
			ctx.translate(cx + Math.cos(b.a) * (radius + 3), cy + Math.sin(b.a) * (radius + 3));
			ctx.rotate(b.a + Math.PI / 2);
			if (b.alive) {
				ctx.fillStyle = '#b3b798';
				ctx.beginPath();
				ctx.ellipse(0, -5, 12, 8, 0, 0, Math.PI * 2);
				ctx.fill();
				ctx.strokeStyle = '#b3b798';
				for (const x of [-8, 0, 8]) {
					ctx.beginPath();
					ctx.moveTo(x, -5);
					ctx.lineTo(x - 6, 3);
					ctx.stroke();
				}
				circle(-4, -8, 2, '#252729');
				circle(4, -8, 2, '#252729');
			} else {
				ctx.fillStyle = '#b3b79877';
				ctx.fillRect(-12, -1, 24, 3);
			}
			ctx.restore();
		}
		ctx.save();
		ctx.translate(cx + Math.cos(angle) * (radius + alt), cy + Math.sin(angle) * (radius + alt));
		ctx.rotate(angle + Math.PI / 2);
		ctx.globalAlpha = invulnerable ? 0.65 : 1;
		ctx.fillStyle = '#969b9d';
		ctx.fillRect(-10, -9, 7, 9);
		ctx.fillRect(3, -9, 7, 9);
		ctx.fillStyle = '#11171b';
		ctx.fillRect(-13, -31, 26, 23);
		ctx.fillStyle = '#e2b392';
		ctx.fillRect(-17, -28, 5, 15);
		ctx.fillRect(12, -28, 5, 15);
		circle(0, -42, 15, '#e2b392');
		ctx.fillStyle = '#302b28';
		ctx.beginPath();
		ctx.arc(0, -46, 15, Math.PI, Math.PI * 2);
		ctx.fill();
		ctx.fillRect(-14, -47, 28, 6);
		circle(-5, -42, 1.6, '#252729');
		circle(5, -42, 1.6, '#252729');
		ctx.strokeStyle = '#7b4c39';
		ctx.beginPath();
		ctx.arc(0, -39, 5, 0.2, Math.PI - 0.2);
		ctx.stroke();
		ctx.fillStyle = '#f4d875';
		ctx.font = '10px monospace';
		ctx.fillText('</>', -9, -17);
		ctx.restore();
		if (paused) {
			ctx.fillStyle = '#202124bb';
			ctx.fillRect(0, 0, 900, 500);
			ctx.fillStyle = '#f4d875';
			ctx.font = '24px sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText('Pause', 450, 225);
			ctx.textAlign = 'left';
		}
	}
	function frame(now) {
		raf = 0;
		if (!shouldRun()) return;
		const dt = last ? Math.min((now - last) / 1000, 0.032) : 0;
		last = now;
		update(dt);
		draw();
		raf = requestAnimationFrame(frame);
	}
	const mapping = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ' ': 'jump', ArrowUp: 'jump' };
	shell.addEventListener('keydown', (e) => {
		if (mapping[e.key] && e.target === canvas) {
			e.preventDefault();
			keys[mapping[e.key]] = true;
		}
	});
	window.addEventListener('keyup', (e) => {
		if (mapping[e.key]) keys[mapping[e.key]] = false;
	});
	for (const b of buttons) {
		b.addEventListener('pointerdown', (e) => {
			e.preventDefault();
			b.setPointerCapture(e.pointerId);
			keys[b.dataset.key] = true;
		});
		for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(event, () => (keys[b.dataset.key] = false));
	}
	pause.addEventListener('click', () => {
		paused = !paused;
		pause.textContent = paused ? 'Weiter ▶' : 'Pause Ⅱ';
		pause.setAttribute('aria-pressed', String(paused));
		if (paused) {
			stop();
			draw();
		} else schedule();
	});
	new IntersectionObserver(
		(es) => {
			visible = es[0].isIntersecting;
			if (visible) schedule();
			else stop();
		},
		{ threshold: 0.15 }
	).observe(canvas);
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) stop();
		else schedule();
	});
	window.addEventListener('blur', clear);
	canvas.addEventListener('blur', clear);
	document.querySelector('#game-help').textContent = reduced.matches
		? 'Bewegung nur im gestarteten Spiel. Pause jederzeit möglich.'
		: '← → / A D laufen · Leertaste springen · Alle Sterne + Bugs = 1 Feature';
	draw();
	schedule();
};
