import Stripe from 'stripe'

export type SubscripionWithPlan = Stripe.Subscription & {
  plan: Stripe.Plan;
}

export type StripeBridge = {
  customer: {
    get: () => Promise<Stripe.Customer>;
    set: (customer: Partial<Stripe.Customer>) => Promise<void>;
  },
  setupIntent: {
    create(usae: Stripe.SetupIntentCreateParams.Usage): Promise<Stripe.SetupIntent>;
  },
  checkout: {
    session: {
      create(paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[], successUrl: string, cancelUrl: string, mode: Stripe.Checkout.SessionCreateParams.Mode): Promise<Stripe.Checkout.Session>;
    }
  },
  paymentMethods: {
    get(type: string): Promise<Stripe.PaymentMethod[]>;
    set(paymentMethodId: string, paymentMethod: Partial<Stripe.PaymentMethod>): Promise<void>;
    remove(paymentMethodId: string): Promise<void>;
  },
  subscriptions: {
    list(): Promise<SubscripionWithPlan[]>;
    set(subscriptionId: string, subscription: Partial<Stripe.Subscription>): Promise<SubscripionWithPlan>;
    remove(subscriptionId: string): Promise<void>;
  },
  product: {
    retrieve(productId: string): Promise<Stripe.Product>;
  },
  invoices: {
    list(startingAfter?: string): Promise<Stripe.Invoice[]>;
  }
}