CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`track` text NOT NULL,
	`laps` integer NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`created_at` integer NOT NULL
);
