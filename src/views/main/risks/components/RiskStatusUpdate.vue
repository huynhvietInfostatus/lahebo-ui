<script lang="ts" setup>
import { ActionType, Risk, RiskStatus } from '@/core/models/risk.model'
import { useRiskStore } from '@/store/use-risk-store'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { computed, ref } from 'vue'
import { useToast } from 'vue-toastification'

const props = defineProps<{ risk: Risk; type: ActionType }>()
const emits = defineEmits(['close'])
const toast = useToast()
const riskStore = useRiskStore()

const state = ref({
  reasonForRejection: ''
})

const modalType = computed(() => {
  if (props.type === 'Reject' || props.type === 'Unaccept') return 'danger'
  return 'default'
})
const okIcon = computed(() => {
  if (props.type === 'Reject' || props.type === 'Unaccept') return 'times'
  return 'check'
})

const rules = computed(() => (props.type === 'Unaccept' ? { reasonForRejection: { required } } : {}))

const v$ = useVuelidate(rules, state)

const getStatus = () => {
  switch (props.type) {
    case 'Accept':
      return RiskStatus.ACCEPTED
    case 'Unaccept':
      return RiskStatus.NOT_ACCEPTED
    case 'Approve':
      return RiskStatus.CLOSED
    case 'Reject':
      return RiskStatus.IN_PROGRESS
  }
}

const onUpdateStatus = () =>
  new Promise((resolve, reject) => {
    v$.value.$validate()
    if (v$.value.$invalid) reject(false)
    else {
      const status = getStatus()
      riskStore
        .updateRiskStatus(props.risk.rskId, {
          status,
          ...(status === RiskStatus.NOT_ACCEPTED ? { reasonForRejection: state.value.reasonForRejection } : {})
        })
        .then(
          () => {
            toast.success('Risk status has been updated!')
            resolve(true)
          },
          (err) => {
            console.log(err)
            reject(false)
          }
        )
    }
  })
</script>
<template>
  <ConfirmModal
    title="Confirmation?"
    :on-ok="onUpdateStatus"
    width="460px"
    :ok-text="props.type === 'Unaccept' ? 'Reject' : props.type"
    :ok-icon="okIcon"
    :type="modalType"
    :can-dismiss="false"
    @close="(value: any) => emits('close', value)"
  >
    <template #body>
      <div class="mb-4 font-bold">
        Do you want to {{ props.type === 'Unaccept' ? 'reject' : props.type.toLowerCase() }} this risk?
      </div>
      <div
        v-if="v$.reasonForRejection"
        class="form-item"
        :class="{ 'has-error': v$.reasonForRejection?.$errors.length }"
      >
        <textarea
          v-model="state.reasonForRejection"
          placeholder="Input Reason"
          rows="2"
          class="form-input"
          @blur="v$.reasonForRejection.$touch"
        />
        <p v-if="v$.reasonForRejection.$errors.length" class="form-error-message">
          {{ v$.reasonForRejection.$errors[0].$message }}
        </p>
      </div>
    </template>
  </ConfirmModal>
</template>
