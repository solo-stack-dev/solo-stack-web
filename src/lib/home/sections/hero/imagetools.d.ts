// enhanced-img imports with explicit imagetools directives put `enhanced` last, e.g.
// `./assets/hero-sky.webp?w=1672;1280&quality=42&enhanced`, so they match this pattern (the stock `*?enhanced` only
// covers a bare `?enhanced`).
declare module '*&enhanced' {
	const value: import('@sveltejs/enhanced-img').Picture;
	export default value;
}
