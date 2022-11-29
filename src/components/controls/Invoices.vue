<template>
  <div class="invoices control">
    <header>
      <n-h3>
        Invoices
      </n-h3>
      
    </header>
    <n-divider />
    <n-spin :show="invoicesFetching">
      <n-empty v-if="invoices && invoices.length === 0" description="No invoices yet">
        <template #icon>
          <n-icon>
            <document-attach-outline />
          </n-icon>
        </template>
      </n-empty>
      <n-list class="invoices-list">
        <n-list-item class="invoice-item" v-for="{ created, id, total, status, hosted_invoice_url, invoice_pdf, lines, currency }, index in invoices" :key="id">
          <div class="date">
            {{ new Date(created * 1000).toLocaleDateString('de-DE', { year: 'numeric', month: 'numeric', day: 'numeric' }) }}
          </div>
          <div class="price">
            {{ toPriceStr(total / 100, currency, 'de-DE') }}
          </div>
          <div class="tags">
            <n-tag :type="status === 'paid' ? 'success' : 'error'">{{ status }}</n-tag>
          </div>
          <div class="description">
            {{ lines.data[0].description }}
          </div>
          <div class="actions">
            <n-space>
              <n-button v-if="!['paid', 'voided'].includes(status ?? '')" tag="a" :href="hosted_invoice_url" round tertiary>
                <template #icon>
                  <n-icon>
                    <card-outline />
                  </n-icon>
                </template>
                Pay
              </n-button>
              <n-button tag="a" :href="invoice_pdf" round tertiary>
                <template #icon>
                  <n-icon>
                    <document-text-outline />
                  </n-icon>
                </template>
                Download
              </n-button>
            </n-space>
          </div>
        </n-list-item>
      </n-list>
      <div class="invoices-actions">
        <n-button @click="loadMoreInvoices">Load more</n-button>
      </div>
    </n-spin>
  </div>
</template>


<script setup lang="ts">
import { watch } from 'vue'
import { StripeBridge } from '../../types'
import { NDivider, NH3, NButton, NSpin, NList, NListItem, NTag, NSpace, NIcon, NEmpty } from 'naive-ui'
import useInvoices from '../../services/invoices'
import { toPriceStr } from '../../util/helpers'
import { CardOutline, DocumentTextOutline, DocumentAttachOutline } from '@vicons/ionicons5'

const props = defineProps<{
  bridge: StripeBridge;
}>();
const emit = defineEmits(['ready']);


const { invoices, invoicesFetching, fetchInvoices } = useInvoices(props.bridge);
fetchInvoices().then(() => {
  emit('ready')
});


const loadMoreInvoices = () => {
  if (invoices.value) {
    fetchInvoices(invoices.value[invoices.value.length - 1].id);
  }
}

const payInvoice = (invoiceHostedUrl: string) => {

}

</script>

<style scoped lang="scss">
.invoices-list {
  background-color: transparent;
  .invoice-item {
    padding: 10px 15px;
    ::v-deep(.n-list-item__main) {
      display: grid;
      align-items: center;
      grid-template-columns: max-content max-content max-content auto max-content;
      gap: 20px;
      .date {

      }
      .price {
        font-weight: 700;
        font-size: 1.1em;
      }
    }
  }
}
.invoices-actions {
  text-align: center;
  padding: 20px 0px;
}
</style>