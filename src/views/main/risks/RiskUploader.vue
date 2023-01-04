<script lang="ts" setup>
import * as XLSX from 'xlsx'
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { minLength, required } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'

import { RouteNames } from '@/core/models/app-router.model'
import { useRiskStore } from '@/store/use-risk-store'
import { RiskPayload, RiskStatus, RiskStatusStrings, UploadRiskPayload } from '@/core/models/risk.model'
import { useRiskLookups } from '@/core/helpers/risk-service'
import { COL_TO_FIELD, RiskField } from '@/core/constants/risk-template-constants'
import AppButton from '@/core/components/AppButton.vue'
import { storeToRefs } from 'pinia'
import RiskUploaderItem from '@/views/main/risks/components/RiskUploaderItem.vue'
import RiskUploadInstruction from './components/RiskUploadInstruction.vue'
import FileDrop from '@/core/components/FileDrop.vue'
import { useAuthStore } from '@/store/use-auth-store'
import { useUserSetupStore } from '@/store/use-user-setup-store'
import { useRiskMatrixStore } from '@/store/use-risk-matrix.store'

const { riskSources, isoStandards } = useRiskLookups()
const userStore = useUserSetupStore()

const riskStore = useRiskStore()
const toast = useToast()
const authStore = useAuthStore()
const riskMatrixStore = useRiskMatrixStore()

const { userDepartments, userLocations } = storeToRefs(authStore)
const { userDropdownList } = storeToRefs(userStore)
const { likelihoods, consequences } = storeToRefs(riskMatrixStore)

const { status } = storeToRefs(riskStore)
const fileInput = ref<HTMLInputElement>()
const state = ref<{ risks: UploadRiskPayload[] }>({ risks: [] })
const rules = {
  risks: { required, minLength: minLength(1) }
}

const isConstructionShow = ref(false)

onMounted(() => {
  userStore.getUserList({}, true)
  riskMatrixStore.getRiskMatrix()
})

const processSheet = (sheet: XLSX.WorkSheet, endRow: number) => {
  const _risks = []
  for (let i = 2; i <= endRow; i++) {
    const _risk: UploadRiskPayload = {
      status: RiskStatus.OPEN
    }
    Object.entries(COL_TO_FIELD).forEach(([col, field]) => {
      const cell = sheet[`${col}${i}`] as XLSX.CellObject
      const cellValue = cell && cell.v ? cell.v : ''
      if (field === RiskField.DESC) {
        _risk.description = cellValue as string
      } else if (field === RiskField.ISO) {
        _risk.isoId = isoStandards.value.find((it) => it.name === cellValue)?.isoId ?? null
      } else if (field === RiskField.SOURCE) {
        _risk.rscId = riskSources.value.find((it) => it.name === cellValue)?.rscId ?? null
      } else if (field === RiskField.IL) {
        _risk.beforeRmlId = likelihoods.value.find((it) => it.value === cellValue)?.rmlId ?? null
      } else if (field === RiskField.IC) {
        _risk.beforeRmsId = consequences.value.find((it) => it.value === cellValue)?.rmsId ?? null
      } else if (field === RiskField.RL) {
        _risk.afterRmlId = likelihoods.value.find((it) => it.value === cellValue)?.rmlId ?? null
      } else if (field === RiskField.RC) {
        _risk.afterRmsId = consequences.value.find((it) => it.value === cellValue)?.rmsId ?? null
      } else if (field === RiskField.USER) {
        _risk.ownId = userDropdownList.value.find((it) => it.email === cellValue)?.usrId ?? null
      } else if (field === RiskField.DUE_DATE) {
        if (!cellValue) {
          _risk.dueDate = null
        } else {
          try {
            const cellDate = cell.w!.split('/')
            const year = cellDate[2].length === 2 ? `20${cellDate[2]}` : cellDate[2]
            _risk.dueDate = new Date(+year, +cellDate[1] - 1, +cellDate[0])
          } catch (e) {
            console.log('Cannot parse the due date', e)
          }
        }
      } else if (field === RiskField.REMARKS) {
        _risk.remarks = cellValue as string
      } else if (field === RiskField.STATUS) {
        try {
          _risk.status = RiskStatus[cellValue as RiskStatusStrings]
        } catch (e) {
          _risk.status = RiskStatus.OPEN
        }
      } else if (field === RiskField.MITIGATION) {
        const mitigations = `${cellValue as string}`.split('\n')
        _risk.mitigations = mitigations.map((it) => ({ content: it.trim(), isActionItem: false, assigneeId: null }))
      } else if (field === RiskField.LOC) {
        _risk.locId = userLocations.value.find((it) => it.name === cellValue)?.locId ?? null
      } else if (field === RiskField.DEP) {
        _risk.depId = userDepartments.value.find((it) => it.name === cellValue)?.depId ?? null
      }
    })

    if (Object.values(_risk).filter((it) => !!it).length <= 3) {
      break
    }

    _risks.push(_risk)
  }
  console.log(_risks)
  state.value.risks = _risks
}

const triggerUpload = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const uploadRisk = (event: Event) => {
  event.preventDefault()
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    const file = files[0]
    handleUploadRisk(file)
    target.value = ''
  }
}

const handleUploadRisk = (file: File) => {
  const reader = new FileReader()
  reader.onload = function (e: ProgressEvent<FileReader>) {
    const data = e.target?.result
    const workbook = XLSX.read(data, { type: 'binary' })
    const sheet = workbook.Sheets['Risk']
    if (!sheet) return

    const sheetRef = sheet['!ref']
    if (!sheetRef || sheetRef.length < 5) return
    const endRow = parseInt(sheetRef.split(':')[1].replaceAll(/\D/g, ''))
    console.log(endRow, sheet, sheetRef)

    if (endRow >= 2) {
      processSheet(sheet, endRow)
    }
  }
  reader.readAsBinaryString(file)
}

const submit = async () => {
  if (status.value === 'loading') return

  await v$.value.$validate()
  if (!v$.value.$invalid) {
    try {
      await riskStore.addMultipleRisks(state.value.risks)
      toast.success('Upload risks successfully')
      state.value.risks = []
    } catch (err) {
      console.log(err)
    }
  } else {
    console.log(v$.value)
  }
}

const onUpdate = (risk: RiskPayload, index: number) => {
  state.value.risks[index] = risk
}

const v$ = useVuelidate(rules, state)
</script>

<template>
  <RiskUploadInstruction v-if="isConstructionShow" @close="isConstructionShow = false"></RiskUploadInstruction>
  <div class="container-xl h-full px-4 sm:px-8 lg:px-16 xl:px-20 mx-auto pt-5 pb-6 flex flex-col">
    <PageHeader title="Risk Uploader">
      <router-link v-slot="{ navigate }" custom :to="{ name: RouteNames.RISK_MANAGEMENT }">
        <button
          type="button"
          class="text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200 hover:text-gray-900 font-medium rounded px-4 h-[36px] focus:outline-none"
          @click="navigate"
        >
          <font-awesome-icon icon="arrow-left" class="mr-2" />
          Back To Risk Register
        </button>
      </router-link>
      <AppButton type="light" icon="circle-question" class="mr-2" @click="isConstructionShow = true"
        >View Instructions</AppButton
      >
      <AppButton type="primary" icon="circle-plus" @click="triggerUpload"> Choose XLSX File</AppButton>
      <input ref="fileInput" type="file" class="hidden" accept="*.xlsx" @change="uploadRisk" />
    </PageHeader>
    <div v-if="state.risks.length" class="bg-base-white pt-10 flex-1 rounded-lg overflow-auto">
      <table class="w-full text-left mb-4 lh-table">
        <thead class="font-bold bg-gray-100">
          <tr>
            <th scope="col">Desc</th>
            <th scope="col">ISO</th>
            <th scope="col">Source</th>
            <th scope="col">Dep</th>
            <th scope="col">Loc</th>
            <th scope="col">IL</th>
            <th scope="col">IC</th>
            <th scope="col">Mitigations</th>
            <th scope="col">RL</th>
            <th scope="col">RC</th>
            <th scope="col">Owner</th>
            <th scope="col">Due Date</th>
            <th scope="col">Status</th>
            <th scope="col">Remarks</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(risk, index) in state.risks" :key="index">
            <risk-uploader-item :risk="risk" @on-update="onUpdate($event, index)" />
          </template>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center bg-base-white py-8 text-gray-500 px-8 flex items-center justify-center">
      <FileDrop :multiple="false" @on-drop="(files) => handleUploadRisk(files[0])">
        <div class="text-gray-600">
          <font-awesome-icon icon="cloud-arrow-up" class="mr-2" />
          Drop files to upload
          <input ref="fileUpload" type="file" class="hidden" />
        </div>
      </FileDrop>
    </div>
    <div v-if="state.risks.length" class="flex justify-end mt-5">
      <AppButton type="primary" icon="upload" :loading="status === 'loading'" @click="submit">Upload</AppButton>
    </div>
  </div>
</template>
