/**
 * Social platforms. Source: docs/PROJECT.md#links (verified by the owner 2026-10-31). Names are proper names, handles
 * and URLs the owner's data: neither is "copy".
 *
 * `icon`: Simple Icons slug (https://simpleicons.org, CC0); render the real logo per each platform's brand guidelines.
 * `url: null` = not linkable yet; render links from `linkedSocials`.
 */
export type SocialId = 'youtube' | 'github' | 'instagram' | 'tiktok' | 'x' | 'bluesky' | 'threads' | 'twitch' | 'facebook' | 'discord';

export interface Social {
	id: SocialId;
	/** Platform name (proper name, not translated). */
	name: string;
	url: string | null;
	/** Public handle as shown on the platform, without a leading `@` unless the platform shows one. */
	handle: string | null;
	/** Simple Icons slug. */
	icon: string;
}

/** YouTube channel id of @solostack_dev (stable even if the handle changes). */
export const YOUTUBE_CHANNEL_ID = 'UCv6ihOMjTq6zdJC7IbCdpKQ';
export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@solostack_dev';
export const GITHUB_OWNER = 'solo-stack-dev';

/** Discord invite. Must be a non-expiring invite (Discord: Invite People > Edit invite link > Expire After: Never). */
export const DISCORD_INVITE_URL: string | null = 'https://discord.gg/qzB5yQ2mvs';

/** Order: YouTube, GitHub, then roughly by reach. */
export const SOCIALS: readonly Social[] = [
	{ id: 'youtube', name: 'YouTube', url: YOUTUBE_CHANNEL_URL, handle: '@solostack_dev', icon: 'youtube' },
	{ id: 'github', name: 'GitHub', url: `https://github.com/${GITHUB_OWNER}`, handle: GITHUB_OWNER, icon: 'github' },
	{ id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/solostack.dev/', handle: 'solostack.dev', icon: 'instagram' },
	{ id: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com/@solo_stack', handle: '@solo_stack', icon: 'tiktok' },
	{ id: 'x', name: 'X', url: 'https://x.com/solostack_dev', handle: '@solostack_dev', icon: 'x' },
	{ id: 'bluesky', name: 'Bluesky', url: 'https://bsky.app/profile/solo-stack.bsky.social', handle: '@solo-stack.bsky.social', icon: 'bluesky' },
	{ id: 'threads', name: 'Threads', url: 'https://www.threads.com/@solostack.dev', handle: '@solostack.dev', icon: 'threads' },
	{ id: 'twitch', name: 'Twitch', url: 'https://www.twitch.tv/solo_stack', handle: 'solo_stack', icon: 'twitch' },
	{ id: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61595766765047', handle: null, icon: 'facebook' },
	{ id: 'discord', name: 'Discord', url: DISCORD_INVITE_URL, handle: null, icon: 'discord' }
];

/** Platforms that can be linked right now. */
export const linkedSocials = (): (Social & { url: string })[] => SOCIALS.filter((social): social is Social & { url: string } => social.url !== null);

export const getSocial = (id: SocialId): Social => SOCIALS.find((social) => social.id === id)!;
