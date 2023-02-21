<template>
  <div class="payment-methods control">
    <header>
      <n-h3>
        {{ props.localization?.['payment-methods'] ?? 'Payment Methods'}}
      </n-h3>
      
    </header>
    <n-divider />
    <n-spin :show="paymentMethodsFetching">
      <n-empty v-if="paymentMethods && paymentMethods.length === 0" :description="props.localization?.['payment-methods-empty'] ?? 'No payment methods'">
        <template #icon>
          <n-icon>
            <card-outline />
          </n-icon>
        </template>
      </n-empty>
      <n-list class="payment-methods-list">
        <PaymentMethod v-for="{ id, billing_details, card, type, created } in paymentMethods" :key="id" :card="card" :localization="localization">
          <template #tags>
            <n-tag v-if="customer?.invoice_settings.default_payment_method === id" type="success">{{props.localization?.['default'] ?? 'Default'}}</n-tag>
            <!-- <n-button v-else round ghost size="small" @click="makeDefault(id)">
              {{ props.localization?.['make-default'] ?? 'Make default' }}
            </n-button> -->
          </template>
          <template #actions>
            <n-dropdown :options="options(id).value" @select="(key: string) => onSelect(key, id)">
              <n-button>
                <template #icon>
                  <n-icon>
                    <EllipsisVertical />
                  </n-icon>
                </template>
              </n-button>
            </n-dropdown>
            <!-- <n-button round ghost size="small" type="error" @click="triggerPaymentMethodDeletion(id)">
              <template #icon>
                <n-icon>
                  <close-outline />
                </n-icon>
              </template>
              {{ props.localization?.['remove'] ?? 'Remove' }}
            </n-button> -->
          </template>
        </PaymentMethod>
      </n-list>
      <div class="payment-actions">
        <n-spin :show="creatingCheckoutSession">
          <!-- <n-popup v-model:show="showAddView" title="Add Payment Method" :type="isMobile ? 'layer' : 'frame'" :fixed-width="isMobile ? false : 800" :fixed-height="isMobile ? false : 360">
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
            
          </n-popup> -->
          <n-button ghost round type="success" :loading="creatingCheckoutSession" :disabled="creatingCheckoutSession" @click="createCheckoutSession">
            <template #icon>
              <n-icon>
                <add-outline />
              </n-icon>
            </template>
            {{ props.localization?.['add-payment-method'] ?? 'Add Payment Method'}}
          </n-button>
        </n-spin>
      </div>
    </n-spin>
  </div>
</template>


<script setup lang="ts">
import type { StripeBridge } from '../../types'
import usePaymentMethods from '../../services/paymentMethods'
import { computed, h, ref } from 'vue'
import { NButton, NIcon, NEmpty, NDivider, NH3, NSpin, NList, NTag, useDialog, NDropdown, DropdownOption, MenuOption } from 'naive-ui'
import { EllipsisVertical, CardOutline, CloseOutline, AddOutline } from '@vicons/ionicons5'
import 'naive-tools/style.css'
import useScreen from '../../util/screen'
import useCustomer from '../../services/customer'
import useCheckout from '../../services/checkout'
import Stripe from 'stripe'
import { initStripe } from '../../services/stripe'
import PaymentMethod from '../elements/PaymentMethod.vue'

const props = defineProps<{
  bridge: StripeBridge;
  successUrl: string;
  cancelUrl: string;
  stripePublishableApiKey: string;
  localization?: {
    [key: string]: string;
  };
}>();
const emit = defineEmits(['ready']);

initStripe(props.stripePublishableApiKey);

const dialog = useDialog();

const screen = useScreen();
const isMobile = computed(() => screen.width <= 600);

const { customer, updateCustomer } = useCustomer(props.bridge);
const { paymentMethods, paymentMethodsFetching, fetchPaymentMethods, createSetupIntent, updatePaymentMethod, deletePaymentMethod } = usePaymentMethods(props.bridge);
const { createSession } = useCheckout(props.bridge);

// unused - maybe remove
// const setupIntent = ref<Stripe.SetupIntent>();

// const showAddView = ref(false);
// watch(showAddView, async (newState: any) => {
//   if (newState) {
//     setupIntent.value = await createSetupIntent('off_session');
//   }
// });

const creatingCheckoutSession = ref(false);
const checkoutSession = ref<Stripe.Checkout.Session>();
const createCheckoutSession = async () => {
  creatingCheckoutSession.value = true;
  checkoutSession.value = await createSession(['card', 'sepa_debit'], props.successUrl, props.cancelUrl, 'setup');
  creatingCheckoutSession.value = false;
  if (checkoutSession.value.url) {
    window.location.href = checkoutSession.value.url;
  }
}

defineExpose({
  createCheckoutSession,
});

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

// unused - maybe remove
// const editMode = ref(false);
// const save = async () => {
//   //await updatePaymentMethod();
//   editMode.value = false;
// }

const makeDefault = async (paymentMethodId: string) => {
  if (customer.value) {
    customer.value.invoice_settings.default_payment_method = paymentMethodId;
    await updateCustomer();
  }
  
}

const triggerPaymentMethodDeletion = (paymentMethodId: string) => {
  const deletionDialog = dialog.error({
    title: props.localization?.['delete-payment-method-dialog-title'] ?? 'Delete Payment Method',
    positiveText: props.localization?.['delete-payment-method-dialog-positive'] ?? 'Delete',
    content: props.localization?.['delete-payment-method-dialog-content'] ?? 'This will delete the payment method an all realted data.',
    async onPositiveClick() {
      deletePaymentMethod(paymentMethodId);
      deletionDialog.destroy();
    }
  });
}

// unused - maybe remove
// const onConfirmNewPaymentMethod = async () => {
//   fetchPaymentMethods('card');
//   showAddView.value = false;
// }

const options = (id: string) => computed(() => {
  return [
    {
      key: 'make-default',
      label: props.localization?.['make-default'] ?? 'Make Default',
      disabled: customer.value?.invoice_settings.default_payment_method === id,
    },
    {
      key: 'delete',
      label: props.localization?.['delete'] ?? 'Delete',
      icon: h(CloseOutline),
    }
  ] as DropdownOption[];
})

function onSelect(key: string, id: string) {
  switch(key) {
    case 'make-default':
      makeDefault(id);
      break;
    case 'delete':
      triggerPaymentMethodDeletion(id);
      break;
  }
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