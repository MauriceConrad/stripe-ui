<template>
  <n-list-item class="payment-method-item">
    <div class="icon">
      <img :src="cardIcons[card?.brand as keyof typeof cardIcons]" />
    </div>
    <div class="label">
      <span class="name">{{ card?.brand }}</span>
      <span class="hidden-number">••••</span>
      <span class="last4-number">{{ card?.last4 }}</span>
    </div>
    <div class="tags">
      <slot name="tags" />
    </div>
    <div class="exp">
      <span v-if="showExpirationDate">
        Expiration Date: {{ card?.exp_month }} / {{ card?.exp_year }}
      </span>
    </div>
    <div class="actions">
      <n-space>
        <slot name="actions" />
      </n-space>
    </div>
  </n-list-item>
</template>


<script setup lang="ts">
import Stripe from 'stripe'
import { NListItem, NSpace } from 'naive-ui'

import CardIconVisa from '../../assets/icons/visa.svg'
import CardIconAmex from '../../assets/icons/amex.svg'
import CardIconMastercard from '../../assets/icons/mastercard.svg'





const props = withDefaults(defineProps<{
  card?: Stripe.PaymentMethod.Card;
  showExpirationDate?: boolean;
}>(), {
  showExpirationDate: true
});

const cardIcons = {
  visa: CardIconVisa,
  amex: CardIconAmex,
  mastercard: CardIconMastercard
}

</script>

<style scoped lang="scss">
.payment-method-item {
  ::v-deep(.n-list-item__main) {
    display: grid;
    grid-template-columns: max-content max-content max-content auto max-content;
    place-items: center left;
    gap: 10px;
  }
  
  .icon {
    font-size: 0rem;
    > img {
      width: 30px;
      height: 30px;

    }
  }
  .label {
    .name {
      margin-right: 6px;
    }
    .hidden-number {
      margin-right: 6px;
    }
    .last4-number {

    }
  }
  .tags {
    min-width: 70px;
  }
  .exp {
    text-align: left;
  }
}
</style>