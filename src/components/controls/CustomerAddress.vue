<template>
  <div class="customer-address control">
    <header>
      <n-h3>
        {{ props.localization?.['billing-contact'] ?? 'Address'}}
      </n-h3>
      
    </header>
    <n-divider />
    <n-spin :show="customerFetching">
      <table class="data-table">
        <tr>
          <td>
            {{ props.localization?.['name'] ?? 'Name'}}
          </td>
          <td>
            <span class="line">
              {{ customer?.name }}
            </span>
          </td>
        </tr>
        <tr>
          <td>
            {{ props.localization?.['mail'] ?? 'Mail'}}
          </td>
          <td>
            <span class="line">
              {{ customer?.email }}
            </span>
          </td>
        </tr>
        <tr>
          <td>
            {{ props.localization?.['address'] ?? 'Address'}}
          </td>
          <td>
            <span class="line">
              {{ customer?.address?.line1 }}
            </span>
            <span v-if="customer?.address?.line2" class="line">
              {{ customer?.address?.line2 }}
            </span>
            <span v-if="(customer?.address?.city || customer?.address?.postal_code)" class="line">
              <span v-if="customer?.address?.postal_code">{{ customer?.address?.postal_code }}</span>, <span v-if="customer?.address?.city">{{ customer?.address?.city }}</span>
            </span>
            <span v-if="customer?.address?.state" class="line">
              {{ customer?.address?.state }}
            </span>
          </td>
        </tr>
        <tr>
          <td>
            {{ props.localization?.['phone'] ?? 'Phone'}}
          </td>
          <td>
            <span class="line">
              {{ customer?.phone }}
            </span>
          </td>
        </tr>
      </table>
      <n-space class="actions" vertical>
        <n-popup v-model:show="editMode" title="Edit Address" :type="isMobile ? 'layer' : 'frame'" :fixed-width="isMobile ? false : 800" :fixed-height="isMobile ? false : 750">
          <template #trigger>
            <n-button round tertiary size="medium">
              <template #icon>
                <n-icon>
                  <create-outline />
                </n-icon>
              </template>
              {{ props.localization?.['edit'] ?? 'Edit'}}
            </n-button>
          </template>
          <div class="popup-inner">
            <n-spin :show="customerUpdating">
              <n-form :model="formData" :rules="rules" ref="formRef" label-placement="top" require-mark-placement="right-hanging" label-width="auto">
                <n-form-item :label=" props.localization?.['name'] ?? 'Name'" path="name">
                  <n-input v-model:value="formData.name" :placeholder=" props.localization?.['name'] ?? 'name'" />
                </n-form-item>
                <div class="form-flex-grid">
                  <n-form-item :label=" props.localization?.['mail'] ?? 'Mail'" path="mail">
                    <n-input v-model:value="formData.mail" :placeholder=" props.localization?.['mail'] ?? 'e-mail'" :input-props="{ type: 'email' }" />
                  </n-form-item>
                  <n-form-item :label=" props.localization?.['phone'] ?? 'Phone'" path="phone">
                    <n-input v-model:value="formData.phone" :placeholder=" props.localization?.['phone'] ?? 'phone'" :input-props="{ type: 'phone' }" />
                  </n-form-item>
                </div>
                <n-form-item :label=" props.localization?.['street'] ?? 'Address line 1'" path="street">
                  <n-input v-model:value="formData.street" :placeholder=" props.localization?.['street'] ?? 'Address line 1'" />
                </n-form-item>
                <n-form-item :label=" props.localization?.['address-line-2'] ?? 'Address line 2'" path="address2">
                  <n-input v-model:value="formData.address2" :placeholder=" props.localization?.['address-line-2'] ?? 'Address line 2'" />
                </n-form-item>
                <div class="form-flex-grid">
                  <n-form-item :label=" props.localization?.['zip'] ?? 'Postal Code'" path="zip">
                  <n-input v-model:value="formData.zip" :placeholder=" props.localization?.['zip'] ?? 'postal code'" />
                </n-form-item>
                <n-form-item :label=" props.localization?.['city'] ?? 'City'" path="city">
                  <n-input v-model:value="formData.city" :placeholder=" props.localization?.['city'] ?? 'city'" />
                </n-form-item>
                </div>
                <n-form-item :label=" props.localization?.['state'] ?? 'State'" path="state">
                  <n-input v-model:value="formData.state" :placeholder=" props.localization?.['state'] ?? 'state'" />
                </n-form-item>
              </n-form>
              <div class="form-actions">
                <n-button ghost class="form-actions" round size="medium" type="success" @click="save">
                  <template #icon>
                    <n-icon>
                      <save-outline />
                    </n-icon>
                  </template>
                  {{ props.localization?.['save'] ?? 'Save'}}
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
import { computed, reactive, ref, watch } from 'vue'
import propToComputed from '../../controllers/propToComputed'
import { NButton, NIcon, NForm, NFormItem, NDivider, NH3, NInput, NSpace, NSpin, FormItemRule, FormRules, FormInst, FormValidationError } from 'naive-ui'
import { CreateOutline, ArrowBackOutline, SaveOutline } from '@vicons/ionicons5'
// @ts-expect-error no types
import { NPopup } from 'naive-tools'
import 'naive-tools/style.css'
import useScreen from '../../util/screen'
import Stripe from 'stripe'

const props = defineProps<{
  bridge: StripeBridge;
  localization?: {
    [key: string]: string;
  };
}>();
const emit = defineEmits(['ready']);

const screen = useScreen();
const isMobile = computed(() => screen.width <= 600);

const { customer, fetchCustomer, updateCustomer, customerUpdating, customerFetching } = useCustomer(props.bridge);

watch(customer, (nv) => {
  if(nv) {
    formData.name = nv.name ?? '';
    formData.mail = nv.email ?? '';
    formData.phone = nv.phone ?? '';
    formData.state = nv.address?.line1 ?? '';
    formData.address2 = nv.address?.line2 ?? '';
    formData.zip = nv.address?.postal_code ?? '';
    formData.city = nv.address?.city ?? '';
    formData.state = nv.address?.state ?? '';
  }
})

const formData = reactive({
  name: '',
  mail: '',
  phone: '',
  street: '',
  address2: '',
  zip: '',
  city: '',
  state: '',
})

fetchCustomer().then(() => {
  emit('ready');
});

const editMode = ref(false);
const formRef = ref<FormInst | null>(null)
const save = async () => {
  formRef.value?.validate(
  (errors: Array<FormValidationError> | undefined) => {
    if (errors) {
      return;
    }
    if(!customer.value) throw new Error('No customer');
    customer.value.name = formData.name;
    customer.value.email = formData.mail;
    customer.value.phone = formData.phone;
    customer.value.address = {
      line1: formData.street,
      line2: formData.address2,
      postal_code: formData.zip,
      city: formData.city,
      state: formData.state,
    } as Stripe.Address;
    updateCustomer().then(() => {
      editMode.value = false;
    });
  });
}

const rules: FormRules = {
    name: {
      required: true,
      trigger: 'blur',
      validator: (rule: FormItemRule, value: string) => {
        if(!value) return Error( props.localization?.['name-required'] ?? 'Name is required');
        return true;
      }
    },
    mail: {
      required: true,
      trigger: 'blur',
      validator: (rule: FormItemRule, value: string) => {
        if(!value) return Error( props.localization?.['mail-required'] ?? 'EMail is required');
        return true;
      }
    },
    street: {
      required: true,
      trigger: 'blur',
      validator: (rule: FormItemRule, value: string) => {
        if(!value) return Error( props.localization?.['street-required'] ?? 'Address Line 1 is required');
        return true;
      }
    },
    zip: {
      required: true,
      trigger: 'blur',
      validator: (rule: FormItemRule, value: string) => {
        if(!value) return Error( props.localization?.['zip-required'] ?? 'Postal code is required');
        return true;
      }
    },
    city: {
      required: true,
      trigger: 'blur',
      validator: (rule: FormItemRule, value: string) => {
        if(!value) return Error( props.localization?.['city-required'] ?? 'City is required');
        return true;
      }
    },
  };

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