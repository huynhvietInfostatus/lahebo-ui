<script lang="ts" setup>
import { ReportResponse } from '@/core/models/report.model'
import { RiskMatrixExposureLevel, RiskMatrixItem } from '@/core/models/risk-matrix.model'
import { computed } from 'vue'

type Props = {
  data: ReportResponse[],
  exposureLevels: RiskMatrixExposureLevel[],
  likelihoods: RiskMatrixItem[],
  severities: RiskMatrixItem[]
}
type RmeToRisk = { [k: string]: ReportResponse }
type RmsRmlToRme = { [k: string]: RiskMatrixExposureLevel | undefined }

const props = defineProps<Props>()
const emits = defineEmits(['onItemClicked'])

const riskByRmeValue = computed<RmeToRisk>(() => {
  return props.data.reduce((memo, it) => {
    memo[it.key] = it
    return memo
  }, {} as RmeToRisk)
})

const rmeByRmsRml = computed<RmsRmlToRme>(() => {
  const result: RmsRmlToRme = {}
  props.likelihoods.forEach(likelihood => {
    props.severities.forEach(severity => {
      const id = `${severity.rmsId}-${likelihood.rmlId}`
      const exposureValue = likelihood.value * severity.value
      result[id] = props.exposureLevels.find(it => it.fromValue <= exposureValue && it.toValue >= exposureValue)
    })
  })

  return result
})

const redirectToRisk = (rme?: RiskMatrixExposureLevel) => {
  if (rme) {
    emits('onItemClicked', rme)
  }
}
</script>

<template>
  <div
    v-if="severities.length && likelihoods.length"
    class="flex flex-col items-center"
  >
    <div
      class="grid gap-1"
      :style="{
          gridTemplateColumns:
            '40px minmax(120px, 180px) repeat(' +
            severities.length +
            ', minmax(120px, 160px))',
          gridTemplateRows: '40px 50px repeat(' + likelihoods.length + ',auto)'
        }"
    >
      <div class="row-span-2 col-span-2"></div>
      <div
        class="py-2 flex items-center justify-center bg-primary-50 uppercase"
        :style="{ gridColumnEnd: 'span ' + severities.length }"
      >
        Severity
      </div>
      <div
        v-for="severity in severities"
        :key="severity.rmsId"
        v-tooltip="severity.description"
        class="flex items-center py-4 justify-center bg-gray-50"
      >
        {{ severity.name }}
      </div>
      <div
        class="bg-primary-50 flex items-center justify-center uppercase min-h-[120px]"
        :style="{ gridRowEnd: 'span ' + likelihoods.length }"
        style="writing-mode: vertical-rl"
      >
        Likelihood
      </div>
      <template v-for="likelihood in likelihoods" :key="likelihood.rmlId">
        <div
          v-tooltip="likelihood.description"
          class="text-center flex items-center justify-center py-4 bg-gray-50"
        >
          {{ likelihood.name }}
        </div>
        <div
          v-for="severity in severities"
          :key="`${severity.rmsId}-${likelihood.rmlId}`"
          v-risk-color="{value: likelihood.value * severity.value, configs: exposureLevels}"
          class="text-center py-4 flex items-center justify-center cursor-pointer"
          @click="redirectToRisk(rmeByRmsRml[`${severity.rmsId}-${likelihood.rmlId}`])"
        >
          {{ rmeByRmsRml[`${severity.rmsId}-${likelihood.rmlId}`]?.name ?? 'Unknown' }}
          ({{ riskByRmeValue[`${severity.value}-${likelihood.value}`]?.value ?? 0 }})
        </div>
      </template>
    </div>
  </div>
</template>