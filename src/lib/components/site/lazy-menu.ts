/**
 * 44px navbar icon button, shared by the lazy placeholders, the real bits-ui triggers and the phone menu. No pill: like the
 * homepage nav, only the ink changes (to the current-page mark colour) on hover and while open. Keyboard focus: the shell's
 * swash under the glyph (`swash-focus`, layout.css).
 */
export const MENU_TRIGGER =
	'swash-focus inline-grid size-11 place-items-center rounded-full text-foreground transition-colors hover:text-(--ink-lit) data-open:text-(--ink-lit) aria-expanded:text-(--ink-lit)';
