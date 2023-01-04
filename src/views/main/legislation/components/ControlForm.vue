<script lang="ts" setup>
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { computed, ref } from 'vue'

const props = defineProps<{ control?: string }>()
const emits = defineEmits(['close'])
const state = ref({
  control: props.control ?? ''
})
const rules = computed(() => ({ control: { required } }))
const v$ = useVuelidate(rules, state)
const submit = () =>
  new Promise((res, rej) => {
    v$.value.$validate()
    if (!v$.value.$invalid) {
      res(state.value.control)
    } else {
      rej(null)
    }
  })
</script>
<template>
  <app-modal
    :title="props.control ? 'Edit control' : 'Add new control'"
    :ok-text="props.control ? 'Save' : 'Add'"
    :on-ok="submit"
    :can-dismiss="false"
    @close="(value:any) => emits('close', value)"
  >
    <template #body>
      <div class="form-item" :class="{ 'has-error': v$.control.$errors.length }">
        <textarea v-model="state.control" class="form-input" placeholder="Enter the control" rows="3" />
        <p v-if="v$.control.$errors.length" class="form-error-message">
          {{ v$.control.$errors[0].$message }}
        </p>
      </div>
    </template></app-modal
  >
</template>
