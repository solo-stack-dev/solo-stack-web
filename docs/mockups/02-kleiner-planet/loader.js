document.querySelector('#start-game').addEventListener(
	'click',
	function () {
		this.disabled = true;
		const s = document.createElement('script');
		s.src = 'game.js';
		s.onload = () => window.startPlanet();
		s.onerror = () => {
			this.disabled = false;
			toast('Das Spiel konnte nicht geladen werden. Bitte erneut versuchen.');
		};
		document.body.append(s);
	},
	{ once: false }
);
