CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"surname" text NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"avatar" text,
	"refresh_token" text,
	CONSTRAINT "admins_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "icons" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_video" boolean NOT NULL,
	"url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"message" text NOT NULL,
	"is_checked" boolean DEFAULT false NOT NULL,
	"is_telegram" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "phones" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "socials" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"icon_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"surname" text NOT NULL,
	"image" text NOT NULL,
	"certificate_photo" text NOT NULL,
	"overall" real NOT NULL,
	"listening" real NOT NULL,
	"reading" real NOT NULL,
	"writing" real NOT NULL,
	"speaking" real NOT NULL,
	"cefr" text NOT NULL,
	"review_uz" text NOT NULL,
	"review_en" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"surname" text NOT NULL,
	"about_uz" text NOT NULL,
	"about_en" text NOT NULL,
	"quote_uz" text NOT NULL,
	"quote_en" text NOT NULL,
	"image" text NOT NULL,
	"overall" real NOT NULL,
	"listening" real NOT NULL,
	"reading" real NOT NULL,
	"writing" real NOT NULL,
	"speaking" real NOT NULL,
	"cefr" text NOT NULL,
	"experience" integer NOT NULL,
	"students" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "web_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer NOT NULL,
	"size" text DEFAULT '1x1' NOT NULL,
	"web_id" integer NOT NULL,
	"media_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "web_phone" (
	"id" serial PRIMARY KEY NOT NULL,
	"web_id" integer NOT NULL,
	"phone_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "web_social" (
	"id" serial PRIMARY KEY NOT NULL,
	"web_id" integer NOT NULL,
	"social_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "web_student" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer NOT NULL,
	"web_id" integer NOT NULL,
	"student_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "web_teacher" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer NOT NULL,
	"web_id" integer NOT NULL,
	"teacher_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webs" (
	"id" serial PRIMARY KEY NOT NULL,
	"header_img" text NOT NULL,
	"header_h1_uz" text NOT NULL,
	"header_h1_en" text NOT NULL,
	"about_p1_uz" text NOT NULL,
	"about_p1_en" text NOT NULL,
	"about_p2_uz" text NOT NULL,
	"about_p2_en" text NOT NULL,
	"total_students" integer NOT NULL,
	"best_students" integer NOT NULL,
	"total_teachers" integer NOT NULL,
	"gallery_p_uz" text NOT NULL,
	"gallery_p_en" text NOT NULL,
	"teachers_p_uz" text NOT NULL,
	"teachers_p_en" text NOT NULL,
	"students_p_uz" text NOT NULL,
	"students_p_en" text NOT NULL,
	"address_uz" text NOT NULL,
	"address_en" text NOT NULL,
	"orientation_uz" text NOT NULL,
	"orientation_en" text NOT NULL,
	"work_time" text NOT NULL,
	"work_time_sunday" text NOT NULL,
	"footer_p_uz" text NOT NULL,
	"footer_p_en" text NOT NULL,
	"main_phone_id" integer NOT NULL,
	"email" text NOT NULL,
	"extended_address_uz" text NOT NULL,
	"extended_address_en" text NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "socials" ADD CONSTRAINT "socials_icon_id_icons_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."icons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "web_media" ADD CONSTRAINT "web_media_web_id_webs_id_fk" FOREIGN KEY ("web_id") REFERENCES "public"."webs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "web_media" ADD CONSTRAINT "web_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "web_phone" ADD CONSTRAINT "web_phone_web_id_webs_id_fk" FOREIGN KEY ("web_id") REFERENCES "public"."webs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "web_phone" ADD CONSTRAINT "web_phone_phone_id_phones_id_fk" FOREIGN KEY ("phone_id") REFERENCES "public"."phones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "web_social" ADD CONSTRAINT "web_social_web_id_webs_id_fk" FOREIGN KEY ("web_id") REFERENCES "public"."webs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "web_social" ADD CONSTRAINT "web_social_social_id_socials_id_fk" FOREIGN KEY ("social_id") REFERENCES "public"."socials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "web_student" ADD CONSTRAINT "web_student_web_id_webs_id_fk" FOREIGN KEY ("web_id") REFERENCES "public"."webs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "web_student" ADD CONSTRAINT "web_student_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "web_teacher" ADD CONSTRAINT "web_teacher_web_id_webs_id_fk" FOREIGN KEY ("web_id") REFERENCES "public"."webs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "web_teacher" ADD CONSTRAINT "web_teacher_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webs" ADD CONSTRAINT "webs_main_phone_id_phones_id_fk" FOREIGN KEY ("main_phone_id") REFERENCES "public"."phones"("id") ON DELETE cascade ON UPDATE no action;