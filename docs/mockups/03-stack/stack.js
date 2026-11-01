'use strict';
const pile = document.querySelector('#card-pile'),
	fan = document.querySelector('#fan-button');
fan.addEventListener('click', () => {
	const expanded = pile.classList.toggle('fanned');
	fan.setAttribute('aria-expanded', String(expanded));
	fan.textContent = expanded ? 'Karten stapeln ↙' : 'Karten auffächern ↔';
});
let stack = [],
	toyReady = false;
const tower = document.querySelector('#tower'),
	status = document.querySelector('#stack-status');
function renderStack() {
	tower.replaceChildren();
	stack.forEach((tool, i) => {
		const b = document.createElement('div');
		b.className = 'tower-block';
		b.style.setProperty('--tilt', ((i % 3) - 1) * 1.4 + 'deg');
		b.textContent = tool;
		tower.append(b);
	});
	status.textContent = stack.length ? stack.length + ' / 6 Bausteine. Dein Stack, deine Entscheidung.' : 'Bis zu sechs Bausteine. Ohne richtige Antwort.';
	document.querySelector('#undo-stack').disabled = !stack.length;
}
document.querySelectorAll('[data-tool]').forEach((b) =>
	b.addEventListener('click', () => {
		toyReady = true;
		if (stack.length >= 6) {
			status.textContent = 'Sechs Schichten reichen. Entferne eine für etwas Neues.';
			return;
		}
		stack.push(b.dataset.tool);
		renderStack();
	})
);
document.querySelector('#undo-stack').addEventListener('click', () => {
	stack.pop();
	renderStack();
});
document.querySelector('#reset-stack').addEventListener('click', () => {
	stack = [];
	renderStack();
});
document.querySelector('#share-stack').addEventListener('click', async () => {
	if (!stack.length) {
		toast('Erst ein paar Bausteine wählen.');
		return;
	}
	const text = 'Mein Solo Stack: ' + stack.join(' → ');
	try {
		await navigator.clipboard.writeText(text);
		toast('Dein Stack wurde kopiert.');
	} catch {
		const box = document.createElement('textarea');
		box.value = text;
		box.setAttribute('aria-label', 'Stack zum Kopieren');
		box.style.cssText = 'width:100%;margin-top:20px;padding:12px';
		document.querySelector('.tower-actions').after(box);
		box.focus();
		box.select();
		toast('Text auswählen und kopieren.');
	}
});
renderStack();
