CREATE TABLE `admins` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`surname` text NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`avatar` text,
	`refresh_token` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_username_unique` ON `admins` (`username`);--> statement-breakpoint
CREATE TABLE `icons` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_video` integer NOT NULL,
	`url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`message` text NOT NULL,
	`is_checked` integer DEFAULT 0 NOT NULL,
	`is_telegram` integer DEFAULT false NOT NULL,
	`updated_admin_id` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`updated_admin_id`) REFERENCES `admins`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `phones` (
	`id` integer PRIMARY KEY NOT NULL,
	`phone` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `socials` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`icon_id` integer NOT NULL,
	FOREIGN KEY (`icon_id`) REFERENCES `icons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`surname` text NOT NULL,
	`image` text NOT NULL,
	`certificate_image` text,
	`overall` real,
	`listening` real,
	`reading` real,
	`writing` real,
	`speaking` real,
	`cefr` text,
	`review_uz` text,
	`review_en` text
);
--> statement-breakpoint
CREATE TABLE `teachers` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`surname` text NOT NULL,
	`about_uz` text NOT NULL,
	`about_en` text NOT NULL,
	`quote_uz` text NOT NULL,
	`quote_en` text NOT NULL,
	`image` text NOT NULL,
	`overall` real,
	`listening` real,
	`reading` real,
	`writing` real,
	`speaking` real,
	`cefr` text,
	`experience` integer,
	`students` integer
);
--> statement-breakpoint
CREATE TABLE `web_media` (
	`id` integer PRIMARY KEY NOT NULL,
	`order` integer NOT NULL,
	`size` text DEFAULT '1x1' NOT NULL,
	`web_id` integer NOT NULL,
	`media_id` integer NOT NULL,
	FOREIGN KEY (`web_id`) REFERENCES `webs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `web_phone` (
	`id` integer PRIMARY KEY NOT NULL,
	`web_id` integer NOT NULL,
	`phone_id` integer NOT NULL,
	FOREIGN KEY (`web_id`) REFERENCES `webs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`phone_id`) REFERENCES `phones`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `web_social` (
	`id` integer PRIMARY KEY NOT NULL,
	`web_id` integer NOT NULL,
	`social_id` integer NOT NULL,
	FOREIGN KEY (`web_id`) REFERENCES `webs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`social_id`) REFERENCES `socials`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `web_student` (
	`id` integer PRIMARY KEY NOT NULL,
	`order` integer NOT NULL,
	`web_id` integer NOT NULL,
	`student_id` integer NOT NULL,
	FOREIGN KEY (`web_id`) REFERENCES `webs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `web_teacher` (
	`id` integer PRIMARY KEY NOT NULL,
	`order` integer NOT NULL,
	`web_id` integer NOT NULL,
	`teacher_id` integer NOT NULL,
	FOREIGN KEY (`web_id`) REFERENCES `webs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `webs` (
	`id` integer PRIMARY KEY NOT NULL,
	`header_img` text NOT NULL,
	`header_h1_uz` text NOT NULL,
	`header_h1_en` text NOT NULL,
	`about_p1_uz` text NOT NULL,
	`about_p1_en` text NOT NULL,
	`about_p2_uz` text NOT NULL,
	`about_p2_en` text NOT NULL,
	`total_students` integer NOT NULL,
	`best_students` integer NOT NULL,
	`total_teachers` integer NOT NULL,
	`gallery_p_uz` text NOT NULL,
	`gallery_p_en` text NOT NULL,
	`teachers_p_uz` text NOT NULL,
	`teachers_p_en` text NOT NULL,
	`students_p_uz` text NOT NULL,
	`students_p_en` text NOT NULL,
	`address_uz` text NOT NULL,
	`address_en` text NOT NULL,
	`orientation_uz` text NOT NULL,
	`orientation_en` text NOT NULL,
	`work_time` text NOT NULL,
	`work_time_sunday` text NOT NULL,
	`main_phone_id` integer,
	`email` text NOT NULL,
	`is_active` integer DEFAULT false NOT NULL,
	`visits` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`main_phone_id`) REFERENCES `phones`(`id`) ON UPDATE no action ON DELETE cascade
);
