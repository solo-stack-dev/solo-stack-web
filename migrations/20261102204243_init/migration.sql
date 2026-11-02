CREATE TABLE `daily_metrics` (
	`day` text NOT NULL,
	`platform` text NOT NULL,
	`metric` text NOT NULL,
	`value` integer NOT NULL,
	`fetched_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	CONSTRAINT `daily_metrics_pk` PRIMARY KEY(`platform`, `metric`, `day`),
	CONSTRAINT "daily_metrics_day_format" CHECK("day" GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
	CONSTRAINT "daily_metrics_metric_known" CHECK("metric" IN ('followers', 'views', 'watch_minutes', 'posts')),
	CONSTRAINT "daily_metrics_value_positive" CHECK("value" >= 0)
);
--> statement-breakpoint
CREATE TABLE `video_daily_views` (
	`video_id` text NOT NULL,
	`day` text NOT NULL,
	`views` integer NOT NULL,
	CONSTRAINT `video_daily_views_pk` PRIMARY KEY(`video_id`, `day`),
	CONSTRAINT `fk_video_daily_views_video_id_videos_id_fk` FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON DELETE CASCADE,
	CONSTRAINT "video_daily_views_day_format" CHECK("day" GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
	CONSTRAINT "video_daily_views_views_positive" CHECK("views" >= 0)
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` text PRIMARY KEY,
	`title` text NOT NULL,
	`duration_seconds` integer NOT NULL,
	`published_at` text,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	CONSTRAINT "videos_duration_positive" CHECK("duration_seconds" >= 0)
);
--> statement-breakpoint
CREATE INDEX `daily_metrics_metric_day` ON `daily_metrics` (`metric`,`day`);--> statement-breakpoint
CREATE INDEX `video_daily_views_day` ON `video_daily_views` (`day`);