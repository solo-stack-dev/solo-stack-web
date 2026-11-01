'use strict';
const navButton = document.querySelector('.nav-toggle');
navButton?.addEventListener('click', () => {
	const n = document.querySelector('.nav-links');
	const open = n.classList.toggle('open');
	navButton.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('[data-demo]').forEach((el) => el.addEventListener('click', () => toast(el.dataset.demo)));
let toastTimer;
function toast(text) {
	let n = document.querySelector('.notice');
	if (!n) {
		n = document.createElement('div');
		n.className = 'notice';
		n.setAttribute('role', 'status');
		document.body.append(n);
	}
	n.textContent = text;
	n.hidden = false;
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => (n.hidden = true), 4500);
}
