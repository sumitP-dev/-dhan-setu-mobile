import RazorpayCheckout from 'react-native-razorpay';

import {
  CheckoutBusyError,
  openCheckout,
  type CheckoutRequest,
} from '../src/services/razorpayCheckout';

const open = RazorpayCheckout.open as jest.Mock;

const request: CheckoutRequest = {
  keyId: 'rzp_test_abc123',
  orderId: 'order_ABCDEFGH1234',
  customerId: 'cust_ABCDEFGH1234',
  amountPaise: 100,
  description: 'Card check',
};
const signature = 'a'.repeat(64);

beforeEach(() => open.mockReset());

describe('openCheckout', () => {
  it('passes the order, customer and card-only options to Razorpay', async () => {
    open.mockResolvedValue({});
    await openCheckout({ ...request, saveCard: true });
    const options = open.mock.calls[0][0];
    expect(options).toMatchObject({
      key: 'rzp_test_abc123',
      order_id: request.orderId,
      customer_id: request.customerId,
      amount: 100,
      currency: 'INR',
      save: 1,
      method: { card: true, upi: false, netbanking: false, wallet: false },
    });
  });

  it('does not ask to save the card for a normal payment', async () => {
    open.mockResolvedValue({});
    await openCheckout(request);
    expect(open.mock.calls[0][0]).not.toHaveProperty('save');
  });

  it('returns the ids and signature when checkout completes', async () => {
    open.mockResolvedValue({
      razorpay_payment_id: 'pay_ABCDEFGH1234',
      razorpay_order_id: request.orderId,
      razorpay_signature: signature,
    });
    await expect(openCheckout(request)).resolves.toEqual({
      kind: 'completed',
      paymentId: 'pay_ABCDEFGH1234',
      orderId: request.orderId,
      signature,
    });
  });

  it.each([
    [
      'a malformed payment id',
      { razorpay_payment_id: '../x', razorpay_signature: signature },
    ],
    [
      'a malformed signature',
      { razorpay_payment_id: 'pay_ABCDEFGH1234', razorpay_signature: 'nope' },
    ],
    [
      'a different order',
      {
        razorpay_payment_id: 'pay_ABCDEFGH1234',
        razorpay_order_id: 'order_OTHER0000000',
        razorpay_signature: signature,
      },
    ],
    ['nothing', undefined],
  ])('does not report success for %s', async (_label, data) => {
    open.mockResolvedValue(data);
    const result = await openCheckout(request);
    expect(result.kind).toBe('failed');
  });

  it('treats a closed checkout as cancelled', async () => {
    open.mockRejectedValue({ code: 0, description: 'Payment cancelled' });
    await expect(openCheckout(request)).resolves.toEqual({ kind: 'cancelled' });
  });

  it('reads the cancelled reason from a JSON description', async () => {
    open.mockRejectedValue({
      code: 2,
      description: JSON.stringify({
        error: {
          reason: 'payment_cancelled',
          description: 'Cancelled by user',
        },
      }),
    });
    await expect(openCheckout(request)).resolves.toEqual({ kind: 'cancelled' });
  });

  it('returns a readable message when the payment fails', async () => {
    open.mockRejectedValue({
      code: 2,
      description: JSON.stringify({
        error: {
          reason: 'card_declined',
          description: 'Your card was declined',
        },
      }),
    });
    await expect(openCheckout(request)).resolves.toEqual({
      kind: 'failed',
      message: 'Your card was declined',
    });
  });

  it('refuses to open a second checkout while one is open', async () => {
    let finish: (value: unknown) => void = () => {};
    open.mockReturnValue(new Promise(resolve => (finish = resolve)));
    const first = openCheckout(request);
    await expect(openCheckout(request)).rejects.toBeInstanceOf(
      CheckoutBusyError,
    );
    finish({});
    await first;
    open.mockResolvedValue({});
    await expect(openCheckout(request)).resolves.toBeDefined();
  });
});
