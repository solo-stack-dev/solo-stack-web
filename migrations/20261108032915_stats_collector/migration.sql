ALTER TABLE `video_daily_views` ADD `total_views` integer;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_video_daily_views` (
	`video_id` text NOT NULL,
	`day` text NOT NULL,
	`views` integer NOT NULL,
	`total_views` integer,
	CONSTRAINT `video_daily_views_pk` PRIMARY KEY(`video_id`, `day`),
	CONSTRAINT `fk_video_daily_views_video_id_videos_id_fk` FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON DELETE CASCADE,
	CONSTRAINT "video_daily_views_day_format" CHECK("day" GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
	CONSTRAINT "video_daily_views_views_positive" CHECK("views" >= 0),
	CONSTRAINT "video_daily_views_total_views_positive" CHECK("total_views" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_video_daily_views`(`video_id`, `day`, `views`) SELECT `video_id`, `day`, `views` FROM `video_daily_views`;--> statement-breakpoint
DROP TABLE `video_daily_views`;--> statement-breakpoint
ALTER TABLE `__new_video_daily_views` RENAME TO `video_daily_views`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_daily_metrics` (
	`day` text NOT NULL,
	`platform` text NOT NULL,
	`metric` text NOT NULL,
	`value` integer NOT NULL,
	`fetched_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	CONSTRAINT `daily_metrics_pk` PRIMARY KEY(`platform`, `metric`, `day`),
	CONSTRAINT "daily_metrics_day_format" CHECK("day" GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
	CONSTRAINT "daily_metrics_metric_known" CHECK("metric" IN ('followers', 'views', 'watch_minutes', 'total_views', 'posts')),
	CONSTRAINT "daily_metrics_value_positive" CHECK("value" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_daily_metrics`(`day`, `platform`, `metric`, `value`, `fetched_at`) SELECT `day`, `platform`, `metric`, `value`, `fetched_at` FROM `daily_metrics`;--> statement-breakpoint
DROP TABLE `daily_metrics`;--> statement-breakpoint
ALTER TABLE `__new_daily_metrics` RENAME TO `daily_metrics`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `video_daily_views_day` ON `video_daily_views` (`day`);--> statement-breakpoint
CREATE INDEX `daily_metrics_metric_day` ON `daily_metrics` (`metric`,`day`);