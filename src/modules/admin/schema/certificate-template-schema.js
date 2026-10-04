import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const certificateTemplates = pgTable("certificate_templates", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    imageUrl: text("image_url").notNull(),
    cloudinaryPublicId: text("cloudinary_public_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});