<script lang="ts" setup>
import LahInput from '@/core/components/LahInput.vue'
import { computed, reactive, watch } from 'vue'
import { RiskMitigationPayload } from '@/core/models/risk.model'
import { required } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'

interface FormState {
  content: string
  isActionItem: boolean
}
const props = defineProps<{ mitigation?: RiskMitigationPayload }>()
const emits = defineEmits(['onUpdate'])

const state = reactive<FormState>({
  content: props.mitigation?.content ?? '',
  isActionItem: false
})

const rules = computed(() => ({
  content: { required }
}))

watch(state, () => {
  emits('onUpdate', state)
})

const v$ = useVuelidate(rules, state)
</script>

<template>
  <div class="form-item" :class="{ error: v$.content.$errors.length }">
    <lah-input
      v-model="state.content"
      type="text"
      class="form-input"
      placeholder="Enter the mitigation strategy"
      @blur="v$.content.$touch"
    />
    <p v-if="v$.content.$errors.length" class="form-error-message">
      {{ v$.content.$errors[0].$message }}
    </p>
  </div>
</template>
