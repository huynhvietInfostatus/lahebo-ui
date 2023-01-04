<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { required } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import VueSelect from 'vue-select'

import { useRiskLookups } from '@/core/helpers/risk-service'
import { RaiseRiskPayload, Risk, RiskStatus } from '@/core/models/risk.model'
import AppModal from '@/core/components/AppModal.vue'
import { useRiskStore } from '@/store/use-risk-store'
import { useToast } from 'vue-toastification'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/use-auth-store'
import { useUserSetupStore } from '@/store/use-user-setup-store'
import { AppPermission } from '@/core/models/permission.model'
import { useLegalRegisterStore } from '@/store/use-legal-register-store'

const { riskSources } = useRiskLookups()
const riskStore = useRiskStore()
const toast = useToast()
const authStore = useAuthStore()
const userStore = useUserSetupStore()
const legalRegisterStore = useLegalRegisterStore()

const { userDropdownList } = storeToRefs(userStore)
const { legalRegisterItems } = storeToRefs(legalRegisterStore)

const props = defineProps<{ risk?: Risk }>()
const emits = defineEmits(['close'])
const appModal = ref<InstanceType<typeof AppModal>>()
const { userDepartments, userLocations } = storeToRefs(authStore)
const state = ref<RaiseRiskPayload>({
  description: props.risk?.description ?? '',
  depId: props.risk?.depId ?? null,
  locId: props.risk?.locId ?? null,
  rscId: props.risk?.rscId ?? null,
  ownId: props.risk?.ownId ?? null,
  remarks: props.risk?.remarks ?? '',
  mitigations: props.risk?.mitigations ?? [],
  status: props.risk?.status ?? RiskStatus.DRAFT,
  legRegId: props.risk?.legRegId ?? null
})

const rules = computed(() => ({
  description: { required },
  rscId: { required },
  ownId: { required },
  remarks: { },
  locId: { required },
  depId: { required }
}))

const submit = () =>
  new Promise((resolve, reject) => {
    v$.value.$validate()

    if (!v$.value.$invalid) {
      if (props.risk)
        riskStore.editRisk(props.risk.rskId, state.value).then(
          () => {
            toast.success('Risk updated successfully')
            resolve(true)
          },
          (err) => {
            console.log(err)
            reject(false)
          }
        )
      else
        riskStore.addRisk(state.value).then(
          () => {
            toast.success('Raise a risk successfully')
            resolve(true)
          },
          (err) => {
            console.log(err)
            reject(false)
          }
        )
    } else {
      reject(false)
    }
  })

watch(
  () => [state.value.depId, state.value.locId],
  () => {
    fetchUser()
  }
)

onMounted(() => {
  authStore.getUserProfile()
  legalRegisterStore.getLegalItems()
  fetchUser()
})
onUnmounted(() => {
  userStore.userDropdownList = []
})

const fetchUser = () => {
  if (!state.value.locId || !state.value.depId) {
    userStore.userDropdownList = []
    state.value.ownId = null
  } else {
    userStore.getUserList(
      { locId: state.value.locId, depId: state.value.depId, permissions: AppPermission.RISK_OWNER },
      true
    )
  }
}

const onFormSubmit = (event?: Event) => {
  event?.preventDefault()
  appModal.value?.onSubmit()
}

const v$ = useVuelidate(rules, state)
</script>

<template>
  <app-modal
    ref="appModal"
    :title="props.risk ? 'Edit Risk' : 'Raise a Risk'"
    :ok-text="props.risk ? 'Save' : 'Submit'"
    :ok-icon="props.risk ? 'save' : 'circle-check'"
    :on-ok="submit"
    :can-dismiss="false"
    width="768px"
    @close="(value) => emits('close', value)"
  >
    <template #body>
      <form @submit="onFormSubmit">
        <div class="uppercase font-semi-bold text-gray-400 text-lg mb-2">General Information</div>

        <div class="form-item" :class="{ 'has-error': v$.description.$errors.length }">
          <span class="form-label">Description</span>
          <textarea
            v-model="state.description"
            type="text"
            class="form-input"
            placeholder="Enter the description"
            rows="5"
          />
          <p v-if="v$.description.$errors.length" class="form-error-message">
            {{ v$.description.$errors[0].$message }}
          </p>
        </div>

        <div class="uppercase font-semi-bold text-gray-400 text-lg mb-2">Related Information</div>

        <div class="flex">
          <div class="form-item flex-1 mr-4" :class="{ 'has-error': v$.rscId.$errors.length }">
            <span class="form-label">Source</span>
            <vue-select
              v-model="state.rscId"
              :options="riskSources"
              :reduce="(rsc: any) => rsc.rscId"
              :clearable="false"
              label="name"
              placeholder="Choose the source"
              @search:blur="v$.rscId.$touch"
            />
            <p v-if="v$.rscId.$errors.length" class="form-error-message">
              {{ v$.rscId.$errors[0].$message }}
            </p>
          </div>

          <div class="form-item flex-1">
            <span class="form-label">Legal Requirement</span>
            <vue-select
              v-model="state.legRegId"
              :options="legalRegisterItems"
              :reduce="(i: any) => i.legRegId"
              label="name"
              placeholder="Choose the legal requirement"
            >
              <template #option="option: any">
                {{ option?.orgLegislation?.legislation?.division?.name ?? '' }}
              </template>
              <template #selected-option="option: any">
                {{ option?.orgLegislation?.legislation?.division?.name ?? '' }}
              </template>
            </vue-select>
          </div>
        </div>

        <div class="flex">
          <div class="form-item flex-1 mr-4" :class="{ 'has-error': v$.depId.$errors.length }">
            <span class="form-label">Department</span>
            <vue-select
              v-model="state.depId"
              label="name"
              :reduce="(dep: any) => dep.depId"
              :options="userDepartments"
              :clearable="false"
              placeholder="Choose the department"
              @search:blur="v$.depId.$touch"
            />
            <p v-if="v$.depId.$errors.length" class="form-error-message">
              {{ v$.depId.$errors[0].$message }}
            </p>
          </div>

          <div class="form-item flex-1" :class="{ 'has-error': v$.locId.$errors.length }">
            <span class="form-label">Location</span>
            <vue-select
              v-model="state.locId"
              :options="userLocations"
              label="name"
              :clearable="false"
              :reduce="(loc: any) => loc.locId"
              placeholder="Choose the location"
              @search:blur="v$.locId.$touch"
            />
            <p v-if="v$.locId.$errors.length" class="form-error-message">
              {{ v$.locId.$errors[0].$message }}
            </p>
          </div>
        </div>

        <div class="uppercase font-semi-bold text-gray-400 text-lg mb-2">Others</div>

        <div class="flex">
          <div class="form-item flex-1 mr-4" :class="{ 'has-error': v$.ownId.$errors.length }">
            <span class="form-label">Owner</span>
            <vue-select
              v-model="state.ownId"
              :options="userDropdownList"
              :reduce="(usr: any) => usr.usrId"
              :get-option-label="(usr: any) => [usr.firstName, usr.lastName].join(' ')"
              :clearable="false"
              placeholder="Choose the risk's owner"
              @search:blur="v$.ownId.$touch"
            />
            <p v-if="v$.ownId.$errors.length" class="form-error-message">
              {{ v$.ownId.$errors[0].$message }}
            </p>
          </div>
        </div>

        <div class="form-item" :class="{ 'has-error': v$.remarks.$errors.length }">
          <span class="form-label">Remarks</span>
          <textarea v-model="state.remarks" type="text" class="form-input" placeholder="Enter the remarks" rows="5" />
          <p v-if="v$.remarks.$errors.length" class="form-error-message">
            {{ v$.remarks.$errors[0].$message }}
          </p>
        </div>
      </form>
    </template>
  </app-modal>
</template>
