import { NextRequest, NextResponse } from 'next/server';
import {
  MayarWebhookPayload,
  MayarEventType,
  verifyWebhookSignature,
  calculateSkorKeberkahan,
  mapPaymentStatus,
} from '@/lib/mayar';

const MAYAR_WEBHOOK_SECRET = process.env.MAYAR_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!MAYAR_WEBHOOK_SECRET) {
    console.error('MAYAR_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { success: false, message: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-mayar-signature') || '';

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(
      rawBody,
      signature,
      MAYAR_WEBHOOK_SECRET
    );

    if (!isValid) {
      console.warn('Invalid webhook signature');
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload: MayarWebhookPayload = JSON.parse(rawBody);

    // Handle different event types
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

  // Extract user ID from metadata (passed during checkout)
  const userId = payment.metadata?.userId;
  if (!userId) {
    console.error('No userId in payment metadata');
    return;
  }

  // Calculate Skor Keberkahan
  const skorKeberkahan = calculateSkorKeberkahan(
    payment.amount,
    payment.payment_method
  );

  // Create donation record
  const donation = {
    id: crypto.randomUUID(),
    userId,
    paymentId: payment.id,
    orderId: payment.order_id,
    amount: payment.amount,
    currency: payment.currency,
    paymentMethod: payment.payment_method,
    status: mapPaymentStatus(payment.status),
    donorName: payment.customer.name,
    donorEmail: payment.customer.email,
    donorPhone: payment.customer.phone,
    metadata: payment.metadata,
    paidAt: payment.paid_at ? new Date(payment.paid_at) : undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // TODO: Save to database
  // await db.donation.create({ data: donation });

  // TODO: Update user's Skor Keberkahan
  // await db.user.update({
  //   where: { id: userId },
  //   data: {
  //     skorKeberkahan: { increment: skorKeberkahan },
  //     donations: { connect: { id: donation.id } }
  //   }
  // });

  console.log('Payment success:', {
    donationId: donation.id,
    skorKeberkahan,
    userId,
    amount: payment.amount,
  });
}

async function handlePaymentFailed(payload: MayarWebhookPayload) {
  const { payment } = payload.data;
  console.log('Payment failed:', {
    orderId: payment.order_id,
    reason: payment.failure_reason,
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
