<template>
  <div class="payment-methods control">
    <header>
      <n-h3>
        Payment Methods
      </n-h3>
      
    </header>
    <n-divider />
    <n-spin :show="paymentMethodsFetching">
      <n-list class="payment-methods-list">
        <PaymentMethod v-for="{ id, billing_details, card, type, created } in paymentMethods" :key="id" :card="card">
          <template #tags>
            <n-tag v-if="customer?.invoice_settings.default_payment_method === id" type="success">Default</n-tag>
          </template>
          <template #actions>
            <n-button circle size="small" quaternary type="error" @click="triggerPaymentMethodDeletion(id)">
              <template #icon>
                <n-icon>
                  <close-outline />
                </n-icon>
              </template>
            </n-button>
          </template>
        </PaymentMethod>
      </n-list>
      <div class="payment-actions">
        <n-spin :show="creatingCheckoutSession">
          <n-popup v-model:show="showAddView" title="Add Payment Method" :type="isMobile ? 'layer' : 'frame'" :fixed-width="isMobile ? false : 800" :fixed-height="isMobile ? false : 360">
            <template #trigger>
              <n-button round type="success">
                <template #icon>
                  <n-icon>
                    <add-outline />
                  </n-icon>
                </template>
                Add Payment Method
              </n-button>
            </template>
            <div class="popup-inner">
              <SetupIntent v-if="setupIntent && setupIntent.client_secret !== null" :client-secret="setupIntent.client_secret" :redirect-url="props.successUrl"  :stripe-publishable-api-key="stripePublishableApiKey" @confirm="onConfirmNewPaymentMethod" />
              <div v-else class="spinner-wrapper" :style="{ height: isMobile ? '100%' : '240px' }">
                {{ checkoutSession }}
                <n-spin />
              </div>
            </div>
            
          </n-popup>
          <n-button round text type="success" :disabled="creatingCheckoutSession" @click="createCheckoutSession">
            Add via Stripe
          </n-button>
        </n-spin>
      </div>
    </n-spin>
  </div>
</template>


<script setup lang="ts">
import type { StripeBridge } from '../../types'
import usePaymentMethods from '../../services/paymentMethods'
import { computed, ref, watch, watchEffect } from 'vue'
import propToComputed from '../../controllers/propToComputed'
import { NButton, NIcon, NForm, NFormItem, NDivider, NH3, NInput, NSpace, NSpin, NList, NListItem, NTag, useDialog } from 'naive-ui'
import { CreateOutline, ArrowBackOutline, SaveOutline, TrashOutline, PricetagOutline, CloseOutline, AddOutline } from '@vicons/ionicons5'
// @ts-expect-error no types
import { NPopup } from 'naive-tools'
import 'naive-tools/style.css'
import useScreen from '../../util/screen'
import useCustomer from '../../services/customer'
import useCheckout from '../../services/checkout'
import Stripe from 'stripe'
import { StripeElement, StripeElements } from '@stripe/stripe-js'
import stripe, { initStripe } from '../../services/stripe'
import SetupIntent from './SetupIntent.vue'
import PaymentMethod from '../elements/PaymentMethod.vue'

const props = defineProps<{
  bridge: StripeBridge;
  successUrl: string;
  cancelUrl: string;
  stripePublishableApiKey: string;
}>();
const emit = defineEmits(['ready']);

initStripe(props.stripePublishableApiKey);


const dialog = useDialog();

const screen = useScreen();
const isMobile = computed(() => screen.width <= 600);

const { customer, updateCustomer } = useCustomer(props.bridge);
const { paymentMethods, paymentMethodsFetching, fetchPaymentMethods, createSetupIntent, updatePaymentMethod, deletePaymentMethod } = usePaymentMethods(props.bridge);
const { createSession } = useCheckout(props.bridge);

const setupIntent = ref<Stripe.SetupIntent>();

const showAddView = ref(false);
watch(showAddView, async newState => {
  if (newState) {
    setupIntent.value = await createSetupIntent('off_session');
    
    
  }
});

const creatingCheckoutSession = ref(false);
const checkoutSession = ref<Stripe.Checkout.Session>();
const createCheckoutSession = async () => {
  creatingCheckoutSession.value = true;
  checkoutSession.value = await createSession(['card', 'sepa_debit'], props.successUrl, props.cancelUrl);
  creatingCheckoutSession.value = false;
  if (checkoutSession.value.url) {
    window.location.href = checkoutSession.value.url;
  }
}


// const address = computed({
//   get() {
//     return customer.value?.address;
//   },
//   set() {

//   }
// })



fetchPaymentMethods('card').then(() => {
  emit('ready');
});

if (paymentMethods.value && paymentMethods.value[0].card?.brand === '') {
  
}


const editMode = ref(false);
const save = async () => {
  //await updatePaymentMethod();
  editMode.value = false;
}

const makeDefault = async (paymentMethodId: string) => {
  if (customer.value) {
    customer.value.invoice_settings.default_payment_method = paymentMethodId;
    await updateCustomer();
  }
  
}

const triggerPaymentMethodDeletion = (paymentMethodId: string) => {
  const deletionDialog = dialog.error({
    title: 'Delete Payment Method',
    positiveText: 'Delete',
    content: 'This will delete the payment method an all realted data.',
    async onPositiveClick() {
      deletePaymentMethod(paymentMethodId);
      deletionDialog.destroy();
    }
  });
}

const onConfirmNewPaymentMethod = async () => {
  fetchPaymentMethods('card');
  showAddView.value = false;
}


</script>

<style scoped lang="scss">
@import "../../style/control.scss";
@import "../../style/spinner.scss";

.payment-actions {
  padding: 20px 0;
  .n-button {
    width: 100%;
    margin: 5px 0;
  }
  .n-popup__root {
    ::v-deep(.trigger-wrapper) {
      width: 100%;
    }
  }
}
.popup-inner {
  padding: 20px;
}
.spinner-wrapper {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  
}
.n-list {
  background-color: transparent;
  .n-list-item {
    padding: 10px 20px;
  }
}
</style>