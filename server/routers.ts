import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createProperty,
  getPropertyById,
  searchProperties,
  getPropertiesByUserId,
  updateProperty,
  createPayment,
  getPaymentByTransactionId,
  updatePaymentStatus,
  createContactRequest,
  getContactRequest,
  updateContactRequestStatus,
  updateUserSubscription,
  logAdminAction,
  getUserById,
} from "./db";
import { TRPCError } from "@trpc/server";

// Admin procedure - checks if user is admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * PROPERTY ROUTERS
   */
  properties: router({
    // Get single property
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const property = await getPropertyById(input.id);
      if (!property) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
      }
      return {
        ...property,
        images: typeof property.images === "string" ? JSON.parse(property.images) : property.images,
      };
    }),

    // Search properties with filters
    search: publicProcedure
      .input(
        z.object({
          city: z.string().optional(),
          propertyType: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          bedrooms: z.number().optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        const results = await searchProperties(input);
        return results.map((p) => ({
          ...p,
          images: typeof p.images === "string" ? JSON.parse(p.images) : p.images,
        }));
      }),

    // Get user's properties
    getMyProperties: protectedProcedure
      .input(
        z.object({
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const results = await getPropertiesByUserId(ctx.user.id, input.limit || 50, input.offset || 0);
        return results.map((p) => ({
          ...p,
          images: typeof p.images === "string" ? JSON.parse(p.images) : p.images,
        }));
      }),

    // Create property
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(5),
          description: z.string(),
          propertyType: z.enum(["house", "apartment", "land", "commercial", "townhouse"]),
          address: z.string(),
          city: z.string(),
          province: z.string(),
          postalCode: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          bedrooms: z.number().optional(),
          bathrooms: z.number().optional(),
          landSize: z.number().optional(),
          buildingSize: z.number().optional(),
          yearBuilt: z.number().optional(),
          price: z.number(),
          images: z.array(z.string()).min(5, "Minimum 5 photos required"),
          sellerPhone: z.string().optional(),
          sellerWhatsapp: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const property = await createProperty({
          userId: ctx.user.id,
          ...input,
          images: JSON.stringify(input.images),
          imageCount: input.images.length,
          status: "draft",
        });

        return {
          ...property,
          images: input.images,
        };
      }),

    // Update property
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          price: z.number().optional(),
          status: z.enum(["draft", "published", "sold", "archived"]).optional(),
          images: z.array(z.string()).optional(),
          bedrooms: z.number().optional(),
          bathrooms: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const property = await getPropertyById(input.id);
        if (!property) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        if (property.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const updateData: any = { ...input };
        if (input.images) {
          updateData.images = JSON.stringify(input.images);
          updateData.imageCount = input.images.length;
        }
        delete updateData.id;

        await updateProperty(input.id, updateData);
        return { success: true };
      }),
  }),

  /**
   * PAYMENT ROUTERS
   */
  payments: router({
    // Create payment order
    createOrder: protectedProcedure
      .input(
        z.object({
          amount: z.number(),
          subscriptionDays: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const orderId = `ORDER-${ctx.user.id}-${Date.now()}`;

        const payment = await createPayment({
          userId: ctx.user.id,
          amount: input.amount,
          orderId,
          subscriptionDays: input.subscriptionDays || 30,
          status: "pending",
          currency: "IDR",
        });

        return {
          orderId,
          paymentId: payment.id,
          amount: input.amount,
          // In production, generate Midtrans snap token here
        };
      }),

    // Handle payment callback (webhook from Midtrans)
    handleCallback: publicProcedure
      .input(
        z.object({
          orderId: z.string(),
          transactionId: z.string(),
          status: z.enum(["success", "pending", "failed"]),
          amount: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const payment = await getPaymentByTransactionId(input.transactionId);

        if (!payment) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
        }

        if (input.status === "success") {
          await updatePaymentStatus(payment.id, "success", new Date());
          await updateUserSubscription(payment.userId, "active", new Date(Date.now() + payment.subscriptionDays * 24 * 60 * 60 * 1000));
        } else if (input.status === "failed") {
          await updatePaymentStatus(payment.id, "failed");
        }

        return { success: true };
      }),

    // Get payment status
    getStatus: protectedProcedure
      .input(z.object({ orderId: z.string() }))
      .query(async ({ ctx, input }) => {
        // Query payment by orderId
        // This is a simplified version - in production, query from DB
        return { status: "pending" };
      }),
  }),

  /**
   * CONTACT REQUEST ROUTERS
   */
  contacts: router({
    // Request contact info (payment-gated)
    requestContact: protectedProcedure
      .input(
        z.object({
          propertyId: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Check if user has active subscription
        const user = await getUserById(ctx.user.id);
        if (!user || user.subscriptionStatus !== "active") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Premium subscription required to view contact info",
          });
        }

        const property = await getPropertyById(input.propertyId);
        if (!property) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Check if already requested
        let contactRequest = await getContactRequest(ctx.user.id, input.propertyId);
        if (!contactRequest) {
          contactRequest = await createContactRequest(
            ctx.user.id,
            input.propertyId,
            property.sellerPhone || undefined,
            property.sellerWhatsapp || undefined
          );
        }

        // Mark as viewed
        await updateContactRequestStatus(contactRequest.id, "viewed", new Date());

        return {
          phone: contactRequest.sellerPhone,
          whatsapp: contactRequest.sellerWhatsapp,
        };
      }),

    // Get contact request history
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      // Query contact requests for user
      // This is simplified - implement full query in production
      return [];
    }),
  }),

  /**
   * ADMIN ROUTERS
   */
  admin: router({
    // Get all users (admin only)
    getUsers: adminProcedure
      .input(
        z.object({
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
      )
      .query(async () => {
        // Implement user listing
        return [];
      }),

    // Approve property (admin only)
    approveProperty: adminProcedure
      .input(z.object({ propertyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await updateProperty(input.propertyId, { status: "published" });
        await logAdminAction(ctx.user.id, "approve_property", "property", input.propertyId);
        return { success: true };
      }),

    // Reject property (admin only)
    rejectProperty: adminProcedure
      .input(z.object({ propertyId: z.number(), reason: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await updateProperty(input.propertyId, { status: "archived" });
        await logAdminAction(ctx.user.id, "reject_property", "property", input.propertyId, { reason: input.reason });
        return { success: true };
      }),

    // Promote user to seller
    promoteToSeller: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Update user role to seller
        await logAdminAction(ctx.user.id, "promote_to_seller", "user", input.userId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
