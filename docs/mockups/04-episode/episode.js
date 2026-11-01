'use strict';
const opening = document.querySelector('#opening'),
	skip = document.querySelector('#skip-opening'),
	replay = document.querySelector('#replay-opening'),
	motion = matchMedia('(prefers-reduced-motion:reduce)');
let introTimer;
function finish() {
	opening.hidden = true;
	opening.setAttribute('aria-hidden', 'true');
	skip.tabIndex = -1;
	clearTimeout(introTimer);
	if (document.activeElement === skip) replay.focus();
}
function play() {
	clearTimeout(introTimer);
	if (motion.matches) {
		toast('Opening: statisch bei reduzierter Bewegung.');
		return;
	}
	opening.hidden = false;
	opening.setAttribute('aria-hidden', 'false');
	skip.tabIndex = 0;
	opening.style.animation = 'none';
	void opening.offsetWidth;
	opening.style.animation = '';
	introTimer = setTimeout(finish, 1700);
}
skip.addEventListener('click', finish);
replay.addEventListener('click', play);
document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') finish();
});
if (motion.matches) finish();
else play();
