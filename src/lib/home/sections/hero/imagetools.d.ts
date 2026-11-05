// Types enhanced-img imports with directives, which put `enhanced` last (`hero-sky.webp?w=1672;1280&quality=42&enhanced`);
// the stock `*?enhanced` only covers a bare `?enhanced`.
declare module '*&enhanced' {
	const value: import('@sveltejs/enhanced-img').Picture;
	export default value;
}
