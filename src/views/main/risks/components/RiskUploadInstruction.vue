<script lang="ts" setup>
import { useRiskStore } from '@/store/use-risk-store'

const emits = defineEmits(['close'])
const riskStore = useRiskStore()
const downloadTemplate = () => {
  riskStore.downloadTemplate()
}
</script>
<template>
  <AppModal width="500px" @close="() => emits('close')">
    <div class="flex items-center justify-between px-8 py-5">
      <div class="font-semibold text-2xl text-gray-700 capitalize flex items-center">
        <font-awesome-icon icon="fa-regular fa-circle-question" class="mr-4" />Instructions
      </div>
      <button class="text-gray-500 hover:text-gray-800" @click="() => emits('close')">
        <font-awesome-icon icon="xmark"></font-awesome-icon>
      </button>
    </div>
    <div class="px-8 pt-2 pb-8">
      <ul class="space-y-4">
        <li class="flex items-center">
          <div class="w-8 h-8 rounded-full flex items-center justify-center bg-primary-500 text-base-white mr-3">1</div>
          <div>
            Download the excel file template
            <a class="text-primary-500 hover:underline cursor:pointer font-bold" @click="downloadTemplate">here</a>
          </div>
        </li>
        <li class="flex items-center">
          <div class="w-8 h-8 rounded-full flex items-center justify-center bg-primary-500 text-base-white mr-3">2</div>
          <div>Fill up the fields in the excel file</div>
        </li>
        <li class="flex items-center">
          <div class="w-8 h-8 rounded-full flex items-center justify-center bg-primary-500 text-base-white mr-3">3</div>
          <div>Import file to review</div>
        </li>
        <li class="flex items-center">
          <div class="w-8 h-8 rounded-full flex items-center justify-center bg-primary-500 text-base-white mr-3">4</div>
          <div>Upload data to <b>Risk Management</b></div>
        </li>
      </ul>
    </div>
  </AppModal>
</template>
