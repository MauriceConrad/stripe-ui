import { ref } from 'vue'
import Stripe from 'stripe'
import { StripeBridge } from '../types';

const customer = ref<Stripe.Customer>();
const customerFetching = ref(false);
const customerUpdating = ref(false);

export async function __fetchCustomer(bridge: StripeBridge) {
  customerFetching.value = true;
  customer.value = await bridge.customer.get();
  customerFetching.value = false;
  return customer.value;
}

export async function __updateCustomer(bridge: StripeBridge) {
  if (customer.value) {
    customerUpdating.value = true;
    await bridge.customer.set(customer.value);
    customerUpdating.value = false;
  }
}

export default function useCustomer(bridge: StripeBridge) {
  function fetchCustomer() {
    return __fetchCustomer(bridge);
  }
  function updateCustomer() {
    return __updateCustomer(bridge);
  }


  return {
    customer,
    fetchCustomer,
    updateCustomer,
    customerUpdating,
    customerFetching
  }
}