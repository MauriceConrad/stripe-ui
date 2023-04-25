import { StripeBridge } from "../types";
import Stripe from "stripe";

export default function useCheckout(bridge: StripeBridge) {
  async function createSession(successUrl: string, cancelUrl: string, mode: Stripe.Checkout.SessionCreateParams.Mode) {
    return await bridge.checkout.session.create(successUrl, cancelUrl, mode);
  }

  return {
    createSession,
  };
}
