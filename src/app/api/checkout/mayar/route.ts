import { NextRequest, NextResponse } from 'next/server';

/**
 * Checkout API Route for Mayar
 * Creates a checkout session for donations
 *
 * Expected body:
 * {
 *   amount: number,
 *   currency?: 'IDR' | 'USD',
 *   customer: {
 *     name: string,
 *     email: string,
 *     phone?: string
 *   },
 *   metadata?: Record<string, string>
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'IDR', customer, metadata = {} } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!customer?.email || !customer?.name) {
      return NextResponse.json(
        { success: false, error: 'Customer name and email are required' },
        { status: 400 }
      );
    }

    // Get Mayar API credentials from environment
    const mayarApiKey = process.env.MAYAR_API_KEY;
    const mayarMerchantId = process.env.MAYAR_MERCHANT_ID;

    if (!mayarApiKey || !mayarMerchantId) {
      console.error('Mayar credentials not configured');
      return NextResponse.json(
        { success: false, error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    // Create order ID
    const orderId = `donation-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Prepare checkout request
    const checkoutData = {
      merchant_id: mayarMerchantId,
      api_key: mayarApiKey,
      amount: Math.round(amount), // Ensure integer
      currency,
      order_id: orderId,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
      },
      metadata: {
        ...metadata,
        source: 'lentera-ramadhan-app',
        version: '1.0',
      },
      // Redirect URLs (Mayar will handle these)
      // Note: For popup mode, Mayar will show the payment page and then redirect
      // We rely on the popup's message event instead
    };

    // Call Mayar API
    const response = await fetch('https://app.mayar.id/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Mayar API error:', errorData);
      return NextResponse.json(
        { success: false, error: errorData.message || 'Failed to create checkout session' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Mayar should return checkout_url
    if (!data.checkout_url) {
      console.error('Invalid Mayar response:', data);
      return NextResponse.json(
        { success: false, error: 'Invalid payment response' },
        { status: 500 }
      );
    }

    // Success
    return NextResponse.json({
      success: true,
      checkoutUrl: data.checkout_url,
      orderId,
      message: 'Checkout session created successfully',
    });

  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
