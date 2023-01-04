<script lang="ts" setup>
import { computed, PropType, ref } from 'vue'
import { required } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import { RiskSwot, RiskSwotType } from '@/core/models/risk-swot.model'
import { useSwotStore } from '@/store/use-swot-store'

interface RiskSwotFormState {
  content: string
}

const props = defineProps({
  riskSwot: { type: Object as PropType<RiskSwot> },
  riskSwotType: { type: String as PropType<RiskSwotType>, required: true }
})
const riskSwotStore = useSwotStore()
const emits = defineEmits(['close'])

const state = ref<RiskSwotFormState>({
  content: props.riskSwot?.content ?? ''
})

const rules = computed(() => ({
  content: { required }
}))

const submit = () =>
  new Promise((resolve, reject) => {
    v$.value.$validate()
    if (!v$.value.$invalid) {
      if (props.riskSwot) {
        riskSwotStore
          .updateRiskSwot(props.riskSwot.rssId, { ...state.value, type: props.riskSwotType })
          .then(() => {
            resolve(true)
          })
          .catch(() => {
            reject(false)
          })
      } else {
        riskSwotStore
          .addRiskSwot({ ...state.value, type: props.riskSwotType })
          .then(() => {
            resolve(true)
          })
          .catch(() => {
            reject(false)
          })
      }
    } else {
      reject()
    }
  })
const v$ = useVuelidate(rules, state)
</script>

<template>
  <AppModal
    :title="props.riskSwot ? `Edit ${props.riskSwotType.toLowerCase()}` : `Add ${props.riskSwotType.toLowerCase()}`"
    :ok-text="props.riskSwot ? 'Save' : 'Submit'"
    :on-ok="submit"
    :ok-icon="props.riskSwot && 'save'"
    :can-dismiss="false"
    @close="(value:any) => emits('close', value)"
  >
    <template #body>
      <form>
        <div class="form-item" :class="{ 'has-error': v$.content.$errors.length }">
          <span class="form-label">Content</span>
          <textarea
            v-model="state.content"
            placeholder="Input content"
            rows="2"
            class="form-input"
            @blur="v$.content.$touch"
          />
          <p v-if="v$.content.$errors.length" class="form-error-message">
            {{ v$.content.$errors[0].$message }}
          </p>
        </div>
      </form>
    </template>
  </AppModal>
</template>
