import type { Commit } from '#lib/home/data/github.ts';

export interface TerminalLine {
	kind: 'command' | 'commit' | 'note';
	/** Short hash for commit lines (rendered in butter). */
	hash?: string;
	/** Full line text without the `$ ` prompt. */
	text: string;
}

/** The command typed on the monitor. A shell command, not copy. */
export const COMMAND = 'git log --oneline';
/** Longest line typed (the monitor box is ~40 columns; the rest would be clipped anyway). */
const MAX_COLUMNS = 40;
/** How long a finished page stays on screen before it clears. */
const HOLD_MS = 4200;

function seeded(seed: number) {
	return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

function clip(text: string): string {
	return text.length > MAX_COLUMNS ? `${text.slice(0, MAX_COLUMNS - 1)}…` : text;
}

/**
 * Typing state of the night shift monitor: `git log --oneline` over the real commits, page by page, char by char, in
 * a loop. Drive it with `tick(dt)` from a RafLoop; read `typed` (chars revealed on the current page) and `frame`
 * (mascot hand frame 1…3: 1 rests, 2 and 3 alternate while characters appear).
 */
export class Terminal {
	readonly pages: TerminalLine[][];
	page = $state(0);
	typed = $state(0);
	frame = $state(1);

	#delays: number[][];
	#acc = 0;
	#hold = 0;
	#sinceFrame = 0;
	#sinceKey = 0;

	constructor(commits: Commit[], emptyText: string, perPage: number) {
		const command: TerminalLine = { kind: 'command', text: COMMAND };
		const pages: TerminalLine[][] = [];
		for (let i = 0; i < commits.length; i += perPage) {
			pages.push([command, ...commits.slice(i, i + perPage).map((c): TerminalLine => ({ kind: 'commit', hash: c.hash, text: clip(`${c.hash} ${c.message}`) }))]);
		}
		if (!pages.length) pages.push([command, { kind: 'note', text: emptyText }]);
		this.pages = pages;

		const random = seeded(1729);
		this.#delays = pages.map((lines) =>
			lines.flatMap((line, index) =>
				[...line.text].map((_, char) => {
					const human = line.kind === 'command';
					let delay = human ? 55 + random() * 70 : 9 + random() * 12;
					// a beat before each line: thinking before the command, enter + output for the rest
					if (char === 0) delay += index === 0 ? 500 : index === 1 ? 420 : 70;
					return delay;
				})
			)
		);
		this.typed = this.total;
	}

	get lines(): TerminalLine[] {
		return this.pages[this.page]!;
	}

	get total(): number {
		return this.#delays[this.page]!.length;
	}

	get done(): boolean {
		return this.typed >= this.total;
	}

	/** Start the current page from an empty screen (call once when motion is allowed). */
	reset() {
		this.page = 0;
		this.typed = 0;
		this.frame = 1;
		this.#acc = 0;
		this.#hold = 0;
	}

	/** Static state: first page fully typed, hands resting. */
	finish() {
		this.page = 0;
		this.typed = this.total;
		this.frame = 1;
	}

	tick(dt: number) {
		const ms = dt * 1000;
		this.#sinceFrame += ms;
		this.#sinceKey += ms;

		if (this.done) {
			this.#hold += ms;
			if (this.frame !== 1 && this.#sinceKey > 160) this.frame = 1;
			if (this.#hold >= HOLD_MS) {
				this.#hold = 0;
				this.#acc = 0;
				this.page = (this.page + 1) % this.pages.length;
				this.typed = 0;
			}
			return;
		}

		const delays = this.#delays[this.page]!;
		this.#acc += ms;
		let typed = this.typed;
		while (typed < delays.length && this.#acc >= delays[typed]!) {
			this.#acc -= delays[typed]!;
			typed++;
		}
		if (typed !== this.typed) {
			this.typed = typed;
			this.#sinceKey = 0;
			if (this.#sinceFrame > 85) {
				this.frame = this.frame === 2 ? 3 : 2;
				this.#sinceFrame = 0;
			}
		} else if (this.frame !== 1 && this.#sinceKey > 160) {
			this.frame = 1;
		}
	}

	/** Visible part of each line on the current page: `null` for lines not started yet (the command line always shows). */
	visible(): (string | null)[] {
		let left = this.typed;
		return this.lines.map((line, index) => {
			if (index > 0 && left <= 0) return null;
			const shown = line.text.slice(0, Math.max(0, left));
			left -= line.text.length;
			return shown;
		});
	}
}
