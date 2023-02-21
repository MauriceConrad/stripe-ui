<template>
  <n-list-item class="payment-method-item">
    <n-card>
      <main>
        <div class="line1">
          <div class="icon">
            <img :src="cardIcons[card?.brand as keyof typeof cardIcons]" />
          </div>
          <div class="label">
            <!-- <span class="name">{{ card?.brand }}</span> -->
            <span class="hidden-number">••••</span>
            <span class="last4-number">{{ card?.last4 }}</span>
          </div>
        </div>
        <div class="line2">
          <div class="exp">
            <span v-if="showExpirationDate">
              {{ props.localization?.['expiration-date'] ?? 'Expiration Date'}}: {{ card?.exp_month }} / {{ card?.exp_year }}
            </span>
          </div>
          <div class="tags">
            <slot name="tags" />
          </div>
        </div>
      </main>
      <aside>
        <div class="actions">
          <n-space>
            <slot name="actions" />
          </n-space>
        </div>
      </aside>
    </n-card>
  </n-list-item>
</template>


<script setup lang="ts">
import Stripe from 'stripe'
import { NListItem, NSpace, NCard } from 'naive-ui'

import CardIconVisa from '../../assets/icons/visa.svg'
import CardIconAmex from '../../assets/icons/amex.svg'
import CardIconMastercard from '../../assets/icons/mastercard.svg'

const props = withDefaults(defineProps<{
  card?: Stripe.PaymentMethod.Card;
  showExpirationDate?: boolean;
  localization?: {
    [key: string]: string;
  };
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
  padding: 0 !important;
  ::v-deep(.n-list-item__main) {
    .n-card__content {
      display: flex;
      main {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: .25rem;
        .line1 {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: .25rem;
          .icon {
            font-size: 0rem;
            > img {
              width: 30px;
              height: 30px;
            }
          }
          .label {

          }
        }
        .line2 {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: .25rem;
          .tags {
            // min-width: 70px;
          }
          .exp {
            text-align: left;
          }
        }
      }
      aside {
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        align-items: center;
      }
    }
  }
}
</style>