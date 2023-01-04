<script lang="ts" setup>
import { RiskMatrixItem } from '@/core/models/risk-matrix.model'
import useVuelidate from '@vuelidate/core'
import { helpers, minValue, required } from '@vuelidate/validators'
import { computed, ref } from 'vue'

const props = defineProps<{
  item?: RiskMatrixItem
  listItem: RiskMatrixItem[]
}>()
const emits = defineEmits(['close'])
interface RiskMatrixForm {
  name: string
  description: string
  value: number
}

const state = ref<RiskMatrixForm>({
  name: props.item?.name ?? '',
  description: props.item?.description ?? '',
  value: props.item?.value ?? 0
})

const notExistValidator = (value: any) => props.listItem.findIndex((l) => l.value === value && l.orgId !== props.item?.orgId) === -1
const rules = computed(() => ({
  name: { required },
  description: {},
  value: { required, minValue: minValue(1), notExist: helpers.withMessage('Value exists!', notExistValidator) }
}))

const v$ = useVuelidate(rules, state)

const submit = () =>
  new Promise((res, rej) => {
    v$.value.$validate()
    if (!v$.value.$invalid) {
      res(state.value)
    } else {
      rej(null)
    }
  })
</script>
<template>
  <AppModal
    :title="props.item ? 'Update Risk Matrix' : 'Add Risk Matrix'"
    :ok-text="props.item ? 'Update' : 'Submit'"
    :on-ok="submit"
    @close="(value:any) => emits('close', value)"
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
        <div class="form-item" :class="{ 'has-error': v$.description.$errors.length }">
          <span class="form-label">Description</span>
          <textarea
            v-model="state.description"
            type="text"
            rows="4"
            class="form-input"
            placeholder="Description"
            @blur="v$.description.$touch"
          />
          <p v-if="v$.description.$errors.length" class="form-error-message">
            {{ v$.description.$errors[0].$message }}
          </p>
        </div>
        <div class="form-item" :class="{ 'has-error': v$.value.$errors.length }">
          <span class="form-label">Value</span>
          <input v-model="state.value" type="number" class="form-input" placeholder="Value" @blur="v$.value.$touch" />
          <p v-if="v$.value.$errors.length" class="form-error-message">
            {{ v$.value.$errors[0].$message }}
          </p>
        </div>
      </form>
    </template>
  </AppModal>
</template>
