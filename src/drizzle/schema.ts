import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// Admins --------------------------------------------------
export const admins = sqliteTable("admins", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  surname: text("surname").notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  priority: integer("priority"),
  refresh_token: text("refresh_token"),
});

// Icons ---------------------------------------------------
export const icons = sqliteTable("icons", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
});

// Media ---------------------------------------------------
export const media = sqliteTable("media", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  is_video: integer("is_video", { mode: "boolean" }).notNull(),
  url: text("url").notNull(),
});

// Messages ------------------------------------------------
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  is_checked: integer("is_checked", { mode: "boolean" })
    .default(false)
    .notNull(),
  is_telegram: integer("is_telegram", { mode: "boolean" })
    .default(false)
    .notNull(),
  created_at: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Phones --------------------------------------------------
export const phones = sqliteTable("phones", {
  id: integer("id").primaryKey(),
  phone: text("phone").notNull(),
});

// Socials -------------------------------------------------
export const socials = sqliteTable("socials", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  icon_id: integer("icon_id")
    .notNull()
    .references(() => icons.id, { onDelete: "cascade" }),
});

// Students ------------------------------------------------
export const students = sqliteTable("students", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  surname: text("surname").notNull(),
  image: text("image").notNull(),
  certificate_photo: text("certificate_photo"),
  about_uz: text("about_uz").notNull(),
  about_en: text("about_en").notNull(),
});

// Teachers ------------------------------------------------
export const teachers = sqliteTable("teachers", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  surname: text("surname").notNull(),
  about_uz: text("about_uz").notNull(),
  about_en: text("about_en").notNull(),
  image: text("image").notNull(),
});

// Webs ----------------------------------------------------
export const webs = sqliteTable("webs", {
  id: integer("id").primaryKey(),
  header_img: text("header_img").notNull(),
  header_h1_uz: text("header_h1_uz").notNull(),
  header_h1_en: text("header_h1_en").notNull(),
  header_h2_uz: text("header_h2_uz").notNull(),
  header_h2_en: text("header_h2_en").notNull(),
  address_uz: text("address_uz").notNull(),
  address_en: text("address_en").notNull(),
  phone_id: integer("phone_id")
    .notNull()
    .references(() => phones.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  extended_address_uz: text("extended_address_uz").notNull(),
  extended_address_en: text("extended_address_en").notNull(),
  is_active: integer("is_active", { mode: "boolean" }).notNull().default(false),
});

// WebMedia ------------------------------------------------
export const web_media = sqliteTable("web_media", {
  id: integer("id").primaryKey(),
  order: integer("order").notNull(),
  size: text("size").notNull().default("1x1"), // size only one of them: 1x1, 1x2
  web_id: integer("web_id")
    .notNull()
    .references(() => webs.id, { onDelete: "cascade" }),
  media_id: integer("media_id")
    .notNull()
    .references(() => media.id, { onDelete: "cascade" }),
});

// WebPhone ------------------------------------------------
export const web_phone = sqliteTable("web_phone", {
  id: integer("id").primaryKey(),
  web_id: integer("web_id")
    .notNull()
    .references(() => webs.id, { onDelete: "cascade" }),
  phone_id: integer("phone_id")
    .notNull()
    .references(() => phones.id, { onDelete: "cascade" }),
});

// WebSocial ----------------------------------------------
export const web_social = sqliteTable("web_social", {
  id: integer("id").primaryKey(),
  web_id: integer("web_id")
    .notNull()
    .references(() => webs.id, { onDelete: "cascade" }),
  social_id: integer("social_id")
    .notNull()
    .references(() => socials.id, { onDelete: "cascade" }),
});

// WebStudent ---------------------------------------------
export const web_student = sqliteTable("web_student", {
  id: integer("id").primaryKey(),
  order: integer("order").notNull(),
  web_id: integer("web_id")
    .notNull()
    .references(() => webs.id, { onDelete: "cascade" }),
  student_id: integer("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
});

// WebTeacher ---------------------------------------------
export const web_teacher = sqliteTable("web_teacher", {
  id: integer("id").primaryKey(),
  order: integer("order").notNull(),
  web_id: integer("web_id")
    .notNull()
    .references(() => webs.id, { onDelete: "cascade" }),
  teacher_id: integer("teacher_id")
    .notNull()
    .references(() => teachers.id, { onDelete: "cascade" }),
});

// Relations -------------------------------------------------
export const iconsRelations = relations(icons, ({ one }) => ({
  // no relations starting from icon
}));

export const socialsRelations = relations(socials, ({ one }) => ({
  icon: one(icons, {
    fields: [socials.icon_id],
    references: [icons.id],
  }),
}));

export const websRelations = relations(webs, ({ one, many }) => ({
  main_phone: one(phones, {
    fields: [webs.phone_id],
    references: [phones.id],
  }),
  web_media: many(web_media),
  web_phones: many(web_phone),
  web_socials: many(web_social),
  web_students: many(web_student),
  web_teachers: many(web_teacher),
}));

export const phonesRelations = relations(phones, ({ many }) => ({
  web_phones: many(web_phone),
}));

export const mediaRelations = relations(media, ({ many }) => ({
  web_media: many(web_media),
}));

export const webMediaRelations = relations(web_media, ({ one }) => ({
  web: one(webs, {
    fields: [web_media.web_id],
    references: [webs.id],
  }),
  media: one(media, {
    fields: [web_media.media_id],
    references: [media.id],
  }),
}));

export const webPhoneRelations = relations(web_phone, ({ one }) => ({
  web: one(webs, {
    fields: [web_phone.web_id],
    references: [webs.id],
  }),
  phone: one(phones, {
    fields: [web_phone.phone_id],
    references: [phones.id],
  }),
}));

export const webSocialRelations = relations(web_social, ({ one }) => ({
  web: one(webs, {
    fields: [web_social.web_id],
    references: [webs.id],
  }),
  social: one(socials, {
    fields: [web_social.social_id],
    references: [socials.id],
  }),
}));

export const studentsRelations = relations(students, ({ many }) => ({
  web_students: many(web_student),
}));

export const webStudentRelations = relations(web_student, ({ one }) => ({
  web: one(webs, {
    fields: [web_student.web_id],
    references: [webs.id],
  }),
  student: one(students, {
    fields: [web_student.student_id],
    references: [students.id],
  }),
}));

export const teachersRelations = relations(teachers, ({ many }) => ({
  web_teachers: many(web_teacher),
}));

export const webTeacherRelations = relations(web_teacher, ({ one }) => ({
  web: one(webs, {
    fields: [web_teacher.web_id],
    references: [webs.id],
  }),
  teacher: one(teachers, {
    fields: [web_teacher.teacher_id],
    references: [teachers.id],
  }),
}));
