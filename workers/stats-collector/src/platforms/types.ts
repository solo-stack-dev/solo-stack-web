import type { StatPlatformId } from '#lib/stats/schema.ts';

/** What one platform returned in one run. Only fetched numbers, never estimates. */
export interface Reading {
	platform: StatPlatformId;
	followers: number;
	/**
	 * Publish timestamps (ISO) of every post since `since` (just before the history window), or absent when the platform
	 * cannot list posts. The store rewrites the window's `posts` rows from it, so it must be complete for that range.
	 */
	posts?: string[];
	youtube?: YoutubeReading;
}

export interface YoutubeReading {
	/** Lifetime channel views. */
	totalViews: number;
	videos: VideoReading[];
}

export interface VideoReading {
	id: string;
	title: string;
	durationSeconds: number;
	publishedAt: string;
	/** Lifetime views. */
	totalViews: number;
}

export interface CollectContext {
	env: Env;
	/** UTC day (`YYYY-MM-DD`): list posts published on or after it (compared as text with the ISO timestamps). */
	since: string;
}
