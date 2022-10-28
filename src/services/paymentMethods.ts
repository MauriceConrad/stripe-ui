import { ref } from 'vue'
import Stripe from 'stripe'
import { StripeBridge } from '../types';

const paymentMethods = ref<Stripe.PaymentMethod[]>();
const paymentMethodsFetching = ref(false);
const paymentMethodsUpdating = ref(false);

export async function __fetchPaymentMethods(bridge: StripeBridge, type: Stripe.PaymentMethodListParams.Type) {
  paymentMethodsFetching.value = true;
  paymentMethods.value = await bridge.paymentMethods.get(type);
  paymentMethodsFetching.value = false;
  return paymentMethods.value;
}

export async function __updatePaymentMethod(bridge: StripeBridge, paymentMethodId: string, paymentMethod: Partial<Stripe.PaymentMethod>) {
  if (paymentMethods.value) {
    paymentMethodsUpdating.value = true;
    await bridge.paymentMethods.set(paymentMethodId, paymentMethod);
    paymentMethodsUpdating.value = false;
  }
}

export async function __createSetupIntent(bridge: StripeBridge, usage: Stripe.SetupIntentCreateParams.Usage) {
  return await bridge.setupIntent.create(usage);
}


export async function __deletePaymentMethod(bridge: StripeBridge, paymentMethodId: string) {
  paymentMethods.value = paymentMethods.value?.filter(({ id }) => id !== paymentMethodId);
  const result = await bridge.paymentMethods.remove(paymentMethodId);
  return result;
}

export default function useCustomer(bridge: StripeBridge) {
  function fetchPaymentMethods(type: Stripe.PaymentMethodListParams.Type) {
    return __fetchPaymentMethods(bridge, type);
  }
  function updatePaymentMethod(paymentMethodId: string, paymentMethod: Partial<Stripe.PaymentMethod>) {
    return __updatePaymentMethod(bridge, paymentMethodId, paymentMethod);
  }

  function createSetupIntent(usage: Stripe.SetupIntentCreateParams.Usage) {
    return __createSetupIntent(bridge, usage);
  }


  function deletePaymentMethod(paymentMethodId: string) {
    return __deletePaymentMethod(bridge, paymentMethodId);
  }


  return {
    paymentMethods,
    fetchPaymentMethods,
    updatePaymentMethod,
    paymentMethodsFetching,
    paymentMethodsUpdating,
    createSetupIntent,
    deletePaymentMethod
  }
}