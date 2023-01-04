<script lang="ts" setup>
import { useRiskLookups } from '@/core/helpers/risk-service'
import VueSelect from 'vue-select'
import DatePicker from '@vuepic/vue-datepicker'
import { computed, onMounted, ref, watch } from 'vue'
import { formatDate } from '@/core/helpers/common'
import { RiskMitigationPayload, RiskPayload, RiskStatus, UploadRiskPayload } from '@/core/models/risk.model'
import { minLength, required } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import RiskUploaderMitigation from '@/views/main/risks/components/RiskUploaderMitigation.vue'
import { useAuthStore } from '@/store/use-auth-store'
import { storeToRefs } from 'pinia'
import { useUserSetupStore } from '@/store/use-user-setup-store'
import { useRiskMatrixStore } from '@/store/use-risk-matrix.store'

const authStore = useAuthStore()
const userStore = useUserSetupStore()
const riskMatrixStore = useRiskMatrixStore()

const { userDropdownList } = storeToRefs(userStore)
const { userDepartments, userLocations } = storeToRefs(authStore)
const { riskSources, isoStandards, riskStatuses } = useRiskLookups()
const { likelihoods, consequences } = storeToRefs(riskMatrixStore)

const props = defineProps<{ risk?: UploadRiskPayload }>()
const emits = defineEmits(['onUpdate'])
const now = new Date()

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
  dueDate: new Date(props.risk?.dueDate ?? new Date()),
  remarks: props.risk?.remarks ?? '',
  legRegId: props.risk?.legRegId ?? null,
  status: props.risk?.status ?? RiskStatus.OPEN
})

const rules = computed(() => ({
  description: { required },
  rscId: { required },
  beforeRmlId: { required },
  beforeRmsId: { required },
  mitigations: { required, minLength: minLength(1) },
  afterRmlId: { required },
  afterRmsId: { required },
  ownId: { required },
  locId: { required },
  depId: { required },
  dueDate: { required },
  remarks: { },
  status: { required },
}))

onMounted(() => {
  userStore.getUserList({}, true)
  riskMatrixStore.getRiskMatrix()
})

watch(
  () => state.value,
  () => {
    emits('onUpdate', state.value)
  },
  { deep: true }
)

const onUpdateMitigation = (mitigation: RiskMitigationPayload, index: number) => {
  state.value.mitigations[index] = mitigation
}

const v$ = useVuelidate(rules, state)
</script>

<template>
  <tr>
    <td>
      <div class="form-item" :class="{ error: v$.description.$errors.length }">
        <input
          v-model="state.description"
          type="text"
          class="form-input"
          placeholder="Enter the description"
          @blur="v$.description.$touch"
        />
        <p v-if="v$.description.$errors.length" class="form-error-message">
          {{ v$.description.$errors[0].$message }}
        </p>
      </div>
    </td>
    <td>
      <div class="form-item">
        <vue-select
          v-model="state.isoId"
          :options="isoStandards"
          :reduce="(iso: any) => iso.isoId"
          :clearable="false"
          label="name"
          placeholder="Choose the ISO Standard"
        />
      </div>
    </td>
    <td>
      <div class="form-item" :class="{ error: v$.rscId.$errors.length }">
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
    </td>
    <td>
      <div class="form-item" :class="{ error: v$.depId.$errors.length }">
        <vue-select
          v-model="state.depId"
          :options="userDepartments"
          :reduce="(dep: any) => dep.depId"
          :clearable="false"
          label="name"
          placeholder="Choose the department"
          @search:blur="v$.depId.$touch"
        />
        <p v-if="v$.depId.$errors.length" class="form-error-message">
          {{ v$.depId.$errors[0].$message }}
        </p>
      </div>
    </td>
    <td>
      <div class="form-item" :class="{ error: v$.locId.$errors.length }">
        <vue-select
          v-model="state.locId"
          :options="userLocations"
          :reduce="(loc: any) => loc.locId"
          :clearable="false"
          label="name"
          placeholder="Choose the location"
          @search:blur="v$.locId.$touch"
        />
        <p v-if="v$.locId.$errors.length" class="form-error-message">
          {{ v$.locId.$errors[0].$message }}
        </p>
      </div>
    </td>
    <td>
      <div class="form-item" :class="{ error: v$.beforeRmlId.$errors.length }">
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
    </td>

    <td>
      <div class="form-item" :class="{ error: v$.beforeRmsId.$errors.length }">
        <vue-select
          v-model="state.beforeRmsId"
          :options="consequences"
          :reduce="(rms: any) => rms.rmsId"
          :clearable="false"
          label="name"
          placeholder="Choose the consequence"
          @search:blur="v$.beforeRmsId.$touch"
        />
        <p v-if="v$.beforeRmsId.$errors.length" class="form-error-message">
          {{ v$.beforeRmsId.$errors[0].$message }}
        </p>
      </div>
    </td>

    <td>
      <template v-for="(mit, mitIndex) in state.mitigations" :key="mitIndex">
        <risk-uploader-mitigation :mitigation="mit" @on-update="onUpdateMitigation($event, mitIndex)" />
      </template>
      <p v-if="v$.mitigations.$errors.length" class="form-error-message">
        {{ v$.mitigations.$errors[0].$message }}
      </p>
    </td>

    <td>
      <div class="form-item" :class="{ error: v$.afterRmlId.$errors.length }">
        <vue-select
          v-model="state.afterRmlId"
          :options="likelihoods"
          :reduce="(rml: any) => rml.rmlId"
          :clearable="false"
          label="name"
          placeholder="Choose the likelihood"
          @search:blur="v$.afterRmlId.$touch"
        />
        <p v-if="v$.afterRmlId.$errors.length" class="form-error-message">
          {{ v$.afterRmlId.$errors[0].$message }}
        </p>
      </div>
    </td>
    <td>
      <div class="form-item" :class="{ error: v$.afterRmsId.$errors.length }">
        <vue-select
          v-model="state.afterRmsId"
          :options="consequences"
          :reduce="(rms: any) => rms.rmsId"
          :clearable="false"
          label="name"
          placeholder="Choose the consequence"
          @search:blur="v$.afterRmsId.$touch"
        />
        <p v-if="v$.afterRmsId.$errors.length" class="form-error-message">
          {{ v$.afterRmsId.$errors[0].$message }}
        </p>
      </div>
    </td>
    <td>
      <div class="form-item" :class="{ error: v$.ownId.$errors.length }">
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
    </td>
    <td>
      <div class="form-item" :class="{ error: v$.dueDate.$errors.length }">
        <date-picker
          v-model="state.dueDate"
          :enable-time-picker="false"
          :format="formatDate"
          :preview-format="'dd/MM/yyyy'"
          :min-date="now"
          placeholder="Select the due date"
          @blur="v$.dueDate.$touch"
        />
        <p v-if="v$.dueDate.$errors.length" class="form-error-message">
          {{ v$.dueDate.$errors[0].$message }}
        </p>
      </div>
    </td>
    <td>
      <div class="form-item" :class="{ error: v$.status.$errors.length }">
        <vue-select v-model="state.status" :options="riskStatuses" :clearable="false" placeholder="Choose the status" />
        <p v-if="v$.status.$errors.length" class="form-error-message">
          {{ v$.status.$errors[0].$message }}
        </p>
      </div>
    </td>
    <td>
      <div class="form-item" :class="{ error: v$.remarks.$errors.length }">
        <input
          v-model="state.remarks"
          type="text"
          class="form-input"
          placeholder="Enter the remarks"
          @blur="v$.remarks.$touch"
        />
        <p v-if="v$.remarks.$errors.length" class="form-error-message">
          {{ v$.remarks.$errors[0].$message }}
        </p>
      </div>
    </td>
  </tr>
</template>

<style scoped>
td {
  vertical-align: top;
}

.lh-table tbody td {
  overflow: visible;
}
</style>
