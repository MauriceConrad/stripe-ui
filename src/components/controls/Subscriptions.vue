<template>
  <div class="subscriptions control">
    <header>
      <n-h3>
        {{ props.localization?.['sub'] ?? 'Subscriptions'}}
      </n-h3>
      
    </header>
    <n-divider />
    <n-spin :show="subscriptionsFetching">
      <div class="subscription-cards">
        <n-empty v-if="subscriptions && subscriptions.length === 0" description="No active subscriptions">
          <template #icon>
            <n-icon>
              <document-text-outline />
            </n-icon>
          </template>
        </n-empty>
        <n-card v-for="{ id, items, description, default_payment_method, metadata, status, plan } in subscriptions" :key="id" :title="items.data.map(item => (item.price.product as Stripe.Product).name).join(' + ')">
          <template #header-extra>
            <n-space>
              <n-button tertiary @click="triggerCanceling(id)">
                <template #icon>
                  <n-icon>
                    <close-outline />
                  </n-icon>
                </template>
                {{props.localization?.['cancel'] ?? 'Cancel'}}
              </n-button>
            </n-space>
          </template>
          <n-popover v-if="showMetadata && Object.keys(metadata).length > 0" trigger="click">
            <template #trigger>
              <n-button text size="tiny">
                Metadata
              </n-button>
            </template>
            <n-table :bordered="false" :single-line="false" class="metadata-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(value, key) in metadata" :key="key">
                  <td>{{ key }}</td>
                  <td>{{ value }}</td>
                </tr>
              </tbody>
            </n-table>
          </n-popover>
          <div class="description">
            {{ description }}
          </div>
          
          <div class="price-wrapper">
            <div class="price">
              {{ plan.amount ? toPriceStr(plan.amount / 100, plan.currency) : '?' }}
            </div>
            <div class="description">
              {{ props.localization?.['per'] ?? 'per'}} {{ plan.interval }}
            </div>
          </div>
          <div class="status">
            <n-tag :type="status === 'active' ? 'success' : 'error'">{{ status }}</n-tag>
          </div>
          <div v-if="paymentMethods?.find(({ id }) => id === default_payment_method)" class="payment-method">
            <n-list>
              <PaymentMethod :card="paymentMethods?.find(({ id }) => id === default_payment_method)?.card" :show-expiration-date="false" />
            </n-list>
          </div>
        </n-card>
      </div>
    </n-spin>
  </div>
</template>


<script setup lang="ts">
import type { StripeBridge } from '../../types'
import useCustomer from '../../services/customer'
import { computed, ref } from 'vue'
import propToComputed from '../../controllers/propToComputed'
import { NButton, NIcon, NForm, NFormItem, NDivider, NH3, NInput, NSpace, NSpin, NList, NCard, NTag, NCollapse, NCollapseItem, NEmpty, NTable, NPopover, useDialog } from 'naive-ui'
import { CreateOutline, ArrowBackOutline, SaveOutline, CloseOutline, DocumentTextOutline } from '@vicons/ionicons5'
// @ts-expect-error no types
import { NPopup } from 'naive-tools'
import 'naive-tools/style.css'
import useScreen from '../../util/screen'
import useSubscriptions from '../../services/subscriptions'
import usePaymentMethods from '../../services/paymentMethods'
import Stripe from 'stripe'
import PaymentMethod from '../elements/PaymentMethod.vue'
import { toPriceStr } from '../../util/helpers'

const props = defineProps<{
  bridge: StripeBridge;
  showMetadata?: boolean;
  localization?: {
    [key: string]: string;
  };
}>();
const emit = defineEmits(['ready']);

const dialog = useDialog();

const screen = useScreen();
const isMobile = computed(() => screen.width <= 600);

const { customer, fetchCustomer, updateCustomer, customerUpdating, customerFetching } = useCustomer(props.bridge);
const { subscriptions, subscriptionsFetching, subscriptionUpdating, deleteSubscription, fetchSubscriptions, updateSubscription } = useSubscriptions(props.bridge);
const { paymentMethods } = usePaymentMethods(props.bridge)


Promise.all([fetchCustomer(), fetchSubscriptions()]).then(() => {
  emit('ready');
});


const editMode = ref(false);
const save = async () => {
  editMode.value = false;
}

const triggerCanceling = (subscriptionId: string) => {
  const cancelDialog = dialog.error({
    title: props.localization?.['cancel-dialog-title'] ?? 'Cancel the subscription?',
    content: props.localization?.['cancel-dialog-content'] ?? 'All related services and products will stop working to the end of the current billing period.',
    positiveText: props.localization?.['cancel-dialog-positive'] ?? 'Cancel Subscription',
    onPositiveClick() {
      deleteSubscription(subscriptionId);
      cancelDialog.destroy();
    }
  });
}


</script>

<style scoped lang="scss">
@import "../../style/control.scss";
.subscription-cards {
  display: grid;
  gap: 20px;
  margin-top: 20px;
  .n-card {
    ::v-deep(.n-card-header) {
      padding-bottom: 0px;
    }
    .description {
      opacity: 0.75;
    }
    .price-wrapper {
      .price {
        font-weight: 700;
        font-size: 2em;
      }
      .description {
        font-weight: 400;
        opacity: 0.65;
      }
    }
    .status {
      margin: 5px 0;
    }
    .n-collapse {
      margin: 10px 0;
    }
  }
}
.metadata-table {
  tbody td {
    font-family: monospace;
  }
}
</style>