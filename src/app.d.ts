// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// No `Platform`: SvelteKit 3 moved Cloudflare bindings to `import { env } from 'cloudflare:workers'`.
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
