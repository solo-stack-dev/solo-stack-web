/**
 * 44px navbar icon button, shared by the lazy placeholders, the real bits-ui triggers and the phone menu. No pill: like the
 * homepage nav, only the ink changes (to the current-page mark colour) on hover and while open.
 */
export const MENU_TRIGGER =
	'inline-grid size-11 place-items-center rounded-full text-foreground transition-colors hover:text-(--ink-lit) data-open:text-(--ink-lit) aria-expanded:text-(--ink-lit)';
