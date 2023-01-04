<script lang="ts" setup>
import { LegalRegister, RegisterLegalPayload, UpdateRegisterLegalPayload } from '@/core/models/legislation.model'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useSubscribedItemsStore } from '@/store/use-subscribe-items-store'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/use-auth-store'
import { useRiskLookups } from '@/core/helpers/risk-service'
import { Switch } from '@headlessui/vue'
import { useLegalRegisterStore } from '@/store/use-legal-register-store'
import ControlsMangement from './ControlsMangement.vue'

interface FormState {
  orgLegId: string | null
  locId: string | null
  isoId: string | null
  referenceNumber: string
  orgControls: string[]
  state: string
  compliance: boolean
  remarks: string
}

const props = defineProps<{ item?: LegalRegister }>()
const emits = defineEmits(['close'])
const subItemStore = useSubscribedItemsStore()
const authStore = useAuthStore()
const legalStore = useLegalRegisterStore()
const { legisItemsDropdown } = storeToRefs(subItemStore)
const { userLocations } = storeToRefs(authStore)
const { isoStandards } = useRiskLookups()

const state = ref<FormState>({
  orgLegId: props.item?.orgLegId ?? null,
  locId: props.item?.locId ?? null,
  isoId: props.item?.isoId ?? null,
  referenceNumber: props.item?.referenceNumber ?? '',
  orgControls: props.item?.orgControls ?? [],
  state: props.item?.state ?? '',
  compliance: props.item?.compliance ?? false,
  remarks: props.item?.remarks ?? ''
})

const rules = computed(() => ({
  orgLegId: { required },
  locId: { required },
  isoId: { required },
  referenceNumber: { required },
  orgControls: { required },
  remarks: { required },
  state: { required }
}))
const v$ = useVuelidate(rules, state)

const getDes = computed(() => {
  if (!state.value.orgLegId) return ''
  return legisItemsDropdown.value.find((l) => l.orgLegId === state.value.orgLegId)?.legislation.description ?? ''
})

onMounted(() => {
  subItemStore.getSubItems({}, true)
})
onUnmounted(() => {
  subItemStore.legisItemsDropdown = []
})

const submit = () =>
  new Promise((res, rej) => {
    v$.value.$validate()
    if (!v$.value.$invalid) {
      if (props.item)
        legalStore
          .updateRegisterItem(props.item.legRegId, state.value as UpdateRegisterLegalPayload)
          .then(() => {
            res(true)
          })
          .catch(() => rej(false))
      else
        legalStore
          .registerItem(state.value as RegisterLegalPayload)
          .then(() => {
            res(true)
          })
          .catch(() => rej(false))
    } else {
      rej(false)
    }
  })
</script>
<template>
  <AppModal
    :title="props.item ? 'Edit legal item' : 'Register Legal Item'"
    :ok-text="props.item ? 'Save' : 'Add'"
    :ok-icon="props.item && 'save'"
    :can-dismiss="false"
    :on-ok="submit"
    @close="(value:any) => emits('close', value)"
  >
    <template #body>
      <form>
        <div class="flex space-x-4">
          <div class="form-item flex-1" :class="{ 'has-error': v$.orgLegId.$errors.length }">
            <span class="form-label">Division</span>
            <vue-select
              v-model="state.orgLegId"
              :options="legisItemsDropdown"
              :reduce="(i: any) => i.orgLegId"
              label="name"
              placeholder="Select division"
              @search:blur="v$.orgLegId.$touch"
            >
              <template #option="option">
                {{ option.legislation.division.name }}
              </template>
              <template #selected-option="{ legislation }">
                {{ legislation?.division?.name ?? '' }}
              </template>
            </vue-select>
            <p v-if="v$.orgLegId.$errors.length" class="form-error-message">
              {{ v$.orgLegId.$errors[0].$message }}
            </p>
          </div>

          <div class="form-item flex-1"></div>
        </div>
        <div class="form-item">
          <span class="form-label">Description</span>
          <textarea class="form-input" placeholder="Enter the description" disabled rows="4" readonly :value="getDes" />
        </div>
        <div class="form-item" :class="{ 'has-error': v$.referenceNumber.$errors.length }">
          <span class="form-label">Reference number</span>
          <textarea
            v-model="state.referenceNumber"
            class="form-input"
            placeholder="Enter the reference number"
            rows="2"
            @blur="v$.referenceNumber.$touch"
          />
          <p v-if="v$.referenceNumber.$errors.length" class="form-error-message">
            {{ v$.referenceNumber.$errors[0].$message }}
          </p>
        </div>
        <div class="flex space-x-4">
          <div class="form-item flex-1" :class="{ 'has-error': v$.locId.$errors.length }">
            <span class="form-label">Location</span>
            <vue-select
              v-model="state.locId"
              :options="userLocations"
              label="name"
              :reduce="(loc: any) => loc.locId"
              placeholder="Select the location"
              @search:blur="v$.locId.$touch"
            />
            <p v-if="v$.locId.$errors.length" class="form-error-message">
              {{ v$.locId.$errors[0].$message }}
            </p>
          </div>
          <div class="form-item flex-1" :class="{ 'has-error': v$.isoId.$errors.length }">
            <span class="form-label">ISO Standard</span>
            <vue-select
              v-model="state.isoId"
              :options="isoStandards"
              :reduce="(iso: any) => iso.isoId"
              label="name"
              placeholder="Choose the ISO Standard"
              @search:blur="v$.isoId.$touch"
            />
            <p v-if="v$.isoId.$errors.length" class="form-error-message">
              {{ v$.isoId.$errors[0].$message }}
            </p>
          </div>
        </div>
        <div class="form-item flex-1" :class="{ 'has-error': v$.orgControls.$errors.length }">
          <ControlsMangement v-model="state.orgControls" />
          <p v-if="v$.orgControls.$errors.length" class="form-error-message">
            {{ v$.orgControls.$errors[0].$message }}
          </p>
        </div>
        <div class="flex space-x-4">
          <div class="form-item flex-1" :class="{ 'has-error': v$.state.$errors.length }">
            <span class="form-label">State</span>
            <input v-model="state.state" class="form-input" placeholder="Enter the state" @blur="v$.state.$touch" />
            <p v-if="v$.state.$errors.length" class="form-error-message">
              {{ v$.state.$errors[0].$message }}
            </p>
          </div>
          <div class="form-item flex-1">
            <span class="form-label">Compliance</span>
            <Switch
              v-model="state.compliance"
              :class="!state.compliance ? 'bg-gray-300' : 'bg-primary-500'"
              class="relative inline-flex h-6 w-11 items-center rounded-full mt-2"
            >
              <span class="sr-only"></span>
              <span
                :class="state.compliance ? 'translate-x-6' : 'translate-x-1'"
                class="inline-block h-4 w-4 transform rounded-full bg-base-white"
              />
            </Switch>
          </div>
        </div>
        <div class="form-item" :class="{ 'has-error': v$.remarks.$errors.length }">
          <span class="form-label">Remarks</span>
          <textarea
            v-model="state.remarks"
            class="form-input"
            placeholder="Enter the remarks"
            rows="2"
            @blur="v$.remarks.$touch"
          />
          <p v-if="v$.remarks.$errors.length" class="form-error-message">
            {{ v$.remarks.$errors[0].$message }}
          </p>
        </div>
      </form></template
    >
  </AppModal>
</template>
