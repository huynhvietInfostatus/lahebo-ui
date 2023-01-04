<script lang="ts" setup>
import { RiskMatrixItem, RiskTypes } from '@/core/models/risk-matrix.model'
import { computed, onMounted, ref, onUnmounted, watch } from 'vue'
import { useRiskMatrixStore } from '@/store/use-risk-matrix.store'
import { storeToRefs } from 'pinia'
import { RouteNames } from '@/core/models/app-router.model'
import RiskMatrixForm from './components/RiskMatrixForm.vue'
import ComponentLoading from '@/core/components/ComponentLoading.vue'
import toastService from '@/core/helpers/toast-service'
import router from '@/router'

const riskStore = useRiskMatrixStore()

const { status, likelihoods, consequences } = storeToRefs(riskStore)
const likelihoodList = ref<RiskMatrixItem[]>([])
const consequenceList = ref<RiskMatrixItem[]>([])

watch([() => likelihoods.value, () => consequences.value], () => {
  likelihoodList.value = [...likelihoods.value]
  consequenceList.value = [...consequences.value]
})

const isConfirmModalShow = ref(false)
const isConfirmSaveModalShow = ref(false)

const isDetailFormShow = ref(false)
let selectedIndex = -1
let editItem = ref<RiskMatrixItem>()
const listMatrixItem = ref<RiskMatrixItem[]>([])

const openDetailForm = (index: number, type: RiskTypes) => {
  riskType = type
  editItem.value = riskType === 'severity' ? consequenceList.value[index] : likelihoodList.value[index]
  selectedIndex = index
  listMatrixItem.value = type == 'likelihood' ? likelihoodList.value : consequenceList.value
  isDetailFormShow.value = true
}

let riskType: RiskTypes | null = null

onMounted(() => {
  riskStore.getRiskMatrix()
})

onUnmounted(() => {
  riskStore.$reset()
})

const confirmDelete = (index: number, type: RiskTypes) => {
  riskType = type
  selectedIndex = index
  isConfirmModalShow.value = true
}

const getMaxLength = computed(() => {
  return Math.max(likelihoodList.value.length, consequenceList.value.length)
})

// handle delete risk
const handleDelete = () =>
  new Promise((resolve, reject) => {
    if (riskType === 'severity') {
      consequenceList.value.splice(selectedIndex, 1)
      resolve(null)
    } else if (riskType === 'likelihood') {
      likelihoodList.value.splice(selectedIndex, 1)
      resolve(null)
    } else {
      reject(false)
    }
  })

const handleSave = () =>
  new Promise((res, rej) => {
    if (isValidMatrix.value) {
      riskStore
        .updateRiskMatrix({
          likelihoods: likelihoodList.value.map((l) => ({ name: l.name, description: l.description, value: l.value })),
          consequences: consequenceList.value.map((l) => ({
            name: l.name,
            description: l.description,
            value: l.value
          })),
          exposureLevels: []
        })
        .then(() => {
          toastService.success('Risk Matrix has been updated!')
          router.back()
          res(null)
        })
        .catch(() => rej(false))
    } else {
      rej(false)
    }
  })

const openConfirmSave = () => {
  isConfirmSaveModalShow.value = true
}

const isValidMatrix = computed(() => {
  return (
    likelihoodList.value.length === consequenceList.value.length &&
    likelihoodList.value.length &&
    consequenceList.value.length &&
    !isDupValue(likelihoodList.value) &&
    !isDupValue(consequenceList.value)
  )
})

const isDupValue = (items: RiskMatrixItem[]) => {
  const values = items.map((i) => i.value)
  return values.length !== new Set(values).size
}

const onCancel = (value: any) => {
  if (value) {
    if (selectedIndex === -1) {
      if (riskType === 'severity') {
        consequenceList.value.push(value)
      } else {
        likelihoodList.value.push(value)
      }
    } else {
      if (riskType === 'severity') {
        consequenceList.value[selectedIndex] = value
      } else {
        likelihoodList.value[selectedIndex] = value
      }
    }
  }
  isConfirmModalShow.value = false
  isDetailFormShow.value = false
  isConfirmSaveModalShow.value = false
  selectedIndex = -1
  riskType = null
}
</script>

<template>
  <ConfirmModal
    v-if="isConfirmModalShow"
    :can-dismiss="true"
    title="Confirmation"
    :on-ok="handleDelete"
    type="danger"
    @close="onCancel"
  >
    <template #body> Do you want to delete this item?</template>
  </ConfirmModal>
  <ConfirmModal v-if="isConfirmSaveModalShow" title="Confirmation" :on-ok="handleSave" @close="onCancel">
    <template #body> Do you want to save this matrix?</template>
  </ConfirmModal>
  <RiskMatrixForm v-if="isDetailFormShow" :list-item="listMatrixItem" :item="editItem" @close="onCancel" />
  <div class="flex items-center justify-between mb-6">
    <div class="text-xl uppercase font-semibold text-primary-500">Edit Risk Matrix</div>
    <div>
      <router-link v-slot="{ navigate }" custom :to="{ name: RouteNames.RISK_MATRIX }">
        <button
          type="button"
          class="text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-gray-300 focus:ring-2 focus:ring-primary-300 font-medium rounded px-4 h-[36px] focus:outline-none dark:focus:ring-blue-800 mr-2"
          @click="navigate"
        >
          <font-awesome-icon icon="arrow-left" class="mr-2" />
          Back
        </button>
      </router-link>
      <AppButton :disabled="!isValidMatrix" type="primary" icon="save" @click="openConfirmSave">Save</AppButton>
    </div>
  </div>
  <div class="bg-base-white rounded-lg shadow-md overflow-hidden px-4 py-8 relative min-h-[200px]">
    <ComponentLoading :loading="status === 'loading'" />
    <table class="w-full table-fixed">
      <thead>
        <tr class="bg-gray-100">
          <th>
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-gray-700 font-medium">Likelihood</span>
              <button
                class="text-primary-500 hover:text-primary-700 cursor-pointer"
                type="button"
                @click="openDetailForm(-1, 'likelihood')"
              >
                <font-awesome-icon icon="circle-plus" class="mr-2" />
                Add
              </button>
            </div>
          </th>
          <th>
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-gray-700 font-medium">Severity</span>
              <button
                class="text-primary-500 hover:text-primary-700 cursor-pointer"
                type="button"
                @click="openDetailForm(-1, 'severity')"
              >
                <font-awesome-icon icon="circle-plus" class="mr-2" />
                Add
              </button>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="index in getMaxLength" :key="index" class="">
          <td class="align-top px-4 py-2 border border-gray-100">
            <div v-if="likelihoodList[index - 1]" class="flex items-start space-x-2 overflow-hidden">
              <div class="flex-1 space-y-2 max-w-[calc(100%-100px)]">
                <div class="text-gray-700 font-semibold">
                  {{ likelihoodList[index - 1].name }} ({{ likelihoodList[index - 1].value || 0 }})
                </div>
                <p
                  class="text-gray-500 whitespace-nowrap font-normal overflow-hidden flex-1 text-ellipsis min-h-[20px]"
                >
                  {{ likelihoodList[index - 1].description }}
                </p>
              </div>
              <div class="flex items-center flex-shrink-0">
                <button
                  class="font-medium text-primary-500 hover:underline"
                  @click="openDetailForm(index - 1, 'likelihood')"
                >
                  Edit
                </button>
                <div class="h-3 w-[1px] mx-2 bg-gray-300"></div>
                <button
                  class="font-medium text-red-500 hover:underline disabled:text-red-100 disabled:cursor-not-allowed disabled:hover:no-underline"
                  @click="confirmDelete(index - 1, 'likelihood')"
                >
                  Delete
                </button>
              </div>
            </div>
            <div v-else class="bg-red-100"></div>
          </td>
          <td class="align-top border border-gray-100">
            <div v-if="consequenceList[index - 1]" class="flex items-start space-x-2 px-4 py-2">
              <div class="flex-1 space-y-2 max-w-[calc(100%-100px)]">
                <div class="text-gray-700 font-semibold">
                  {{ consequenceList[index - 1].name }} ({{ consequenceList[index - 1].value || 0 }})
                </div>
                <p
                  class="w-full text-gray-500 whitespace-nowrap font-normal overflow-hidden flex-1 text-ellipsis min-h-[20px]"
                >
                  {{ consequenceList[index - 1].description }}
                </p>
              </div>
              <div class="flex items-center">
                <button
                  class="font-medium text-primary-500 hover:underline"
                  @click="openDetailForm(index - 1, 'severity')"
                >
                  Edit
                </button>
                <div class="h-3 w-[1px] mx-2 bg-gray-300"></div>
                <button
                  class="font-medium text-red-500 hover:underline disabled:text-red-100 disabled:cursor-not-allowed disabled:hover:no-underline"
                  @click="confirmDelete(index - 1, 'severity')"
                >
                  Delete
                </button>
              </div>
            </div>
          </td>
        </tr>
        <tr v-if="!getMaxLength" col>
          <td colspan="2">
            <div class="text-center min-h-[120px] flex items-center justify-center">Please init your risk matrix</div>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="space-y-2 mt-4 text-gray-800 italic">
      <div class="font-bold">* Note:</div>
      <ul class="space-y-1">
        <li>- Likelihood and Severity should have the same items count</li>
        <li>- All values in each column should be unique</li>
      </ul>
    </div>
  </div>
</template>
