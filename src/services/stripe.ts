import { loadStripe, Stripe } from '@stripe/stripe-js'
import { ref } from 'vue'

const stripe = ref<Stripe | null>();
export async function initStripe(apiKey: string) {
  if (stripe.value === undefined) {
    stripe.value = await loadStripe(apiKey);
  }
}

export default stripe;