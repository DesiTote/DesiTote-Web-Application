// Thin wrapper around Razorpay's checkout.js widget, loaded on demand.

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

let scriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load Razorpay checkout. Check your connection and try again.'));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export async function openRazorpayCheckout(params: {
  keyId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  customerName?: string;
  customerEmail?: string;
}): Promise<RazorpaySuccessResponse> {
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: params.keyId,
      amount: params.amount,
      currency: params.currency,
      order_id: params.razorpayOrderId,
      name: 'DesiTotes',
      description: 'Order payment',
      prefill: { name: params.customerName, email: params.customerEmail },
      theme: { color: '#0B1420' },
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error('Payment was cancelled.')),
      },
    });
    rzp.open();
  });
}
