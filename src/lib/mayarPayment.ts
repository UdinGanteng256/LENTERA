'use client';

interface MayarPaymentOptions {
  paymentLinkId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  metadata?: Record<string, string>;
  onSuccess?: (paymentId: string) => void;
  onFailed?: (error: string) => void;
  onCancelled?: () => void;
}



/**
 * Handle Mayar Payment with aesthetic loading state
 * Supports both direct payment links and checkout sessions
 */
export const handleMayarPayment = async (
  amount: number,
  options: MayarPaymentOptions = {}
): Promise<{ success: boolean; paymentId?: string; error?: string }> => {
  const {
    paymentLinkId,
    customerName = 'Anonymous Donor',
    customerEmail = '',
    customerPhone = '',
    metadata = {},
    onSuccess,
    onFailed,
    onCancelled,
  } = options;

  // Validate amount
  if (amount <= 0) {
    const error = 'Invalid amount';
    onFailed?.(error);
    return { success: false, error };
  }

  // Show loading state (this will be handled by the caller component)
  // We'll emit a custom event that the UI can listen to
  const loadingEvent = new CustomEvent('mayar-payment-start', {
    detail: { amount }
  });
  window.dispatchEvent(loadingEvent);

  try {
    let paymentUrl: string;

    if (paymentLinkId) {
      // Direct payment link format: https://mayar.id/link/{paymentLinkId}
      paymentUrl = `https://mayar.id/link/${paymentLinkId}`;

      // Append query params if we have customer info
      const params = new URLSearchParams();
      if (customerName) params.append('customer_name', customerName);
      if (customerEmail) params.append('customer_email', customerEmail);
      if (customerPhone) params.append('customer_phone', customerPhone);

      const queryString = params.toString();
      if (queryString) {
        paymentUrl += `?${queryString}`;
      }
    } else {
      // Create a checkout session via API
      const response = await fetch('/api/checkout/mayar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'IDR',
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
          },
          metadata: {
            ...metadata,
            source: 'lentera-app',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();

      if (!data.checkout_url) {
        throw new Error('Invalid response from checkout API');
      }

      paymentUrl = data.checkout_url;
    }

    // Open payment window with specific features for better UX
    const width = 500;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      paymentUrl,
      'MayarPayment',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );

    if (!popup) {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }

    // Listen for payment completion
    const handleMessage = (event: MessageEvent) => {
      // Verify origin in production
      // if (event.origin !== 'https://app.mayar.id') return;

      if (event.data?.type === 'mayar-payment-success') {
        const { payment_id, order_id } = event.data;
        onSuccess?.(payment_id);
        dispatchPaymentEvent('success', { paymentId: payment_id, orderId: order_id });
        window.removeEventListener('message', handleMessage);
        popup.close();
      } else if (event.data?.type === 'mayar-payment-failed') {
        const { error } = event.data;
        onFailed?.(error);
        dispatchPaymentEvent('failed', { error });
        window.removeEventListener('message', handleMessage);
        popup.close();
      } else if (event.data?.type === 'mayar-payment-cancelled') {
        onCancelled?.();
        dispatchPaymentEvent('cancelled');
        window.removeEventListener('message', handleMessage);
        popup.close();
      }
    };

    window.addEventListener('message', handleMessage);

    // Also poll for window close (as backup)
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        // If we haven't received a success/failed event, consider it cancelled
        dispatchPaymentEvent('cancelled');
      }
    }, 500);

    // Hide loading state after window opens
    const hideLoadingEvent = new CustomEvent('mayar-payment-end');
    window.dispatchEvent(hideLoadingEvent);

    return { success: true };

  } catch (error) {
    // Hide loading state on error
    const hideLoadingEvent = new CustomEvent('mayar-payment-end');
    window.dispatchEvent(hideLoadingEvent);

    const errorMessage = error instanceof Error ? error.message : 'Payment failed';
    onFailed?.(errorMessage);

    return { success: false, error: errorMessage };
  }
};

/**
 * Dispatch payment event for global state management
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dispatchPaymentEvent = (status: 'success' | 'failed' | 'cancelled', data?: any) => {
  const event = new CustomEvent('mayar-payment-complete', {
    detail: { status, ...data, timestamp: new Date().toISOString() }
  });
  window.dispatchEvent(event);
};

/**
 * Quick donation function for predefined amounts
 */
export const quickDonate = async (
  packageId: number,
  onSuccess?: (paymentId: string) => void
) => {
  const donationPackages = {
    1: { amount: 10000, title: 'Paket Takjil', paymentLinkId: 'paket-takjil' },
    2: { amount: 35000, title: 'Iftar Berjamaah', paymentLinkId: 'iftar-berjamaah' },
    3: { amount: 100000, title: 'Mushaf Al-Quran', paymentLinkId: 'mushaf-quran' },
  };

  const pkg = donationPackages[packageId as keyof typeof donationPackages];
  if (!pkg) {
    throw new Error('Invalid donation package');
  }

  return handleMayarPayment(pkg.amount, {
    paymentLinkId: pkg.paymentLinkId,
    metadata: {
      packageId: String(packageId),
      packageTitle: pkg.title,
    },
    onSuccess,
    onFailed: (error) => console.error('Donation failed:', error),
    onCancelled: () => console.log('Donation cancelled'),
  });
};
