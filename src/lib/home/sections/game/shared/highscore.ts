/** Local high score per game (`localStorage`). No accounts, no network. Storage errors (private mode, quota) are ignored. */
const storageKey = (gameId: string) => `solostack:game:${gameId}:highscore`;

export function loadHighScore(gameId: string): number {
	try {
		const value = Number(localStorage.getItem(storageKey(gameId)));
		return Number.isFinite(value) && value > 0 ? value : 0;
	} catch {
		return 0;
	}
}

/** Store `score` if it beats the stored one. Returns the (new) high score. */
export function saveHighScore(gameId: string, score: number): number {
	const best = Math.max(loadHighScore(gameId), Math.floor(score));
	try {
		localStorage.setItem(storageKey(gameId), String(best));
	} catch {
		// ignore
	}
	return best;
}

export function clearHighScore(gameId: string): void {
	try {
		localStorage.removeItem(storageKey(gameId));
	} catch {
		// ignore
	}
}
