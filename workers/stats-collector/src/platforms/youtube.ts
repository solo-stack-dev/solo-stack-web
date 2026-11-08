/**
 * YouTube Data API v3 with an API key (no OAuth): subscribers, lifetime channel views and every upload with its lifetime views.
 * Daily views come from day-over-day deltas in the store. Quota: 1 unit per call, about 3 + 2 per 50 uploads per run (limit
 * 10,000 per day). Watch time needs YouTube Analytics (OAuth), not wired yet.
 */
import { YOUTUBE_CHANNEL_ID } from '#lib/home/data/socials.ts';
import { count, fetchJson } from '../http.ts';
import type { CollectContext, Reading, VideoReading } from './types.ts';

const API = 'https://www.googleapis.com/youtube/v3';
/** Uploads read per run (50 per page; each page costs two subrequests, the free plan allows 50 per run). */
const MAX_UPLOADS = 250;

interface Channel {
	statistics: { viewCount: string; subscriberCount?: string; hiddenSubscriberCount: boolean };
	contentDetails: { relatedPlaylists: { uploads: string } };
}

interface PlaylistPage {
	items: { contentDetails: { videoId: string } }[];
	nextPageToken?: string;
}

interface Video {
	id: string;
	snippet: { title: string; publishedAt: string; liveBroadcastContent: string };
	contentDetails: { duration: string };
	statistics: { viewCount?: string };
}

/** ISO 8601 duration (`PT1H2M3S`, `P1DT2H`) → seconds. */
export function parseDuration(value: string): number {
	const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(value);
	if (!match) throw new Error(`youtube: unknown duration ${value}`);
	const [days, hours, minutes, seconds] = match.slice(1).map((part) => Number(part ?? 0));
	return ((days * 24 + hours) * 60 + minutes) * 60 + seconds;
}

export async function collectYoutube({ env, since }: CollectContext): Promise<Reading> {
	const key = env.YOUTUBE_API_KEY;
	if (!key) throw new Error('youtube: YOUTUBE_API_KEY is not set');
	const url = (path: string, params: Record<string, string>) => `${API}/${path}?${new URLSearchParams({ ...params, key })}`;

	const channels = await fetchJson<{ items?: Channel[] }>('youtube channels', url('channels', { part: 'statistics,contentDetails', id: YOUTUBE_CHANNEL_ID }));
	const channel = channels.items?.[0];
	if (!channel) throw new Error('youtube: channel not found');
	if (channel.statistics.hiddenSubscriberCount) throw new Error('youtube: subscriber count is hidden');

	const ids: string[] = [];
	let pageToken: string | undefined;
	do {
		const page = await fetchJson<PlaylistPage>(
			'youtube playlistItems',
			url('playlistItems', { part: 'contentDetails', playlistId: channel.contentDetails.relatedPlaylists.uploads, maxResults: '50', ...(pageToken && { pageToken }) })
		);
		ids.push(...page.items.map((item) => item.contentDetails.videoId));
		pageToken = page.nextPageToken;
	} while (pageToken && ids.length < MAX_UPLOADS);

	const videos: VideoReading[] = [];
	for (let start = 0; start < ids.length; start += 50) {
		const page = await fetchJson<{ items: Video[] }>(
			'youtube videos',
			url('videos', { part: 'snippet,contentDetails,statistics', id: ids.slice(start, start + 50).join(',') })
		);
		for (const video of page.items) {
			// Scheduled premieres and streams have no views yet; they count once published.
			if (video.snippet.liveBroadcastContent === 'upcoming' || video.statistics.viewCount === undefined) continue;
			videos.push({
				id: video.id,
				title: video.snippet.title,
				durationSeconds: parseDuration(video.contentDetails.duration),
				publishedAt: video.snippet.publishedAt,
				totalViews: count('youtube video views', video.statistics.viewCount)
			});
		}
	}

	return {
		platform: 'youtube',
		followers: count('youtube subscribers', channel.statistics.subscriberCount),
		// The uploads playlist is newest first, so a capped list still holds every recent upload.
		posts: videos.map((video) => video.publishedAt).filter((publishedAt) => publishedAt >= since),
		youtube: { totalViews: count('youtube channel views', channel.statistics.viewCount), videos }
	};
}
