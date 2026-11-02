/**
 * drizzle-kit config (docs/ARCHITECTURE.md#database). drizzle-kit only *generates* migrations here; Wrangler
 * applies them (`pnpm db:migrate*`), so no credentials are needed.
 */
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/db/schema.ts',
	out: './migrations'
});
