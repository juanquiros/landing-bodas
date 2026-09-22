CREATE TABLE `rsvps` (
	`id` text PRIMARY KEY NOT NULL,
	`wedding_slug` text NOT NULL,
	`full_name` text NOT NULL,
	`attending` text NOT NULL,
	`guest_count` integer NOT NULL,
	`dietary` text,
	`message` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rsvps_wedding_slug_idx` ON `rsvps` (`wedding_slug`);--> statement-breakpoint
CREATE INDEX `rsvps_attending_idx` ON `rsvps` (`attending`);--> statement-breakpoint
CREATE INDEX `rsvps_created_at_idx` ON `rsvps` (`created_at`);--> statement-breakpoint
CREATE TABLE `song_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`wedding_slug` text NOT NULL,
	`guest_name` text NOT NULL,
	`artist` text NOT NULL,
	`title` text NOT NULL,
	`link` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `song_requests_wedding_slug_idx` ON `song_requests` (`wedding_slug`);--> statement-breakpoint
CREATE INDEX `song_requests_created_at_idx` ON `song_requests` (`created_at`);