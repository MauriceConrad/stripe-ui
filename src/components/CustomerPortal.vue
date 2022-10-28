<template>
  <div class="customer-portal">
    <n-scrollbar>
      <div class="content" :class="{ hidden: readyState < 4 }">
      <div class="view view-subscriptions">
        <Subscriptions :bridge="bridge" @ready="readyState++" />
      </div>
      <div class="view view-payment-methods">
        <PaymentMethods :bridge="bridge" :success-url="checkoutSessionSuccessUrl" :cancel-url="checkoutSessionCancelUrl" @ready="readyState++" :stripe-publishable-api-key="stripePublishableApiKey" />
      </div>
      <div class="view view-customer">
        <CustomerAddress :bridge="bridge" @ready="readyState++" />
      </div>
      <div class="view view-customer">
        <Invoices :bridge="bridge" @ready="readyState++" />
      </div>
    </div>
    <div v-if="readyState < 4" class="spinner-wrapper">
      <n-spin />
    </div>
    </n-scrollbar>
  </div>
</template>

<script setup lang="ts">
import type { StripeBridge } from '../types'
import CustomerAddress from './controls/CustomerAddress.vue'
import PaymentMethods from './controls/PaymentMethods.vue'
import Subscriptions from './controls/Subscriptions.vue'
import Invoices from './controls/Invoices.vue'
import { ref } from 'vue'
import { NSpin, NScrollbar } from 'naive-ui'

const props = defineProps<{
  bridge: StripeBridge;
  checkoutSessionSuccessUrl: string;
  checkoutSessionCancelUrl: string;
  stripePublishableApiKey: string;
}>();

const readyState = ref(0);

</script>


<style scoped lang="scss">
.customer-portal {
  font-family: sans-serif;
  position: relative;
  > * {
    
  }
  .content {
    transition: opacity .5s;
  }
  .content.hidden {
    opacity: 0;
  }
  .spinner-wrapper {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    display: grid;
    place-items: center;
  }
}
.view {
  padding: 20px;
}
</style>