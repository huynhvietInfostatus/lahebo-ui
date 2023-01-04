<script lang="ts" setup>
import { RouteNames } from '@/core/models/app-router.model'
import { useRiskMatrixStore } from '@/store/use-risk-matrix.store'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref } from 'vue'
import RiskExposureConfig from './components/RiskExposureConfig.vue'

const riskStore = useRiskMatrixStore()
const { status, likelihoods, consequences, exposureLevels } = storeToRefs(riskStore)
onMounted(() => {
  riskStore.getRiskMatrix()
})
onUnmounted(() => {
  riskStore.$reset()
})
const isRiskExposureConfigOpen = ref(false)
const isConfirmModalOpen = ref(false)

const openConfirmModal = () => {
  isConfirmModalOpen.value = true
}
const onCloseConfirmModal = () => {
  isConfirmModalOpen.value = false
}

const initDefaultRiskMatrix = () =>
  new Promise((res, rej) => {
    riskStore
      .initDefaultRiskMatrix()
      .then(() => res(null))
      .catch(() => rej())
  })
</script>
<template>
  <RiskExposureConfig
    v-if="isRiskExposureConfigOpen"
    @close="() => (isRiskExposureConfigOpen = false)"
  ></RiskExposureConfig>
  <div class="flex items-center justify-between mb-6">
    <div class="text-xl uppercase font-semibold text-primary-500">Risk Matrix</div>
    <div v-if="consequences.length && likelihoods.length">
      <button
        type="button"
        class="text-gray-700 bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-gray-300 focus:ring-2 focus:ring-primary-300 font-medium rounded px-4 h-[36px] focus:outline-none dark:focus:ring-blue-800 mr-2"
        @click="() => (isRiskExposureConfigOpen = true)"
      >
        <font-awesome-icon icon="gear" class="mr-2" /> Risk exposure config
      </button>
      <router-link v-slot="{ navigate }" custom :to="{ name: RouteNames.EDIT_RISK_MATRIX }">
        <button
          type="button"
          class="text-base-white bg-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 font-medium rounded px-4 h-[36px] focus:outline-none dark:focus:ring-blue-800"
          @click="navigate"
        >
          <font-awesome-icon icon="pen" class="mr-2" />
          Edit
        </button>
      </router-link>
    </div>
  </div>
  <div class="bg-base-white rounded-lg shadow-md overflow-hidden px-4 py-8">
    <div v-if="status === 'loading'" class="flex items-center justify-center h-24">
      <font-awesome-icon icon="spinner" class="fa-spin mr-2 fa-lg text-gray-600" />
    </div>
    <div v-else-if="consequences.length && likelihoods.length" class="flex flex-col items-center">
      <div
        class="grid gap-1"
        :style="{
          gridTemplateColumns: '40px minmax(120px, 180px) repeat(' + consequences.length + ', minmax(120px, 160px))',
          gridTemplateRows: '40px 50px repeat(' + likelihoods.length + ',auto)'
        }"
      >
        <div class="row-span-2 col-span-2"></div>
        <div
          class="py-2 flex items-center justify-center bg-primary-50 uppercase"
          :style="{ gridColumnEnd: 'span ' + consequences.length }"
        >
          Severity
        </div>
        <div
          v-for="item in consequences"
          :key="item.rmsId"
          v-tooltip="item.description"
          class="flex items-center py-4 justify-center bg-gray-50"
        >
          {{ item.name }} ({{ item.value }})
        </div>
        <div
          class="bg-primary-50 flex items-center justify-center uppercase min-h-[120px]"
          :style="{ gridRowEnd: 'span ' + likelihoods.length }"
          style="writing-mode: vertical-rl"
        >
          Likelihood
        </div>
        <template v-for="item in likelihoods" :key="item.rmlId">
          <div v-tooltip="item.description" class="text-center flex items-center justify-center py-4 bg-gray-50">
            {{ item.name }} ({{ item.value }})
          </div>
          <div
            v-for="itemValue in consequences"
            :key="`${itemValue.rmsId}-${item.rmlId}`"
            v-risk-color="{ value: item.value * itemValue.value, configs: exposureLevels }"
            class="text-center py-4 flex items-center justify-center"
          >
            {{ item.value * itemValue.value }}
          </div>
        </template>
      </div>
      <div class="flex justify-end items-center space-x-4 mt-6">
        <div v-for="item in exposureLevels" :key="item.rmeId" class="flex items-center space-x-2">
          <span class="inline-block w-4 h-4 rounded-full" :style="{ backgroundColor: item.color }"></span>
          <span>{{ item.name }}</span>
        </div>
      </div>
      <div
        class="flex items-center rounded-sm border border-blue-500 text-sm text-blue-500 font-bold px-4 py-3 mt-5"
        role="alert"
      >
        <font-awesome-icon icon="circle-info" class="mr-3" />
        <p>
          The white boxes are the missing configurations. Please update the risk matrix exposure level configurations if
          any white boxes to prevent issues
        </p>
      </div>
    </div>
    <div v-else class="flex items-center flex-col">
      <div>
        <div class="text-2xl text-gray-700 mb-4">
          <font-awesome-icon icon="circle-info" class="mr-2" /> Risk Matrix hasn’t been initialized!
        </div>
        <ul class="list-disc ml-14 space-y-2">
          <li>
            <router-link
              :to="{ name: RouteNames.EDIT_RISK_MATRIX }"
              class="text-primary-500 hover:underline cursor-pointer"
              >Create Manually</router-link
            >
          </li>
          <li>
            <span class="mr-1 text-gray-700"> Use default matrix: </span>

            <a class="text-primary-500 hover:underline cursor-pointer" @click="openConfirmModal()"
              >Use default matrix</a
            >
          </li>
        </ul>
      </div>
    </div>
  </div>
  <confirm-modal
    v-if="isConfirmModalOpen"
    title="Confirmation"
    :on-ok="initDefaultRiskMatrix"
    @close="onCloseConfirmModal"
  >
    <template #body>Do you want to use default 5 x 5 matrix?</template>
  </confirm-modal>
</template>
