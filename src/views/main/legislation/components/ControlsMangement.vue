<script lang="ts" setup>
import { ref } from 'vue'
import ControlForm from './ControlForm.vue'

const props = defineProps<{ modelValue: string[] }>()
const controls = ref([...props.modelValue])
const emits = defineEmits(['onSave', 'update:modelValue'])
const isControlFormShow = ref(false)
const isConfirmModalShow = ref(false)

const selectedControl = ref(-1)
const openControl = (item: number) => {
  selectedControl.value = item
  isControlFormShow.value = true
}
const deleteControl = () => {
  return new Promise((resolve) => {
    controls.value.splice(selectedControl.value, 1)
    emits('update:modelValue', controls.value)
    resolve(true)
  })
}
const openDeleteControl = (value: number) => {
  selectedControl.value = value
  isConfirmModalShow.value = true
}
const closeControl = (value?: string) => {
  if (value) {
    if (selectedControl.value == -1) {
      controls.value.push(value)
    } else {
      controls.value[selectedControl.value] = value
    }
    emits('update:modelValue', controls.value)
  }
  isControlFormShow.value = false
}
</script>
<template>
  <div class="flex items-center justify-between mb-4">
    <div class="uppercase text-gray-500">Controls</div>
    <span class="flex items-center justify-end text-primary-500 cursor-pointer" @click="() => openControl(-1)">
      <font-awesome-icon icon="circle-plus" class="mr-2" />
      <span class="text-base">Add</span>
    </span>
  </div>
  <div v-if="controls.length" class="space-y-4">
    <div v-for="(control, index) in controls" :key="index" class="flex space-x-4">
      <div class="rounded-md bg-gray-100 px-4 py-2 flex-1">
        {{ control }}
      </div>
      <div class="space-x-4 text-gray-500 text-right">
        <font-awesome-icon icon="trash" class="cursor-pointer" @click="openDeleteControl(index)" />
        <font-awesome-icon icon="pen" class="cursor-pointer" @click="openControl(index)" />
      </div>
    </div>
  </div>
  <div v-else class="flex items-center justify-center text-gray-400 bg-gray-100 rounded-md h-20">No Controls</div>
  <confirm-modal
    v-if="isConfirmModalShow"
    title="Confirmation"
    type="danger"
    :on-ok="deleteControl"
    @close="isConfirmModalShow = false"
  >
    <template #body>Do you want to delete this control?</template>
  </confirm-modal>
  <ControlForm v-if="isControlFormShow" :control="controls[selectedControl]" @close="closeControl" />
</template>
