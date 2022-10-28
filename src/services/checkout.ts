import { StripeBridge } from '../types'
import Stripe from 'stripe'



export default function useCheckout(bridge: StripeBridge) {
  async function createSession(paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[], successUrl: string, cancelUrl: string) {
    return await bridge.checkout.session.create(paymentMethodTypes, successUrl, cancelUrl);
  }

  return {
    createSession
  }
}