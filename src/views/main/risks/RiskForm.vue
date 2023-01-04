<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { required } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import VueSelect from 'vue-select'
import DatePicker from '@vuepic/vue-datepicker'

import { useRiskLookups } from '@/core/helpers/risk-service'
import { Risk, RiskMitigationPayload, RiskPayload, RiskStatus } from '@/core/models/risk.model'
import { formatDate } from '@/core/helpers/common'
import { RiskMatrixExposureLevel } from '@/core/models/risk-matrix.model'
import AppModal from '@/core/components/AppModal.vue'
import ConfirmModal from '@/core/components/ConfirmModal.vue'
import RiskMitigationForm from '@/views/main/risks/RiskMitigationForm.vue'
import { useRiskStore } from '@/store/use-risk-store'
import { useToast } from 'vue-toastification'
import { useUserSetupStore } from '@/store/use-user-setup-store'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/use-auth-store'
import { useRiskMatrixStore } from '@/store/use-risk-matrix.store'
import { useLegalRegisterStore } from '@/store/use-legal-register-store'

const { riskSources, isoStandards } = useRiskLookups()

// store
const riskStore = useRiskStore()
const userStore = useUserSetupStore()
const authStore = useAuthStore()
const toast = useToast()
const riskMatrixStore = useRiskMatrixStore()
const legalRegisterStore = useLegalRegisterStore()

// valuable
const props = defineProps<{ risk?: Risk }>()
const emits = defineEmits(['close'])
const appModal = ref<InstanceType<typeof AppModal>>()
const showMitigationModal = ref(false)
const isConfirmModalShow = ref(false)
const mitigationIndex = ref<number>(-1)
const now = new Date()
const { owners, assignees } = storeToRefs(userStore)
const { userDepartments, userLocations } = storeToRefs(authStore)
const { likelihoods, consequences, exposureLevels } = storeToRefs(riskMatrixStore)
const { legalRegisterItems } = storeToRefs(legalRegisterStore)

const state = ref<RiskPayload>({
  depId: props.risk?.depId ?? null,
  locId: props.risk?.locId ?? null,
  isoId: props.risk?.isoId ?? null,
  description: props.risk?.description ?? '',
  rscId: props.risk?.rscId ?? null,
  beforeRmlId: props.risk?.beforeRmlId ?? null,
  beforeRmsId: props.risk?.beforeRmsId ?? null,
  mitigations: props.risk?.mitigations ?? [],
  afterRmlId: props.risk?.afterRmlId ?? null,
  afterRmsId: props.risk?.afterRmsId ?? null,
  ownId: props.risk?.ownId ?? null,
  legRegId: props.risk?.legRegId ?? null,
  dueDate: new Date(props.risk?.dueDate ?? new Date()),
  remarks: props.risk?.remarks ?? '',
  status: !props.risk
    ? RiskStatus.OPEN
    : props.risk.status === RiskStatus.ACCEPTED
    ? RiskStatus.OPEN
    : props.risk.status
})

const rules = computed(() => ({
  description: { required },
  rscId: { required },
  beforeRmlId: { required },
  beforeRmsId: { required },
  mitigations: { },
  afterRmlId: { required },
  afterRmsId: { required },
  ownId: { required },
  locId: { required },
  depId: { required },
  dueDate: { required },
  remarks: { }
}))

watch(
  () => [state.value.depId, state.value.locId],
  () => {
    fetchUser()
  }
)

onMounted(() => {
  authStore.getUserProfile()
  riskMatrixStore.getRiskMatrix()
  fetchUser()
  legalRegisterStore.getLegalItems()
})
onUnmounted(() => {
  userStore.userDropdownList = []
})

const fetchUser = () => {
  if (!state.value.locId || !state.value.depId) {
    userStore.userDropdownList = []
    state.value.ownId = null
  } else {
    userStore.getUserList({ locId: state.value.locId, depId: state.value.depId }, true)
  }
}

const maxExposureValue = computed(() => {
  if (exposureLevels.value.length === 0) {
    return 1
  } else {
    return Math.max(...exposureLevels.value.map((it) => it.toValue))
  }
})

const isEditing = computed(() => props.risk !== undefined)
const beforeExposureLevel = computed<RiskMatrixExposureLevel | null>(() => {
  if (state.value.beforeRmlId && state.value.beforeRmsId) {
    try {
      const rml = likelihoods.value.find((it) => it.rmlId === state.value.beforeRmlId)
      const rms = consequences.value.find((it) => it.rmsId === state.value.beforeRmsId)
      const value = +rml!.value * +rms!.value
      return exposureLevels.value.find((it) => it.fromValue <= value && it.toValue >= value) ?? null
    } catch (e) {
      console.log('Cannot find the exposure level before mitigating')
    }
  }

  return null
})

const beforeExposureValue = computed<number>(() => {
  const rml = likelihoods.value.find((it) => it.rmlId === state.value.beforeRmlId)
  const rms = consequences.value.find((it) => it.rmsId === state.value.beforeRmsId)
  const value = +rml!.value * +rms!.value
  return value
})

const afterExposureLevel = computed<RiskMatrixExposureLevel | null>(() => {
  if (state.value.afterRmlId && state.value.afterRmsId) {
    try {
      const rml = likelihoods.value.find((it) => it.rmlId === state.value.afterRmlId)
      const rms = consequences.value.find((it) => it.rmsId === state.value.afterRmsId)
      const value = rml!.value * rms!.value
      return exposureLevels.value.find((it) => it.fromValue <= value && it.toValue >= value) ?? null
    } catch (e) {
      console.log('Cannot find the exposure level after mitigating')
    }
  }

  return null
})

const afterExposureValue = computed<number>(() => {
  const rml = likelihoods.value.find((it) => it.rmlId === state.value.afterRmlId)
  const rms = consequences.value.find((it) => it.rmsId === state.value.afterRmsId)
  const value = +(rml?.value ?? 0) * +(rms?.value ?? 0)
  return value
})

const onUpdateMitigation = (_mitigationIndex: number) => {
  mitigationIndex.value = _mitigationIndex
  showMitigationModal.value = true
}

const onShowDeleteConfirmation = (_mitigationIndex: number) => {
  mitigationIndex.value = _mitigationIndex
  isConfirmModalShow.value = true
}

const onDeletedMitigation = () =>
  new Promise((resolve) => {
    state.value.mitigations.splice(mitigationIndex.value, 1)
    resolve(true)
  })

const onSubmitMitigationModal = (result: RiskMitigationPayload) => {
  if (mitigationIndex.value === -1) {
    state.value.mitigations.push(result)
  } else {
    state.value.mitigations[mitigationIndex.value] = result
  }
}

const submit = () =>
  new Promise((resolve, reject) => {
    v$.value.$validate()

    if (!v$.value.$invalid) {
      const task = isEditing.value ? riskStore.editRisk(props.risk!.rskId, state.value) : riskStore.addRisk(state.value)
      task.then(
        () => {
          toast.success(isEditing.value ? 'Edit the risk successfully' : 'Add new risk successfully')
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

const onFormSubmit = (event?: Event) => {
  event?.preventDefault()
  appModal.value?.onSubmit()
}

const v$ = useVuelidate(rules, state)
</script>

<template>
  <app-modal
    ref="appModal"
    :title="isEditing ? 'Edit Risk' : 'Add New Risk'"
    ok-text="Submit"
    :on-ok="submit"
    width="768px"
    :can-dismiss="false"
    @close="(value) => emits('close', value)"
  >
    <template #body>
      <form @submit="onFormSubmit">
        <div class="uppercase font-semi-bold text-gray-400 text-lg mb-2">GENERAL INFORMATION</div>

        <div class="form-item" :class="{ 'has-error': v$.description.$errors.length }">
          <span class="form-label">Description</span>
          <textarea v-model="state.description" class="form-input" placeholder="Enter the description" rows="3" />
          <p v-if="v$.description.$errors.length" class="form-error-message">
            {{ v$.description.$errors[0].$message }}
          </p>
        </div>

        <div class="flex">
          <div class="form-item flex-1">
            <span class="form-label">ISO Standard</span>
            <vue-select
              v-model="state.isoId"
              :options="isoStandards"
              :reduce="(iso: any) => iso.isoId"
              label="name"
              placeholder="Choose the ISO Standard"
            />
          </div>
          <div class="flex-1" />
        </div>

        <div class="uppercase font-semi-bold text-gray-400 text-lg mb-4">RELATED INFORMATION</div>

        <div class="flex">
          <div class="form-item flex-1 mr-4" :class="{ 'has-error': v$.rscId.$errors.length }">
            <span class="form-label">Source</span>
            <vue-select
              v-model="state.rscId"
              :options="riskSources"
              :reduce="(rsc: any) => rsc.rscId"
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
              :reduce="(loc: any) => loc.locId"
              placeholder="Choose the location"
              @search:blur="v$.locId.$touch"
            />
            <p v-if="v$.locId.$errors.length" class="form-error-message">
              {{ v$.locId.$errors[0].$message }}
            </p>
          </div>
        </div>

        <div class="uppercase font-semi-bold text-gray-400 text-lg mb-2">RISK RATING</div>
        <div class="flex">
          <div class="form-item flex-1 mr-4" :class="{ 'has-error': v$.beforeRmlId.$errors.length }">
            <span class="form-label">Likelihood</span>
            <vue-select
              v-model="state.beforeRmlId"
              :options="likelihoods"
              :reduce="(rml: any) => rml.rmlId"
              :clearable="false"
              label="name"
              placeholder="Choose the likelihood"
              @search:blur="v$.beforeRmlId.$touch"
            />
            <p v-if="v$.beforeRmlId.$errors.length" class="form-error-message">
              {{ v$.beforeRmlId.$errors[0].$message }}
            </p>
          </div>

          <div class="form-item flex-1 mr-4" :class="{ 'has-error': v$.beforeRmsId.$errors.length }">
            <span class="form-label">Consequence</span>
            <vue-select
              v-model="state.beforeRmsId"
              :options="consequences"
              :reduce="(rms: any) => rms.rmsId"
              label="name"
              placeholder="Choose the consequence"
              @search:blur="v$.beforeRmsId.$touch"
            />
            <p v-if="v$.beforeRmsId.$errors.length" class="form-error-message">
              {{ v$.beforeRmsId.$errors[0].$message }}
            </p>
          </div>

          <div class="form-item flex-1">
            <div class="form-label">Risk exposure</div>
            <div class="pt-2">
              <RiskExposure
                v-if="beforeExposureLevel"
                :color="beforeExposureLevel.color"
                :name="beforeExposureLevel.name"
                :value="beforeExposureValue"
                :max-value="maxExposureValue"
              >
              </RiskExposure>
              <div v-else>--</div>
            </div>
          </div>
        </div>

        <div class="font-semi-bold text-gray-400 text-lg mb-4 flex">
          <div class="flex-grow uppercase">MITIGATION</div>
          <div class="flex items-center justify-end text-primary-500 cursor-pointer" @click="onUpdateMitigation(-1)">
            <font-awesome-icon icon="circle-plus" class="mr-2" />
            <span class="text-base">Add</span>
          </div>
        </div>

        <table v-if="state.mitigations.length > 0" class="w-full text-left mb-4">
          <thead class="font-bold bg-gray-100">
            <tr>
              <th scope="col" class="px-4 py-3 text-center w-24">Is Action</th>
              <th scope="col" class="px-4 py-3">Content</th>
              <th scope="col" class="px-4 py-3 w-20">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(mitigation, index) in state.mitigations"
              :key="index"
              class="bg-white"
              :class="{ 'border-t': index > 0 }"
            >
              <td class="px-4 py-3 text-center">
                <font-awesome-icon
                  v-if="mitigation.isActionItem"
                  icon="circle-check"
                  class="text-primary-500 text-lg"
                />
              </td>
              <td class="px-4 py-3">
                {{ mitigation.content }}
              </td>
              <td class="px-4 py-3 text-gray-500 text-right">
                <template v-if="!props.risk || !mitigation.actId">
                  <font-awesome-icon
                    icon="trash"
                    class="mr-4 cursor-pointer"
                    @click="onShowDeleteConfirmation(index)"
                  />
                  <font-awesome-icon icon="pen" class="cursor-pointer" @click="onUpdateMitigation(index)" />
                </template>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="mb-6 flex items-center justify-center text-gray-400 bg-gray-100 rounded-md h-20">
          No Mitigation
        </div>

        <p v-if="v$.mitigations.$errors.length" class="form-error-message">
          {{ v$.mitigations.$errors[0].$message }}
        </p>

        <div class="uppercase font-semi-bold text-gray-400 text-lg mb-2">RISK RATING AFTER MITIGATION</div>

        <div class="flex">
          <div class="form-item flex-1 mr-4" :class="{ 'has-error': v$.afterRmlId.$errors.length }">
            <span class="form-label">Likelihood</span>
            <vue-select
              v-model="state.afterRmlId"
              :options="likelihoods"
              :reduce="(rml: any) => rml.rmlId"
              label="name"
              placeholder="Choose the likelihood"
              @search:blur="v$.afterRmlId.$touch"
            />
            <p v-if="v$.afterRmlId.$errors.length" class="form-error-message">
              {{ v$.afterRmlId.$errors[0].$message }}
            </p>
          </div>

          <div class="form-item flex-1 mr-4" :class="{ 'has-error': v$.afterRmsId.$errors.length }">
            <span class="form-label">Consequence</span>
            <vue-select
              v-model="state.afterRmsId"
              :options="consequences"
              :reduce="(rms: any) => rms.rmsId"
              label="name"
              placeholder="Choose the consequence"
              @search:blur="v$.afterRmsId.$touch"
            />
            <p v-if="v$.afterRmsId.$errors.length" class="form-error-message">
              {{ v$.afterRmsId.$errors[0].$message }}
            </p>
          </div>

          <div class="form-item flex-1">
            <div class="form-label">Risk exposure</div>
            <div class="pt-2">
              <RiskExposure
                v-if="afterExposureLevel"
                :color="afterExposureLevel.color"
                :name="afterExposureLevel.name"
                :value="afterExposureValue"
                :max-value="maxExposureValue"
              >
              </RiskExposure>
              <div v-else>--</div>
            </div>
          </div>
        </div>

        <div class="uppercase font-semi-bold text-gray-400 text-lg mb-2">OTHERS</div>

        <div class="flex">
          <div class="form-item flex-1 mr-4" :class="{ 'has-error': v$.ownId.$errors.length }">
            <span class="form-label">Owner</span>
            <vue-select
              v-model="state.ownId"
              :options="owners"
              :reduce="(usr: any) => usr.usrId"
              :get-option-label="(usr: any) => [usr.firstName, usr.lastName].join(' ')"
              placeholder="Choose the risk's owner"
              @search:blur="v$.ownId.$touch"
            />
            <p v-if="v$.ownId.$errors.length" class="form-error-message">
              {{ v$.ownId.$errors[0].$message }}
            </p>
          </div>

          <div class="form-item flex-1" :class="{ 'has-error': v$.dueDate.$errors.length }">
            <span class="form-label">Due Date</span>
            <date-picker
              v-model="state.dueDate"
              :enable-time-picker="false"
              :format="formatDate"
              :preview-format="'dd/MM/yyyy'"
              :min-date="now"
              :disabled="
                props.risk &&
                props.risk.status !== RiskStatus.DRAFT &&
                props.risk.status !== RiskStatus.ACCEPTED &&
                props.risk.status !== RiskStatus.NOT_ACCEPTED
              "
              placeholder="Select the due date"
            />
            <p v-if="v$.dueDate.$errors.length" class="form-error-message">
              {{ v$.dueDate.$errors[0].$message }}
            </p>
          </div>
        </div>

        <div class="form-item" :class="{ 'has-error': v$.remarks.$errors.length }">
          <span class="form-label">Remarks</span>
          <textarea v-model="state.remarks" type="text" class="form-input" placeholder="Enter the remarks" rows="3" />
          <p v-if="v$.remarks.$errors.length" class="form-error-message">
            {{ v$.remarks.$errors[0].$message }}
          </p>
        </div>
      </form>
    </template>
  </app-modal>
  <risk-mitigation-form
    v-if="showMitigationModal"
    :assignees="assignees"
    :mitigation="mitigationIndex >= 0 ? state.mitigations[mitigationIndex] : undefined"
    @submit="onSubmitMitigationModal"
    @close="showMitigationModal = false"
  />
  <confirm-modal
    v-if="isConfirmModalShow"
    title="Confirmation"
    :on-ok="onDeletedMitigation"
    @close="isConfirmModalShow = false"
  >
    <template #body>Do you want to delete this mitigation strategy?</template>
  </confirm-modal>
</template>
