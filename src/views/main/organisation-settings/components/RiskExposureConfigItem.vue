<script lang="ts" setup>
import { computed, defineEmits, defineProps, reactive, watch } from 'vue'
import { maxValue, minValue, required } from '@vuelidate/validators'
import LahInput from '@/core/components/LahInput.vue'
import useVuelidate from '@vuelidate/core'
import { RiskMatrixExposureLevelPayload } from '@/core/models/risk-matrix.model'

const props = defineProps<{ modelValue?: RiskMatrixExposureLevelPayload, disableDelete: boolean }>()
const emits = defineEmits(['onUpdate', 'deleteItem'])
const state = reactive<RiskMatrixExposureLevelPayload>({
  fromValue: props.modelValue?.fromValue ?? 1,
  toValue: props.modelValue?.toValue ?? 2,
  name: props.modelValue?.name ?? '',
  color: props.modelValue?.color ?? '#fff'
})

const rules = computed(() => ({
  fromValue: { required, minValue: minValue(1), maxValue: maxValue(state.toValue - 1) },
  toValue: { required, minValue: minValue(state.fromValue + 1) },
  name: { required },
  color: { required }
}))

watch(state, () => {
  emits('onUpdate', state)
})

const v$ = useVuelidate(rules, state)
</script>

<template>
  <tr>
    <td class="w-24 pr-2 py-2">
      <input
        v-model="state.fromValue"
        type="number"
        class="form-input"
        placeholder="From"
        :class="{'error': v$.fromValue.$errors.length}"
        @blur="v$.fromValue.$touch"
      />
    </td>
    <td class="w-24 pr-2 py-2">
      <input
        v-model="state.toValue"
        type="number"
        class="form-input"
        placeholder="To"
        :class="{'error': v$.toValue.$errors.length}"
        @blur="v$.toValue.$touch"
      />
    </td>
    <td class="pr-2 py-2">
      <lah-input
        v-model="state.name"
        placeholder="Name"
        :class="{'error': v$.name.$errors.length}"
        @blur="v$.name.$touch"
      />
    </td>
    <td class="align-middle pr-2 py-2 w-[48px]">
      <input
        v-model="state.color"
        type="color"
        class="form-input-color table-cell"
        placeholder="Color"
      />
    </td>
    <td class="align-middle py-2 w-[40px]">
      <button
        :disabled="disableDelete"
        class="bg-gray-200 text-gray-700 w-[40px] h-[40px] disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 rounded hover:bg-gray-300"
        @click="emits('deleteItem')"
      >
        <font-awesome-icon icon="trash" />
      </button>
    </td>
  </tr>
</template>