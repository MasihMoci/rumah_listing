import { eq, and, desc, like, gte, lte, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  properties,
  propertyImages,
  payments,
  contactRequests,
  reviews,
  adminLogs,
  type Property,
  type User,
  type Payment,
  type ContactRequest,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * USER OPERATIONS
 */

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone", "whatsapp", "profilePhoto", "bio", "address", "city", "province", "postalCode"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserSubscription(userId: number, status: string, expiresAt: Date | null): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(users)
    .set({
      subscriptionStatus: status as any,
      subscriptionExpiresAt: expiresAt,
      isPremium: status === "active",
    })
    .where(eq(users.id, userId));
}

/**
 * PROPERTY OPERATIONS
 */

export async function createProperty(data: any): Promise<Property> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(properties).values({
    ...data,
    images: JSON.stringify(data.images || []),
  });

  const propertyId = result[0].insertId;
  const property = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
  return property[0];
}

export async function getPropertyById(id: number): Promise<Property | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPropertiesByUserId(userId: number, limit = 50, offset = 0): Promise<Property[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(properties)
    .where(eq(properties.userId, userId))
    .orderBy(desc(properties.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function searchProperties(filters: {
  city?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<Property[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [eq(properties.status, "published")];

  if (filters.city) {
    conditions.push(like(properties.city, `%${filters.city}%`));
  }
  if (filters.propertyType) {
    conditions.push(eq(properties.propertyType, filters.propertyType as any));
  }
  if (filters.minPrice) {
    conditions.push(gte(properties.price, filters.minPrice));
  }
  if (filters.maxPrice) {
    conditions.push(lte(properties.price, filters.maxPrice));
  }
  if (filters.bedrooms) {
    conditions.push(eq(properties.bedrooms, filters.bedrooms));
  }

  return db
    .select()
    .from(properties)
    .where(and(...conditions))
    .orderBy(desc(properties.createdAt))
    .limit(filters.limit || 50)
    .offset(filters.offset || 0);
}

export async function updateProperty(id: number, data: any): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(properties).set(data).where(eq(properties.id, id));
}

/**
 * PAYMENT OPERATIONS
 */

export async function createPayment(data: any): Promise<Payment> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(payments).values(data);
  const paymentId = result[0].insertId;
  const payment = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
  return payment[0];
}

export async function getPaymentByTransactionId(transactionId: string): Promise<Payment | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(payments).where(eq(payments.transactionId, transactionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePaymentStatus(id: number, status: string, completedAt?: Date): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(payments)
    .set({
      status: status as any,
      completedAt: completedAt,
    })
    .where(eq(payments.id, id));
}

/**
 * CONTACT REQUEST OPERATIONS
 */

export async function createContactRequest(userId: number, propertyId: number, sellerPhone?: string, sellerWhatsapp?: string): Promise<ContactRequest> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(contactRequests).values({
    userId,
    propertyId,
    sellerPhone,
    sellerWhatsapp,
    status: "pending",
  });

  const requestId = result[0].insertId;
  const request = await db.select().from(contactRequests).where(eq(contactRequests.id, requestId)).limit(1);
  return request[0];
}

export async function getContactRequest(userId: number, propertyId: number): Promise<ContactRequest | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(contactRequests)
    .where(and(eq(contactRequests.userId, userId), eq(contactRequests.propertyId, propertyId)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateContactRequestStatus(id: number, status: string, viewedAt?: Date): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(contactRequests)
    .set({
      status: status as any,
      viewedAt: viewedAt,
    })
    .where(eq(contactRequests.id, id));
}

/**
 * ADMIN LOG OPERATIONS
 */

export async function logAdminAction(adminId: number, action: string, targetType?: string, targetId?: number, details?: any, ipAddress?: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(adminLogs).values({
    adminId,
    action,
    targetType: targetType || undefined,
    targetId: targetId || undefined,
    details: details ? (details as Record<string, unknown>) : undefined,
    ipAddress: ipAddress || undefined,
  });
}
