import RazorpayCheckout from 'react-native-razorpay';

// Card details are typed into Razorpay's screen and never reach the app. The result is
// only a hint: the backend verifies it with Razorpay before it counts.

export type CheckoutRequest = {
  keyId: string; // from the backend, never hard-coded
  orderId: string;
  customerId: string;
  amountPaise: number;
  description: string;
  saveCard?: boolean; // used when adding a card
  prefill?: { name?: string; email?: string; contact?: string };
};

export type CheckoutResult =
  | { kind: 'completed'; paymentId: string; orderId: string; signature: string }
  | { kind: 'cancelled' }
  | { kind: 'failed'; message: string };

const PAYMENT_ID_RE = /^pay_[A-Za-z0-9]{8,40}$/;
const SIGNATURE_RE = /^[0-9a-f]{64}$/;
const BRAND_COLOR = '#0B6E4F';

// The native module keeps one set of listeners, so two open checkouts would
// receive each other's results.
let inFlight = false;

export class CheckoutBusyError extends Error {
  constructor() {
    super('Checkout is already open');
    this.name = 'CheckoutBusyError';
  }
}

export async function openCheckout(
  request: CheckoutRequest,
): Promise<CheckoutResult> {
  if (inFlight) {
    throw new CheckoutBusyError();
  }
  inFlight = true;
  try {
    const data = await RazorpayCheckout.open({
      key: request.keyId,
      order_id: request.orderId,
      customer_id: request.customerId,
      amount: request.amountPaise,
      currency: 'INR',
      name: 'Dhan Setu',
      description: request.description,
      prefill: request.prefill,
      readonly: { email: true, contact: true },
      // Card only: other methods would not match the card the user picked.
      method: {
        card: true,
        netbanking: false,
        upi: false,
        wallet: false,
        emi: false,
        paylater: false,
      },
      ...(request.saveCard ? { save: 1 } : {}),
      theme: { color: BRAND_COLOR },
    });
    return toCompleted(data, request.orderId);
  } catch (error) {
    return toFailure(error);
  } finally {
    inFlight = false;
  }
}

function toCompleted(data: unknown, orderId: string): CheckoutResult {
  const record = (data ?? {}) as Record<string, unknown>;
  const paymentId = record.razorpay_payment_id;
  const signature = record.razorpay_signature;
  const returnedOrderId = record.razorpay_order_id ?? orderId;
  // Malformed or for another order: don't send it for verification.
  if (
    typeof paymentId !== 'string' ||
    !PAYMENT_ID_RE.test(paymentId) ||
    typeof signature !== 'string' ||
    !SIGNATURE_RE.test(signature) ||
    returnedOrderId !== orderId
  ) {
    return { kind: 'failed', message: 'Could not confirm the payment.' };
  }
  return { kind: 'completed', paymentId, orderId, signature };
}

// Android reports a closed checkout as code 0; both platforms set this reason.
const CANCELLED_CODE = 0;
const CANCELLED_REASON = 'payment_cancelled';

function toFailure(error: unknown): CheckoutResult {
  const record = (error ?? {}) as Record<string, unknown>;
  const details = parseDescription(record.description);
  const reason = record.reason ?? details.reason;
  if (record.code === CANCELLED_CODE || reason === CANCELLED_REASON) {
    return { kind: 'cancelled' };
  }
  return {
    kind: 'failed',
    message: details.description ?? 'The payment did not go through.',
  };
}

// The error description is sometimes a JSON string from Razorpay's API.
function parseDescription(value: unknown): {
  reason?: unknown;
  description?: string;
} {
  if (typeof value !== 'string') {
    return {};
  }
  try {
    const parsed = JSON.parse(value) as { error?: Record<string, unknown> };
    const inner = parsed.error ?? {};
    return {
      reason: inner.reason,
      description:
        typeof inner.description === 'string' ? inner.description : undefined,
    };
  } catch {
    return { description: value };
  }
}
