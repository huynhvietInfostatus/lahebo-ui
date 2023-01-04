<script lang="ts" setup>
import { Action, AddActionPayload, UpdateActionPayload } from '@/core/models/action.model'
import { useActionStore } from '@/store/use-action-store'
import { required } from '@vuelidate/validators'
import { computed, onMounted, onUnmounted, PropType, ref, watch } from 'vue'
import useVuelidate from '@vuelidate/core'
import { useRiskLookups } from '@/core/helpers/risk-service'
import { useToast } from 'vue-toastification'
import { formatDate } from '@/core/helpers/common'
import DatePicker from '@vuepic/vue-datepicker'
import { useRiskStore } from '@/store/use-risk-store'
import { storeToRefs } from 'pinia'
import AttachmentUpload from './AttachmentUpload.vue'
import { RiskStatus } from '@/core/models/risk.model'
import { useUserSetupStore } from '@/store/use-user-setup-store'
import { useAuthStore } from '@/store/use-auth-store'
import { AppPermission } from '@/core/models/permission.model'

const props = defineProps({
  action: {
    type: Object as PropType<Action>
  }
})

interface FormState {
  assignedUsrId: string | null
  ascId: string | null
  locId: string | null
  isoId: string | null
  depId: string | null
  description: string
  rskId: string | null
  dueDate: Date
  forecastDate: Date
  remarks: string
}

const { actionSources, isoStandards } = useRiskLookups()

const toast = useToast()
const userStore = useUserSetupStore()
const { assignees } = storeToRefs(userStore)

const riskStore = useRiskStore()
const authStore = useAuthStore()
const emits = defineEmits(['close'])
const actionStore = useActionStore()

const { userDepartments, userLocations } = storeToRefs(authStore)
const { filteredRiskDropdownList } = storeToRefs(riskStore)

const state = ref<FormState>({
  description: props.action?.description ?? '',
  ascId: props.action?.ascId ?? null,
  rskId: props.action?.rskId ?? null,
  isoId: props.action?.isoId ?? null,
  depId: props.action?.depId ?? null,
  locId: props.action?.locId ?? null,
  assignedUsrId: props.action?.assignedUsrId ?? null,
  dueDate: new Date(props.action?.dueDate ?? new Date()),
  forecastDate: new Date(props.action?.dueDate ?? new Date()),
  remarks: props.action?.remarks ?? ''
})

const rules = computed(() => ({
  description: { required },
  isoId: { required: !state.value.rskId && required },
  remarks: { },
  ascId: { required },
  rskId: { required: !isRiskDisabled.value && required },
  depId: { required },
  locId: { required },
  assignedUsrId: { required },
  dueDate: { required },
  forecastDate: { required }
}))

watch(
  () => [state.value.depId, state.value.locId],
  () => {
    fetchUser()
  }
)
watch(
  () => [state.value.rskId],
  () => {
    updateRisk()
  }
)

const updateRisk = () => {
  const risk = filteredRiskDropdownList.value.find((r) => r.rskId === state.value.rskId)
  if (risk) {
    state.value.depId = risk.depId
    state.value.locId = risk.locId
    state.value.dueDate = new Date(risk.dueDate)
    state.value.isoId = risk.isoId
  }
}

const fetchUser = () => {
  if (!state.value.locId || !state.value.depId) {
    userStore.userDropdownList = []
    state.value.assignedUsrId = null
  } else {
    userStore.getUserList(
      { locId: state.value.locId, depId: state.value.depId, permissions: AppPermission.ACTION_ASSIGNEE },
      true
    )
  }
}

onMounted(() => {
  fetchUser()
  authStore.getUserProfile()
  riskStore.fetchRisks({ take: 100 }, true)
  if (props.action) {
    actionStore.attachments = props.action.attachments
  }
})

onUnmounted(() => {
  userStore.userDropdownList = []
})

const isRiskDisabled = computed(() => {
  if (!state.value.ascId || !actionSources.value.length) return true
  const source = actionSources.value.find((a) => a.ascId === state.value.ascId)
  return source?.name !== 'Risk Module'
})

const v$ = useVuelidate(rules, state)

const submit = () => {
  return new Promise((resolve, reject) => {
    v$.value.$validate()
    if (!v$.value.$invalid) {
      const value = {
        ...state.value,
        attachments: [...actionStore.attachments].map((a) => {
          return { attId: a.attId }
        })
      }
      const submitAction = props.action
        ? actionStore.updateAction(props.action.actId, {
            ...value,
            rskId: isRiskDisabled.value ? null : value.rskId
          } as UpdateActionPayload)
        : actionStore.addAction({
            ...value,
            rskId: isRiskDisabled.value ? null : value.rskId,
            status: RiskStatus.OPEN
          } as unknown as AddActionPayload)
      submitAction
        .then(() => {
          toast.success(props.action ? 'Action updated successfully' : 'Add new action successfully')
          resolve(true)
        })
        .catch((e) => {
          console.log(e)
          reject(false)
        })
    } else {
      reject(false)
    }
  })
}
const now = new Date()
</script>
<template>
  <AppModal
    :title="props.action ? 'Edit Action' : 'Add Action'"
    :ok-text="props.action ? 'Save' : 'Add'"
    :ok-icon="props.action && 'save'"
    :can-dismiss="false"
    :on-ok="submit"
    @close="(value:any) => emits('close', value)"
  >
    <template #body>
      <form>
        <div class="form-item" :class="{ 'has-error': v$.description.$errors.length }">
          <span class="form-label">Description</span>
          <textarea
            v-model="state.description"
            class="form-input"
            placeholder="Enter the description"
            rows="2"
            @blur="v$.description.$touch"
          />
          <p v-if="v$.description.$errors.length" class="form-error-message">
            {{ v$.description.$errors[0].$message }}
          </p>
        </div>
        <div class="flex space-x-4">
          <div class="form-item flex-1" :class="{ 'has-error': v$.ascId.$errors.length }">
            <span class="form-label">Source</span>
            <vue-select
              v-model="state.ascId"
              :options="actionSources"
              :reduce="(rsc: any) => rsc.ascId"
              label="name"
              placeholder="Choose the source"
              @search:blur="v$.ascId.$touch"
            />
            <p v-if="v$.ascId.$errors.length" class="form-error-message">
              {{ v$.ascId.$errors[0].$message }}
            </p>
          </div>

          <div class="form-item flex-1" :class="{ 'has-error': v$.rskId.$errors.length }">
            <span class="form-label">Risk</span>
            <vue-select
              v-model="state.rskId"
              :options="filteredRiskDropdownList"
              :reduce="(rsc: any) => rsc.rskId"
              label="description"
              :disabled="isRiskDisabled"
              placeholder="Select Risk"
              @search:blur="v$.rskId.$touch"
            />
            <p v-if="v$.rskId.$errors.length" class="form-error-message">
              {{ v$.rskId.$errors[0].$message }}
            </p>
          </div>
        </div>

        <div class="flex space-x-4">
          <div class="form-item flex-1" :class="{ 'has-error': v$.depId.$errors.length }">
            <span class="form-label">Department</span>
            <vue-select
              v-model="state.depId"
              label="name"
              :reduce="(dep: any) => dep.depId"
              :options="userDepartments"
              :disabled="!!state.rskId"
              placeholder="Select the department"
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
              :disabled="!!state.rskId"
              :reduce="(loc: any) => loc.locId"
              placeholder="Select the location"
              @search:blur="v$.locId.$touch"
            />
            <p v-if="v$.locId.$errors.length" class="form-error-message">
              {{ v$.locId.$errors[0].$message }}
            </p>
          </div>
        </div>
        <div class="flex space-x-4">
          <div class="form-item flex-1" :class="{ 'has-error': v$.assignedUsrId.$errors.length }">
            <span class="form-label">Assignee</span>
            <vue-select
              v-model="state.assignedUsrId"
              :options="assignees"
              :reduce="(usr: any) => usr.usrId"
              :get-option-label="(usr: any) => [usr.firstName, usr.lastName].join(' ')"
              placeholder="Select assignee"
              @search:blur="v$.assignedUsrId.$touch"
            />
            <p v-if="v$.assignedUsrId.$errors.length" class="form-error-message">
              {{ v$.assignedUsrId.$errors[0].$message }}
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
        <div class="flex space-x-4">
          <div class="form-item flex-1" :class="{ 'has-error': v$.forecastDate.$errors.length }">
            <span class="form-label">Forecast Date</span>
            <date-picker
              v-model="state.forecastDate"
              :enable-time-picker="false"
              :format="formatDate"
              :preview-format="'dd/MM/yyyy'"
              :min-date="now"
              placeholder="Select the forecast date"
            />
            <p v-if="v$.forecastDate.$errors.length" class="form-error-message">
              {{ v$.forecastDate.$errors[0].$message }}
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
              :disabled="!!state.rskId"
              placeholder="Select the due date"
            />
            <p v-if="v$.dueDate.$errors.length" class="form-error-message">
              {{ v$.dueDate.$errors[0].$message }}
            </p>
          </div>
        </div>
        <div class="form-item">
          <span class="form-label">Attachments</span>
          <AttachmentUpload></AttachmentUpload>
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
      </form>
    </template>
  </AppModal>
</template>
