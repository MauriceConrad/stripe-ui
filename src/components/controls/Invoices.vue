<template>
  <div class="invoices control">
    <header>
      <n-h3>
        {{ props.localization?.['invoices'] ?? 'Invoices'}}
      </n-h3>
      
    </header>
    <n-divider />
    <n-spin :show="invoicesFetching">
      <n-empty v-if="invoices && invoices.length === 0" :description=" props.localization?.['invoices-empty'] ?? 'No invoices yet'">
        <template #icon>
          <n-icon>
            <document-attach-outline />
          </n-icon>
        </template>
      </n-empty>
      <n-list v-else class="invoices-list" :show-divider="false">
        <n-list-item v-for="{ created, id, total, status, hosted_invoice_url, invoice_pdf, lines, currency, discount }, index in invoices?.[page - 1]" :key="id">
          <n-card class="invoice-item">
            <div class="lines">
              <div>
                <div class="id">
                  {{ id }}
                </div>
                <div class="date">
                  {{ new Date(created * 1000).toLocaleDateString(props.localization?.['locale'] ?? 'de-DE', { year: 'numeric', month: 'numeric', day: 'numeric' }) }}
                </div>
                <div class="description">
                  {{ lines.data[0].description }}
                </div>
              </div>
              <div>
                <div class="price">
                  {{ toPriceStr(total / 100, currency, 'de-DE') }}
                </div>
                <div class="tags">
                  <n-tag round :type="status === 'paid' ? 'success' : 'error'">{{ props.localization?.[status ?? ''] ?? status }}</n-tag>
                  <n-popover v-if="discount">
                    <template #trigger>
                      <n-tag round type="info">
                        {{ props.localization?.['coupon-applied'] ?? 'Coupon applied' }}
                      </n-tag>
                    </template>
                    <span v-if="discount.coupon.amount_off">
                      -{{ toPriceStr(discount.coupon.amount_off / 100, currency, 'de-DE') }}
                    </span>
                    <span v-if="discount.coupon.percent_off">
                      -{{ discount.coupon.percent_off }}%
                    </span>
                    <span>"{{ discount?.coupon.name }}"</span>
                  </n-popover>
                </div>
              </div>
            </div>
            <div class="actions">
              <n-space>
                <n-button v-if="!['paid', 'voided'].includes(status ?? '')" tag="a" :href="hosted_invoice_url" round tertiary>
                  <template #icon>
                    <n-icon>
                      <card-outline />
                    </n-icon>
                  </template>
                  {{props.localization?.['pay'] ?? 'Pay'}}
                </n-button>
                <n-button v-if="id && invoice_pdf" @click="() => download(id, invoice_pdf)" round tertiary :loading="downloading.includes(id)">
                  <template #icon>
                    <n-icon>
                      <document-text-outline />
                    </n-icon>
                  </template>
                  {{ props.localization?.['download'] ?? 'Download'}}
                </n-button>
              </n-space>
            </div>
          </n-card>
        </n-list-item>
      </n-list>
      <n-pagination 
        v-model:page="page" 
        :page-count="invoices?.length" 
        :style="{ display: 'flex', justifyContent: 'center' }"
      />
      <div v-if="page === invoices?.length ?? 1" class="invoices-actions">
        <n-button @click="loadMoreInvoices">{{ props.localization?.['load-more'] ?? 'Load more'}}</n-button>
      </div>
    </n-spin>
  </div>
</template>


<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { StripeBridge } from '../../types'
import { NDivider, NH3, NButton, NSpin, NList, NListItem, NTag, NSpace, NIcon, NEmpty, NCard, NPagination, NPopover } from 'naive-ui'
import useInvoices from '../../services/invoices'
import { toPriceStr } from '../../util/helpers'
import { CardOutline, DocumentTextOutline, DocumentAttachOutline } from '@vicons/ionicons5'
import { chunk } from 'lodash'

const props = defineProps<{
  bridge: StripeBridge;
  localization?: {
    [key: string]: string;
  };
}>();
const emit = defineEmits(['ready']);


const { invoices: allInvoices, invoicesFetching, fetchInvoices } = useInvoices(props.bridge);
fetchInvoices().then(() => {
  emit('ready')
});

const page = ref(1);

const invoices = computed(() => {
  if (allInvoices.value) {
    return chunk(allInvoices.value, 10);
  }
  return null;
});

const loadMoreInvoices = () => {
  if (allInvoices.value) {
    fetchInvoices(allInvoices.value?.[allInvoices.value.length - 1].id);
  }
}

const payInvoice = (invoiceHostedUrl: string) => {

}

const downloading = reactive([] as string[]);
function download(id: string, file_URL: string) {
  if (downloading.includes(id)) return;
  downloading.push(id);
  (async () => {
    // fetch the file, create invisible link, click it, remove it
    const res = await fetch(file_URL);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `invoice_${id}.pdf`;
    a.click();
    a.remove();
    return;
  })().finally(() => {
    downloading.splice(downloading.indexOf(id), 1);
  });
}

</script>

<style scoped lang="scss">
.invoices-list {
  background-color: transparent;
  .invoice-item {
    ::v-deep(.n-card__content) {
      display: flex;
      gap: .5rem;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      .lines {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: .5rem;
        > * {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: .5rem;
          .price {
            font-weight: 600;
            font-size: 1.1em;
          }
          .tags {
            display: flex;
            gap: .5rem;
          }
        }
      }
      .actions {
        flex-grow: 0;
      }
    }
  }
}
.invoices-actions {
  text-align: center;
  padding: 20px 0px;
}
</style>