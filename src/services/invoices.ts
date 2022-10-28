import { ref } from 'vue'
import Stripe from 'stripe'
import { StripeBridge } from '../types';

const invoices = ref<Stripe.Invoice[]>();
const invoicesFetching = ref(false);
const paymentMethodsUpdating = ref(false);

export async function __fetchInvoices(bridge: StripeBridge, startingAfter?: string) {
  invoicesFetching.value = true;
  if (startingAfter && invoices.value) {
    const startingAfterInvoice = invoices.value.find(({ id }) => id === startingAfter);
    const startingAfterInvoiceIndex = startingAfterInvoice ? invoices.value.indexOf(startingAfterInvoice) : 0;
    invoices.value = [
      ...invoices.value?.slice(0, startingAfterInvoiceIndex),
      ...await bridge.invoices.list(startingAfter)
    ]
  }
  else {
    invoices.value = await bridge.invoices.list();
  }
  invoicesFetching.value = false;
  return invoices.value;
}

export async function __updateInvoice(bridge: StripeBridge, paymentMethodId: string, paymentMethod: Partial<Stripe.PaymentMethod>) {
  if (invoices.value) {
    paymentMethodsUpdating.value = true;
    await bridge.paymentMethods.set(paymentMethodId, paymentMethod);
    paymentMethodsUpdating.value = false;
  }
}

export async function __createSetupIntent(bridge: StripeBridge, usage: Stripe.SetupIntentCreateParams.Usage) {
  return await bridge.setupIntent.create(usage);
}


export async function __deletePaymentMethod(bridge: StripeBridge, paymentMethodId: string) {
  invoices.value = invoices.value?.filter(({ id }) => id !== paymentMethodId);
  const result = await bridge.paymentMethods.remove(paymentMethodId);
  return result;
}

export default function useInvoices(bridge: StripeBridge) {
  function fetchInvoices(startingAfter?: string) {
    return __fetchInvoices(bridge, startingAfter);
  }
  function updateInvoice(paymentMethodId: string, paymentMethod: Partial<Stripe.PaymentMethod>) {
    return __updateInvoice(bridge, paymentMethodId, paymentMethod);
  }


  return {
    invoices,
    fetchInvoices,
    updateInvoice,
    invoicesFetching
  }
}