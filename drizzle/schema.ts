import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with real estate platform specific fields.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "seller", "demo"]).default("user").notNull(),
  
  // Subscription & Payment
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["free", "active", "expired", "cancelled"]).default("free").notNull(),
  subscriptionExpiresAt: timestamp("subscriptionExpiresAt"),
  isPremium: boolean("isPremium").default(false).notNull(),
  
  // Profile
  profilePhoto: varchar("profilePhoto", { length: 512 }),
  bio: text("bio"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  province: varchar("province", { length: 100 }),
  postalCode: varchar("postalCode", { length: 10 }),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Properties/Listings table
 */
export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Basic Info
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  propertyType: mysqlEnum("propertyType", ["house", "apartment", "land", "commercial", "townhouse"]).notNull(),
  
  // Location
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  postalCode: varchar("postalCode", { length: 10 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  
  // Details
  bedrooms: int("bedrooms"),
  bathrooms: int("bathrooms"),
  landSize: int("landSize"), // in m²
  buildingSize: int("buildingSize"), // in m²
  yearBuilt: int("yearBuilt"),
  
  // Pricing
  price: int("price").notNull(), // in IDR
  currency: varchar("currency", { length: 3 }).default("IDR").notNull(),
  
  // Status
  status: mysqlEnum("status", ["draft", "published", "sold", "archived"]).default("draft").notNull(),
  
  // Images (store as JSON array of URLs)
  images: json("images").$type<string[]>().notNull(),
  imageCount: int("imageCount").default(0).notNull(),
  
  // Contact
  sellerPhone: varchar("sellerPhone", { length: 20 }),
  sellerWhatsapp: varchar("sellerWhatsapp", { length: 20 }),
  
  // Metadata
  views: int("views").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

/**
 * Property Images table (for detailed tracking)
 */
export const propertyImages = mysqlTable("propertyImages", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }).notNull(),
  displayOrder: int("displayOrder").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PropertyImage = typeof propertyImages.$inferSelect;
export type InsertPropertyImage = typeof propertyImages.$inferInsert;

/**
 * Contact Requests (for payment-gated contact access)
 */
export const contactRequests = mysqlTable("contactRequests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  propertyId: int("propertyId").notNull(),
  
  // Contact Info Revealed
  sellerPhone: varchar("sellerPhone", { length: 20 }),
  sellerWhatsapp: varchar("sellerWhatsapp", { length: 20 }),
  
  // Status
  status: mysqlEnum("status", ["pending", "viewed", "contacted"]).default("pending").notNull(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  viewedAt: timestamp("viewedAt"),
});

export type ContactRequest = typeof contactRequests.$inferSelect;
export type InsertContactRequest = typeof contactRequests.$inferInsert;

/**
 * Payments & Transactions
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Payment Details
  amount: int("amount").notNull(), // in IDR
  currency: varchar("currency", { length: 3 }).default("IDR").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  
  // Midtrans Integration
  transactionId: varchar("transactionId", { length: 100 }).unique(),
  orderId: varchar("orderId", { length: 100 }).unique(),
  status: mysqlEnum("status", ["pending", "success", "failed", "cancelled"]).default("pending").notNull(),
  
  // Subscription
  subscriptionDays: int("subscriptionDays").default(30).notNull(),
  
  // Metadata
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Reviews & Ratings
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  userId: int("userId").notNull(),
  
  rating: int("rating").notNull(), // 1-5
  comment: text("comment"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Admin Logs (for security & audit)
 */
export const adminLogs = mysqlTable("adminLogs", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  targetType: varchar("targetType", { length: 50 }), // "user", "property", "payment"
  targetId: int("targetId"),
  details: json("details").$type<Record<string, unknown>>(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;
