'use strict';
const sky = document.querySelector('#sky'),
	toggle = document.querySelector('#theme-toggle'),
	slider = document.querySelector('#time-slider'),
	clock = document.querySelector('#clock-label'),
	mode = document.querySelector('#sky-mode');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let manual = false,
	simulated = false,
	timer = null,
	night = null,
	transitioning = false;
function localHour() {
	const d = new Date();
	return d.getHours() + d.getMinutes() / 60;
}
function paint(next, reveal = false) {
	if (next === night) return;
	night = next;
	const change = () => {
		sky.classList.toggle('sky-night', next);
		toggle.setAttribute('aria-pressed', String(next));
	};
	if (reveal && document.startViewTransition && !reduced.matches && !transitioning) {
		transitioning = true;
		const r = toggle.getBoundingClientRect(),
			x = r.x + r.width / 2,
			y = r.y + r.height / 2;
		const vt = document.startViewTransition(change);
		vt.ready
			.then(() =>
				document.documentElement.animate(
					{ clipPath: ['circle(0 at ' + x + 'px ' + y + 'px)', 'circle(' + Math.hypot(innerWidth, innerHeight) + 'px at ' + x + 'px ' + y + 'px)'] },
					{ duration: 720, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
				)
			)
			.catch(() => {})
			.finally(() => {
				transitioning = false;
			});
	} else change();
}
function update(h) {
	slider.value = h;
	clock.textContent = String(Math.floor(h)).padStart(2, '0') + ':' + String(Math.floor((h % 1) * 60)).padStart(2, '0');
	if (!manual) paint(h < 7 || h >= 19);
}
function stop() {
	clearInterval(timer);
	timer = null;
	document.querySelector('#time-play').textContent = 'Zeitraffer ▶';
}
toggle.addEventListener('click', () => {
	stop();
	manual = true;
	paint(!night, true);
	mode.textContent = 'Manuell · bleibt bis Echtzeit';
});
slider.addEventListener('input', () => {
	stop();
	manual = false;
	simulated = true;
	update(+slider.value);
	mode.textContent = 'Simulierte Ortszeit';
});
document.querySelector('#time-play').addEventListener('click', () => {
	if (timer) {
		stop();
		return;
	}
	manual = false;
	simulated = true;
	mode.textContent = 'Zeitraffer';
	document.querySelector('#time-play').textContent = 'Pause Ⅱ';
	timer = setInterval(() => update((+slider.value + 0.25) % 24), 160);
});
document.querySelector('#time-auto').addEventListener('click', () => {
	stop();
	manual = false;
	simulated = false;
	mode.textContent = 'Automatisch · lokale Zeit';
	update(localHour());
});
document.addEventListener('visibilitychange', () => {
	if (document.hidden) stop();
	else if (!manual && !simulated) update(localHour());
});
setInterval(() => {
	if (!manual && !simulated && !document.hidden) update(localHour());
}, 60000);
update(localHour());
if (!CSS.supports('animation-timeline', 'view()'))
	new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('in-view', e.isIntersecting)), { threshold: 0.1 }).observe(
		document.querySelector('.night-videos')
	);
