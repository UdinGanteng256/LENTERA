/**
 * Mayar Payment Webhook Handler
 * 
 * Schema dan handler untuk webhook Mayar.id
 * Dokumentasi: https://docs.mayar.id/
 */

export enum MayarEventType {
  PAYMENT_SUCCESS = 'payment.success',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_PENDING = 'payment.pending',
  PAYMENT_REFUNDED = 'payment.refunded',
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_CANCELLED = 'subscription.cancelled',
}

export enum MayarPaymentStatus {
  SUCCESS = 'success',
  PENDING = 'pending',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum MayarPaymentMethod {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  EWALLET = 'ewallet',
  RETAIL = 'retail',
}

/**
 * Webhook payload dari Mayar
 */
export interface MayarWebhookPayload {
  id: string;
  type: MayarEventType;
  created_at: string;
  data: {
    payment: {
      id: string;
      order_id: string;
      status: MayarPaymentStatus;
      amount: number;
      currency: string;
      payment_method: MayarPaymentMethod;
      customer: {
        id: string;
        name: string;
        email: string;
        phone?: string;
      };
      metadata?: Record<string, string>;
      paid_at?: string;
      failure_reason?: string;
    };
  };
  signature: string;
}

/**
 * Data donasi yang akan disimpan ke database
 */
export interface DonationRecord {
  id: string;
  userId: string;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: MayarPaymentMethod;
  status: MayarPaymentStatus;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  metadata?: Record<string, string>;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Response untuk webhook handler
 */
export interface WebhookResponse {
  success: boolean;
  message: string;
  data?: {
    donationId: string;
    skorKeberkahanAdded: number;
    totalSkorKeberkahan: number;
  };
}

/**
 * Calculate Skor Keberkahan based on donation amount
 * Formula: Base score + bonus untuk amount tertentu
 */
export function calculateSkorKeberkahan(amount: number, paymentMethod: MayarPaymentMethod): number {
  const baseScore = Math.floor(amount / 1000); // 1 poin per Rp 1.000
  
  // Bonus untuk payment method tertentu (misal: auto-debit)
  const methodBonus: Record<MayarPaymentMethod, number> = {
    [MayarPaymentMethod.CARD]: 1.2,
    [MayarPaymentMethod.BANK_TRANSFER]: 1.0,
    [MayarPaymentMethod.EWALLET]: 1.1,
    [MayarPaymentMethod.RETAIL]: 1.0,
  };
  
  // Bonus multiplier untuk amount besar
  let amountMultiplier = 1.0;
  if (amount >= 1000000) amountMultiplier = 1.5; // 50% bonus untuk >= 1jt
  else if (amount >= 500000) amountMultiplier = 1.25; // 25% bonus untuk >= 500rb
  else if (amount >= 100000) amountMultiplier = 1.1; // 10% bonus untuk >= 100rb
  
  return Math.floor(baseScore * methodBonus[paymentMethod] * amountMultiplier);
}

/**
 * Verify webhook signature from Mayar
 * Implementasi sesuai dokumentasi Mayar
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  webhookSecret: string
): Promise<boolean> {
  const crypto = await import('crypto');
  
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Map Mayar payment status to internal status
 */
export function mapPaymentStatus(status: MayarPaymentStatus): 'completed' | 'pending' | 'failed' | 'refunded' {
  switch (status) {
    case MayarPaymentStatus.SUCCESS:
      return 'completed';
    case MayarPaymentStatus.PENDING:
      return 'pending';
    case MayarPaymentStatus.FAILED:
      return 'failed';
    case MayarPaymentStatus.REFUNDED:
      return 'refunded';
    default:
      return 'pending';
  }
}

/**
 * Example API Route Handler (Next.js App Router)
 * Save this as: src/app/api/webhooks/mayar/route.ts
 */
export const webhookHandlerCode = `
import { NextRequest, NextResponse } from 'next/server';
import { 
  MayarWebhookPayload, 
  MayarEventType, 
  verifyWebhookSignature,
  calculateSkorKeberkahan,
  mapPaymentStatus,
  DonationRecord 
} from '@/lib/mayar';

const MAYAR_WEBHOOK_SECRET = process.env.MAYAR_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-mayar-signature') || '';
    
    // 1. Verify webhook signature
    const isValid = await verifyWebhookSignature(rawBody, signature, MAYAR_WEBHOOK_SECRET);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    const payload: MayarWebhookPayload = JSON.parse(rawBody);
    
    // 2. Handle different event types
    switch (payload.type) {
      case MayarEventType.PAYMENT_SUCCESS:
        await handlePaymentSuccess(payload);
        break;
      case MayarEventType.PAYMENT_FAILED:
        await handlePaymentFailed(payload);
        break;
      case MayarEventType.PAYMENT_PENDING:
        await handlePaymentPending(payload);
        break;
      case MayarEventType.PAYMENT_REFUNDED:
        await handlePaymentRefunded(payload);
        break;
      default:
        console.log('Unhandled event type:', payload.type);
    }
    
    return NextResponse.json({ success: true, received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, message: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(payload: MayarWebhookPayload) {
  const { payment } = payload.data;
  
  // 1. Extract user ID from metadata (passed during checkout)
  const userId = payment.metadata?.userId;
  if (!userId) {
    console.error('No userId in payment metadata');
    return;
  }
  
  // 2. Calculate Skor Keberkahan
  const skorKeberkahan = calculateSkorKeberkahan(
    payment.amount,
    payment.payment_method
  );
  
  // 3. Create donation record in database
  const donation: DonationRecord = {
    id: crypto.randomUUID(),
    userId,
    paymentId: payment.id,
    orderId: payment.order_id,
    amount: payment.amount,
    currency: payment.currency,
    paymentMethod: payment.payment_method,
    status: payment.status,
    donorName: payment.customer.name,
    donorEmail: payment.customer.email,
    donorPhone: payment.customer.phone,
    metadata: payment.metadata,
    paidAt: payment.paid_at ? new Date(payment.paid_at) : undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // TODO: Save to database (Prisma, Drizzle, etc.)
  // await db.donation.create({ data: donation });
  
  // 4. Update user's Skor Keberkahan
  // TODO: Update user score
  // await db.user.update({
  //   where: { id: userId },
  //   data: {
  //     skorKeberkahan: { increment: skorKeberkahan },
  //     donations: { connect: { id: donation.id } }
  //   }
  // });
  
  // 5. Optional: Send notification (email, push, etc.)
  // await sendDonationSuccessNotification(userId, donation, skorKeberkahan);
  
  console.log('Payment success:', {
    donationId: donation.id,
    skorKeberkahan,
    userId
  });
}

async function handlePaymentFailed(payload: MayarWebhookPayload) {
  const { payment } = payload.data;
  console.log('Payment failed:', {
    orderId: payment.order_id,
    reason: payment.failure_reason
  });
  // TODO: Update donation status to failed
}

async function handlePaymentPending(payload: MayarWebhookPayload) {
  const { payment } = payload.data;
  console.log('Payment pending:', { orderId: payment.order_id });
  // TODO: Update donation status to pending
}

async function handlePaymentRefunded(payload: MayarWebhookPayload) {
  const { payment } = payload.data;
  console.log('Payment refunded:', { orderId: payment.order_id });
  // TODO: Update donation status to refunded
  // TODO: Deduct Skor Keberkahan if needed
}
`;

/**
 * Example: Passing metadata during checkout
 */
export const checkoutExampleCode = `
// When creating checkout session with Mayar
const createCheckoutSession = async (userId: string, amount: number) => {
  const response = await fetch('https://app.mayar.id/api/checkout', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${process.env.MAYAR_API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency: 'IDR',
      order_id: \`donation-\${userId}-\${Date.now()}\`,
      customer: {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      // IMPORTANT: Pass userId in metadata for webhook
      metadata: {
        userId,
        type: 'donation',
        campaign: 'ramadhan2026',
      },
      webhook_url: 'https://lentera-ramadhan.com/api/webhooks/mayar',
    }),
  });
  
  return response.json();
};
`;
