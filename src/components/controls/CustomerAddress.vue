<template>
  <div class="customer-address control">
    <header>
      <n-h3>
        Address
      </n-h3>
      
    </header>
    <n-divider />
    <n-spin :show="customerFetching">
      <table class="data-table">
        <tr>
          <td>
            Mail
          </td>
          <td>
            <span class="line">
              {{ email }}
            </span>
          </td>
        </tr>
        <tr>
          <td>
            Address
          </td>
          <td>
            <span class="line">
              {{ addressLine1 }}
            </span>
            <span v-if="addressLine2" class="line">
              {{ addressLine2 }}
            </span>
            <span v-if="addressCity || addressPostalCode" class="line">
              <span v-if="addressPostalCode">{{ addressPostalCode }}</span>, <span v-if="addressCity">{{ addressCity }}</span>
            </span>
            <span v-if="addressState" class="line">
              {{ addressState }}
            </span>
          </td>
        </tr>
        <tr>
          <td>
            Phone
          </td>
          <td>
            <span class="line">
              {{ phone }}
            </span>
          </td>
        </tr>
      </table>
      <n-space class="actions" vertical>
        <n-popup v-model:show="editMode" title="Edit Address" :type="isMobile ? 'layer' : 'frame'" :fixed-width="isMobile ? false : 800" :fixed-height="isMobile ? false : 580">
          <template #trigger>
            <n-button round tertiary size="medium">
              <template #icon>
                <n-icon>
                  <create-outline />
                </n-icon>
              </template>
              Edit
            </n-button>
          </template>
          <div class="popup-inner">
            <n-spin :show="customerUpdating">
              <n-form ref="formRef" label-placement="top" require-mark-placement="right-hanging" label-width="auto">
                <div class="form-flex-grid">
                  <n-form-item label="Mail">
                    <n-input v-model:value="email" placeholder="e-mail" :input-props="{ type: 'email' }" />
                  </n-form-item>
                  <n-form-item label="Phone">
                    <n-input v-model:value="phone" placeholder="phone" :input-props="{ type: 'phone' }" />
                  </n-form-item>
                </div>
                <n-form-item label="Street">
                  <n-input v-model:value="addressLine1" placeholder="street" />
                </n-form-item>
                <n-form-item label="Address line 2">
                  <n-input v-model:value="addressLine2" placeholder="address line 2" />
                </n-form-item>
                <div class="form-flex-grid">
                  <n-form-item label="Postal Code">
                  <n-input v-model:value="addressPostalCode" placeholder="postal code" />
                </n-form-item>
                <n-form-item label="City">
                  <n-input v-model:value="addressCity" placeholder="city" />
                </n-form-item>
                </div>
                <n-form-item label="State">
                  <n-input v-model:value="addressState" placeholder="state" />
                </n-form-item>
              </n-form>
              <div class="form-actions">
                <n-button class="form-actions" round size="medium" type="success" @click="save">
                  <template #icon>
                    <n-icon>
                      <save-outline />
                    </n-icon>
                  </template>
                  Save
                </n-button>
              </div>
            </n-spin>
          </div>
        </n-popup>
      </n-space>
    </n-spin>
  </div>
</template>


<script setup lang="ts">
import type { StripeBridge } from '../../types'
import useCustomer from '../../services/customer'
import { computed, ref } from 'vue'
import propToComputed from '../../controllers/propToComputed'
import { NButton, NIcon, NForm, NFormItem, NDivider, NH3, NInput, NSpace, NSpin } from 'naive-ui'
import { CreateOutline, ArrowBackOutline, SaveOutline } from '@vicons/ionicons5'
// @ts-expect-error no types
import { NPopup } from 'naive-tools'
import 'naive-tools/style.css'
import useScreen from '../../util/screen'

const props = defineProps<{
  bridge: StripeBridge;
}>();
const emit = defineEmits(['ready']);


const screen = useScreen();
const isMobile = computed(() => screen.width <= 600);

const { customer, fetchCustomer, updateCustomer, customerUpdating, customerFetching } = useCustomer(props.bridge);

// const address = computed({
//   get() {
//     return customer.value?.address;
//   },
//   set() {

//   }
// })

const email = propToComputed<string | undefined>(customer, ['email']);
const phone = propToComputed<string | undefined>(customer, ['phone']);

const addressLine1 = propToComputed<string | undefined>(customer, ['address', 'line1']);
const addressLine2 = propToComputed<string | undefined>(customer, ['address', 'line2']);
const addressCity = propToComputed<string | undefined>(customer, ['address', 'city']);
const addressPostalCode = propToComputed<string | undefined>(customer, ['address', 'postal_code']);
const addressState = propToComputed<string | undefined>(customer, ['address', 'state']);

fetchCustomer().then(() => {
  emit('ready');
});


const editMode = ref(false);
const save = async () => {
  await updateCustomer();
  editMode.value = false;
}


</script>

<style scoped lang="scss">
@import "../../style/control.scss";
.n-form {
  padding: 7px 0;
}
.form-flex-grid {
  display: flex;
  width: 100%;
  gap: 20px;
  > * {
    flex: 1;
  }
}
.actions {
  .n-button {
    width: 100%;
  }
  .n-popup__root {
    ::v-deep(.trigger-wrapper) {
      width: 100%;
    }
  }
}
.form-actions {
  .n-button {
    width: 100%;
  }
}
.popup-inner {
  padding: 20px;
}
</style>