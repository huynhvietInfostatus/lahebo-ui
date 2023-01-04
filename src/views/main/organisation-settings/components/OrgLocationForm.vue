<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { helpers, required } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import { useUserSetupStore } from '@/store/use-user-setup-store'
import { storeToRefs } from 'pinia'
import { OrgLocation } from '@/core/models/org-location.model'
import VueSelect from 'vue-select'
import { useOrgLocationStore } from '@/store/use-org-location-store'
import { external } from '@/core/helpers/common'
import { REQUIRED_THREE_CHARACTERS } from '@/core/constants/app-constants'
import toastService from '@/core/helpers/toast-service'

interface OrgLocationForm {
  name: string
  keyContact: string | null
  phoneNumber: string
  address: string
}

const props = defineProps<{ location?: OrgLocation }>()
const emits = defineEmits(['close'])

const orgUserStore = useUserSetupStore()
const orgLocationStore = useOrgLocationStore()

const { userDropdownList } = storeToRefs(orgUserStore)

onMounted(() => {
  orgUserStore.getUserList(
    {
      rolIds: '786785e2-0c7d-48fb-8f6e-dff3b774bacc,bc905564-1873-44be-9c7b-cb288145e82b'
    },
    true
  )
})

const state = ref<OrgLocationForm>({
  name: props.location?.name ?? '',
  phoneNumber: props.location?.phoneNumber ?? '',
  keyContact: props.location?.usrId ?? null,
  address: props.location?.address ?? ''
})
const formattedNumber = ref<string>(props.location?.phoneNumber ?? '')
const isPhoneNumberValid = ref<boolean>(false)

const rules = computed(() => ({
  name: {
    required,
    custom: helpers.withMessage('At least 3 alphabet characters', helpers.regex(REQUIRED_THREE_CHARACTERS))
  },
  phoneNumber: {
    required,
    custom: helpers.withMessage('Phone number is invalid', external(isPhoneNumberValid))
  },
  keyContact: { required },
  address: { required }
}))

const onInputPhoneNumber = (phone: any, phoneObject: { formatted: string; valid: boolean; number: string }) => {
  if (phoneObject?.formatted) {
    state.value.phoneNumber = phoneObject.number
    formattedNumber.value = phoneObject.formatted
    isPhoneNumberValid.value = phoneObject.valid
  }
}

const submit = () =>
  new Promise((resolve, reject) => {
    v$.value.$validate()
    if (!v$.value.$invalid) {
      if (props.location) {
        orgLocationStore
          .updateLocation(props.location.locId, state.value)
          .then(() => {
            toastService.success('The location has been updated!')
            resolve(true)
          })
          .catch(() => reject(false))
      } else {
        orgLocationStore
          .addLocation({
            ...state.value,
            isHeadOffice: false
          })
          .then(() => {
            toastService.success('The location has been added!')
            resolve(true)
          })
          .catch(() => reject(false))
      }
    } else {
      reject(false)
    }
  })
const v$ = useVuelidate(rules, state)

defineExpose({ isPhoneNumberValid })
</script>

<template>
  <AppModal
    :title="props.location ? 'Edit Location' : 'Add Location'"
    :ok-text="props.location ? 'Save' : 'Submit'"
    :on-ok="submit"
    :ok-icon="props.location && 'save'"
    :can-dismiss="false"
    width="460px"
    @close="(value: any) => emits('close', value)"
  >
    <template #body>
      <form>
        <div class="form-item" :class="{ 'has-error': v$.name.$errors.length }">
          <span class="form-label">Name</span>
          <lah-input v-model="state.name" placeholder="Name" @blur="v$.name.$touch" />
          <p v-if="v$.name.$errors.length" class="form-error-message">
            {{ v$.name.$errors[0].$message }}
          </p>
        </div>
        <div class="form-item" :class="{ 'has-error': v$.address.$errors.length }">
          <span class="form-label">Address</span>
          <lah-input v-model="state.address" placeholder="Address" @blur="v$.address.$touch" />
          <p v-if="v$.address.$errors.length" class="form-error-message">
            {{ v$.address.$errors[0].$message }}
          </p>
        </div>
        <div class="form-item" :class="{ 'has-error': v$.phoneNumber.$errors.length }">
          <span class="form-label">Phone Number</span>
          <vue-tel-input
            :value="formattedNumber"
            :input-options="{ maxlength: 16, placeholder: 'Phone number' }"
            @blur="v$.phoneNumber.$touch"
            @input="onInputPhoneNumber"
          />
          <p v-if="v$.phoneNumber.$errors.length" class="form-error-message">
            {{ v$.phoneNumber.$errors[0].$message }}
          </p>
        </div>
        <div class="form-item flex-1" :class="{ 'has-error': v$.keyContact.$errors.length }">
          <span class="form-label">Key Contact</span>
          <vue-select
            v-model="state.keyContact"
            append-to-body
            :reduce="(user: any) => user.usrId"
            :options="userDropdownList"
            :clearable="false"
            placeholder="Select Key Contact"
            :get-option-label="(usr: any) => [usr.firstName, usr.lastName].join(' ')"
            @search:blur="v$.keyContact.$touch"
          />
          <p v-if="v$.keyContact.$errors.length" class="form-error-message">
            {{ v$.keyContact.$errors[0].$message }}
          </p>
        </div>
      </form>
    </template>
  </AppModal>
</template>
