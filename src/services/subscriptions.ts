import { ref } from 'vue'
import Stripe from 'stripe'
import { StripeBridge, SubscripionWithPlan } from '../types';
import stripe from './stripe';


const subscriptions = ref<SubscripionWithPlan[]>();
const subscriptionsFetching = ref(false);
const subscriptionUpdating = ref(false);

export async function __fetchSubscriptions(bridge: StripeBridge, dumpProducts = true) {
  subscriptionsFetching.value = true;
  const result = await bridge.subscriptions.list();
  for (const subscription of result) {
    for (const item of subscription.items.data) {
      if (typeof item.price.product === 'string') {
        item.price.product = await __getProduct(bridge, item.price.product)
      }
    }
  }
  
  // await Promise.all((await bridge.subscriptions.list()).map(async subscription => {
  //   for (const item of subscription.items.data) {
  //     if (typeof item.price.product === 'string') {
  //       item.price.product = await __getProduct(bridge, item.price.product)
  //     }
  //   }
  //   return subscription;
  // }));
  subscriptions.value = result;
  subscriptionsFetching.value = false;
  return subscriptions.value;
}

export async function __updateSubscription(bridge: StripeBridge, subscriptionId: string, subscription: Partial<Stripe.Subscription>) {
  subscriptionUpdating.value = true;
  const result = await bridge.subscriptions.set(subscriptionId, subscription);
  subscriptionUpdating.value = false;
  return result;
}

export async function __deleteSubscription(bridge: StripeBridge, subscriptionId: string) {
  subscriptions.value = subscriptions.value?.filter(({ id }) => id !== subscriptionId);
  const result = await bridge.subscriptions.remove(subscriptionId);
  return result;
}

const productCache: { [k: string]: Stripe.Product } = {};

export async function __getProduct(bridge: StripeBridge, productId: string) {
  if (!(productId in productCache)) {
    productCache[productId] = await bridge.product.retrieve(productId);;
  }
  return productCache[productId];
}

export default function useCustomer(bridge: StripeBridge) {
  function fetchSubscriptions() {
    return __fetchSubscriptions(bridge);
  }
  function updateSubscription(subscriptionId: string, subscription: Partial<Stripe.Subscription>) {
    return __updateSubscription(bridge, subscriptionId, subscription);
  }
  function deleteSubscription(subscriptionId: string) {
    return __deleteSubscription(bridge, subscriptionId);
  }
  function getProduct(productId: string) {
    return __getProduct(bridge, productId);
  }


  return {
    subscriptions,
    fetchSubscriptions,
    updateSubscription,
    deleteSubscription,
    subscriptionUpdating,
    subscriptionsFetching,
    getProduct
  }
}