/**
 * Moon phases and the lit-region geometry shared by the 3D moon (light direction), the 2D fallback (shadow
 * overlay), and the wordmark split (clip of the anthracite copy). One source, so all three always agree.
 *
 * Model: a unit sphere seen orthographically, light direction in view space `L = (-sin φ, 0, cos φ)`.
 * φ = 0 full (light from the viewer), 90° half lit from the left (waning, as in the mockup), 180° new.
 * 180° → 360° sweeps through the waxing side (lit from the right) back to full.
 * The terminator projects to the half ellipse `x = cos φ · √(1 − y²)`, so the lit region is exact in 2D.
 */

export const MOON_PHASES = ['full', 'waning-gibbous', 'half', 'crescent', 'new'] as const;
export type MoonPhase = (typeof MOON_PHASES)[number];

/** Phase angle in degrees per phase (waning side). */
export const PHASE_ANGLE: Record<MoonPhase, number> = {
	full: 0,
	'waning-gibbous': 50,
	half: 90,
	crescent: 138,
	new: 180
};

export const MOON_PHASE_EVENT = 'night:moon-phase';
export const MOON_FULL_CLICKS_EVENT = 'night:moon-full-clicks';

export interface MoonPhaseDetail {
	phase: MoonPhase;
}

export interface MoonFullClicksDetail {
	/** How often the full moon was clicked in this page session. */
	count: number;
}

export function nextPhase(phase: MoonPhase): MoonPhase {
	return MOON_PHASES[(MOON_PHASES.indexOf(phase) + 1) % MOON_PHASES.length];
}

const RAD = Math.PI / 180;

/** View-space light direction for a phase angle in degrees. */
export function lightDirection(angle: number): [number, number, number] {
	return [-Math.sin(angle * RAD), 0, Math.cos(angle * RAD)];
}

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * SVG path of the lit region for a circle of radius `r` centred at (`cx`, `cy`), or `null` when nothing is lit.
 * Fully lit returns a full circle. Coordinates in the caller's units (px for `clip-path: path()`, units for SVG).
 */
export function litPath(angle: number, r: number, cx = r, cy = r): string | null {
	const a = ((angle % 360) + 360) % 360;
	const cos = Math.cos(a * RAD);
	const sin = Math.sin(a * RAD);
	if (cos > 0.9999) return circlePath(r, cx, cy);
	if (cos < -0.9999) return null;
	// Waning (sin ≥ 0): lit limb on the left; waxing: mirrored to the right.
	const left = sin >= 0;
	const top = `${round(cx)} ${round(cy - r)}`;
	const bottom = `${round(cx)} ${round(cy + r)}`;
	// Limb half circle from the top to the bottom, through the lit side.
	const limb = `A ${round(r)} ${round(r)} 0 0 ${left ? 0 : 1} ${bottom}`;
	// Terminator half ellipse back to the top. It bulges away from the lit limb when cos > 0 (gibbous).
	const rx = Math.abs(cos) * r;
	const bulgesAway = cos > 0;
	const sweep = left === bulgesAway ? 0 : 1;
	const terminator = rx < 0.01 ? `L ${top}` : `A ${round(rx)} ${round(r)} 0 0 ${sweep} ${top}`;
	return `M ${top} ${limb} ${terminator} Z`;
}

export function circlePath(r: number, cx = r, cy = r): string {
	return `M ${round(cx - r)} ${round(cy)} a ${round(r)} ${round(r)} 0 1 0 ${round(2 * r)} 0 a ${round(r)} ${round(r)} 0 1 0 ${round(-2 * r)} 0 Z`;
}

/** Shortest forward animation target: phases only ever move forward (… new → waxing → full). */
export function forwardAngle(from: number, to: number): number {
	let target = to;
	while (target < from) target += 360;
	return target;
}
