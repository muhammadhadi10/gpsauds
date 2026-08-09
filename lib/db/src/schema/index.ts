import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  studentId: text("student_id"),
  phone: text("phone"),
  level: text("level"),
  role: text("role").notNull().default("student"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  ...timestamps,
});

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  label: text("label").notNull(),
  description: text("description"),
  category: text("category").notNull().default("general"),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  type: text("type").notNull().default("general"),
  status: text("status").notNull().default("draft"),
  coverImageUrl: text("cover_image_url"),
  location: text("location"),
  isVirtual: boolean("is_virtual").notNull().default(false),
  virtualLink: text("virtual_link"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  capacity: integer("capacity"),
  registrationRequired: boolean("registration_required").notNull().default(false),
  registrationDeadline: timestamp("registration_deadline", { withTimezone: true }),
  createdBy: text("created_by").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...timestamps,
});

export const eventRegistrations = pgTable("event_registrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull(),
  userId: text("user_id").notNull(),
  registeredAt: timestamp("registered_at", { withTimezone: true }).defaultNow().notNull(),
});

export const news = pgTable("news", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImageUrl: text("cover_image_url"),
  status: text("status").notNull().default("draft"),
  isFeatured: boolean("is_featured").notNull().default(false),
  authorId: text("author_id").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...timestamps,
});

export const newsTags = pgTable("news_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  newsId: uuid("news_id").notNull(),
  tag: text("tag").notNull(),
});

export const opportunities = pgTable("opportunities", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("draft"),
  organisation: text("organisation").notNull(),
  location: text("location"),
  isRemote: boolean("is_remote").notNull().default(false),
  applicationUrl: text("application_url"),
  deadline: timestamp("deadline", { withTimezone: true }),
  coverImageUrl: text("cover_image_url"),
  eligibility: text("eligibility"),
  benefits: text("benefits"),
  postedBy: text("posted_by").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...timestamps,
});

export const academicResources = pgTable("academic_resources", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  courseCode: text("course_code"),
  courseName: text("course_name"),
  level: text("level"),
  academicYear: text("academic_year"),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull().default(1),
  fileType: text("file_type").notNull().default("application/pdf"),
  downloadCount: integer("download_count").notNull().default(0),
  isApproved: boolean("is_approved").notNull().default(false),
  uploadedBy: text("uploaded_by").notNull(),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  ...timestamps,
});

export const memberships = pgTable("memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  status: text("status").notNull().default("pending"),
  tier: text("tier").notNull(),
  academicYear: text("academic_year").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  notes: text("notes"),
  ...timestamps,
});

export const welfareRequests = pgTable("welfare_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  reference: text("reference").notNull().unique(),
  type: text("type").notNull(),
  status: text("status").notNull().default("submitted"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  amountRequested: numeric("amount_requested", { precision: 10, scale: 2 }),
  amountApproved: numeric("amount_approved", { precision: 10, scale: 2 }),
  reviewNotes: text("review_notes"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  ...timestamps,
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type EventRecord = typeof events.$inferSelect;
export type NewsRecord = typeof news.$inferSelect;
export type OpportunityRecord = typeof opportunities.$inferSelect;
export type AcademicResourceRecord = typeof academicResources.$inferSelect;