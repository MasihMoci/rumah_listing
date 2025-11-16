/**
 * Midtrans Payment Integration
 * Handles payment processing and webhook callbacks
 */

import crypto from "crypto";

interface MidtransConfig {
  serverKey: string;
  clientKey: string;
  isProduction: boolean;
}

interface SnapTokenRequest {
  orderId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  itemDetails: {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }[];
}

interface TransactionDetails {
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  paymentType: string;
  transactionTime: string;
  transactionStatus: string;
  fraudStatus: string;
}

/**
 * Initialize Midtrans configuration
 * In production, these should come from environment variables
 */
export function getMidtransConfig(): MidtransConfig {
  return {
    serverKey: process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-key",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "SB-Mid-client-key",
    isProduction: process.env.NODE_ENV === "production",
  };
}

/**
 * Generate Snap token for payment
 * In production, call Midtrans API directly
 */
export async function generateSnapToken(request: SnapTokenRequest): Promise<string> {
  const config = getMidtransConfig();

  // For demo purposes, generate a mock token
  // In production, make actual API call to Midtrans
  const mockToken = Buffer.from(JSON.stringify(request)).toString("base64");

  console.log("[Midtrans] Generated snap token for order:", request.orderId);

  return mockToken;
}

/**
 * Verify Midtrans webhook signature
 */
export function verifyWebhookSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signature: string
): boolean {
  const data = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const hash = crypto.createHash("sha512").update(data).digest("hex");

  return hash === signature;
}

/**
 * Process payment callback from Midtrans
 */
export function processPaymentCallback(payload: any): {
  orderId: string;
  status: "success" | "pending" | "failed";
  amount: number;
} {
  const transactionStatus = payload.transaction_status;
  const orderId = payload.order_id;
  const amount = payload.gross_amount;

  let status: "success" | "pending" | "failed" = "pending";

  if (transactionStatus === "capture" || transactionStatus === "settlement") {
    status = "success";
  } else if (transactionStatus === "pending") {
    status = "pending";
  } else if (transactionStatus === "deny" || transactionStatus === "cancel" || transactionStatus === "expire") {
    status = "failed";
  }

  return {
    orderId,
    status,
    amount,
  };
}

/**
 * Create payment request for Midtrans Snap
 */
export function createPaymentRequest(
  orderId: string,
  amount: number,
  customerEmail: string,
  customerName: string,
  description: string
): SnapTokenRequest {
  return {
    orderId,
    amount,
    customerEmail,
    customerName,
    itemDetails: [
      {
        id: "premium-subscription",
        price: amount,
        quantity: 1,
        name: description,
      },
    ],
  };
}

/**
 * Format currency for Midtrans
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}
