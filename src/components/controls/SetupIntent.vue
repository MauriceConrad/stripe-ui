<template>
  <div class="setup-intent">
    <n-spin :show="confirming">
      <div ref="stripeSetupIntentElementsWrapperRef" />
    </n-spin>
    <div class="actions">
      <n-button type="success" round @click="confirmPayment">
        Confirm
      </n-button>
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed, onMounted, Ref, ref } from 'vue'
import { StripeElement, StripeElements } from '@stripe/stripe-js'
import stripe, { initStripe } from '../../services/stripe'
import { useMessage, NButton, useThemeVars, NSpin } from 'naive-ui'
import color from 'color'

const props = defineProps<{
  clientSecret: string;
  redirectUrl: string;
  stripePublishableApiKey: string;
}>();
const emit = defineEmits(['confirm']);

initStripe(props.stripePublishableApiKey);

const stripeSetupIntentElementsWrapperRef = ref<HTMLDivElement>();
const elements = ref<StripeElements>();

const message = useMessage();

const confirming = ref(false);
const confirmPayment = async () => {
  if (stripe.value && elements.value) {
    confirming.value = true;
    const { error, setupIntent } = await stripe.value.confirmSetup({
      elements: elements.value,
      confirmParams: {
        return_url: props.redirectUrl
      },
      redirect: 'if_required'
    });

    if (error?.type === 'card_error' || error?.type === 'validation_error' && error.message) {
      message.error(error.message ?? 'An unexpected error happened');
    } else if (error) {
      message.error('An unexpected error happened');
    }
    confirming.value = false;

    if (setupIntent) {
      emit('confirm', setupIntent);
    }
    
  }
}

const theme = useThemeVars();

const isDarkMode = computed(() => {
  return (color(theme.value.baseColor) as any).color.reduce((total: number, value: number) => total + value, 0) < (255 * 3 / 2);
});

onMounted(() => {
  if (stripe.value && stripeSetupIntentElementsWrapperRef.value) {
    elements.value = stripe.value.elements({
      appearance: { theme: isDarkMode.value ? 'night' : 'flat' },
      clientSecret: props.clientSecret
    });
    const paymentElement = elements.value.create('payment');
    paymentElement.mount(stripeSetupIntentElementsWrapperRef.value);
  }
});

</script>

<style scoped lang="scss">
.actions {
  margin-top: 10px;
  .n-button {
    width: 100%;
  }
}
</style>