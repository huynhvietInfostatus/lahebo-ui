<script lang="ts" setup>
import AppModal from '@/core/components/AppModal.vue'
import { RiskMitigationPayload } from '@/core/models/risk.model'
import { computed, ref } from 'vue'
import { required } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import { OrgUser } from '@/core/models/user.model'

const props = defineProps<{ mitigation?: RiskMitigationPayload; assignees: OrgUser[] }>()
const emits = defineEmits(['close', 'submit'])
const appModal = ref<InstanceType<typeof AppModal>>()

const state = ref<RiskMitigationPayload>({
  rskId: props.mitigation?.rskId,
  rstId: props.mitigation?.rstId,
  assigneeId: props.mitigation?.assigneeId ?? null,
  isActionItem: props.mitigation?.isActionItem ?? false,
  content: props.mitigation?.content ?? ''
})

const rules = computed(() => ({
  content: { required },
  assigneeId: { required: state.value.isActionItem && required }
}))

const submit = () =>
  new Promise((resolve, reject) => {
    v$.value.$validate()
    if (!v$.value.$invalid) {
      const { value } = state
      if (!value.isActionItem) value.assigneeId = null
      emits('submit', value)
      resolve(true)
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
    :title="props.mitigation ? 'Edit Mitigation Strategy' : 'Add New Mitigation Strategy'"
    :ok-text="props.mitigation ? 'Update' : 'Add'"
    :on-ok="submit"
    :can-dismiss="false"
    @close="(value) => emits('close', value)"
  >
    <template #body>
      <form @submit="onFormSubmit">
        <div class="form-item flex items-center">
          <label for="action-item" class="mr-4 pb-1">Mark as action item</label>
          <input id="action-item" v-model="state.isActionItem" type="checkbox" class="form-checkbox" />
        </div>
        <div class="form-item flex-1" :class="{ 'has-error': v$.assigneeId.$errors.length }">
          <span class="form-label">Assignee</span>
          <vue-select
            v-model="state.assigneeId"
            :disabled="!state.isActionItem"
            :options="assignees"
            :reduce="(usr: any) => usr.usrId"
            :get-option-label="(usr: any) => [usr.firstName, usr.lastName].join(' ')"
            placeholder="Select Assignee"
            @search:blur="v$.assigneeId.$touch"
          />
          <p v-if="v$.assigneeId.$errors.length" class="form-error-message">
            {{ v$.assigneeId.$errors[0].$message }}
          </p>
        </div>
        <div class="form-item" :class="{ 'has-error': v$.content.$errors.length }">
          <span class="form-label">Content</span>
          <textarea v-model="state.content" rows="2" class="form-input" />
          <p v-if="v$.content.$errors.length" class="form-error-message">
            {{ v$.content.$errors[0].$message }}
          </p>
        </div>
      </form>
    </template>
  </app-modal>
</template>
