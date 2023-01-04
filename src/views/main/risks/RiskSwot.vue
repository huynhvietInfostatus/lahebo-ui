<script lang="ts" setup>
import PageHeader from '@/core/components/PageHeader.vue'
import { RouteNames } from '@/core/models/app-router.model'
import { RiskSwotType, RiskSwot, riskSwotSections } from '@/core/models/risk-swot.model'
import { useSwotStore } from '@/store/use-swot-store'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import RiskSwotForm from './components/RiskSwotForm.vue'

const isRiskFormOpen = ref(false)
const isConfirmModalShow = ref(false)
const isConfirmCreateRiskShow = ref(false)
const riskSwotType = ref<RiskSwotType>('STRENGTH')
const selectedRiskSwot = ref<RiskSwot>()
const riskSwotStore = useSwotStore()

const { status, swotByType } = storeToRefs(riskSwotStore)

const openAddSwot = (type: RiskSwotType) => {
  isRiskFormOpen.value = true
  riskSwotType.value = type
}

const openEditSwot = (type: RiskSwotType, item: RiskSwot) => {
  isRiskFormOpen.value = true
  riskSwotType.value = type
  selectedRiskSwot.value = item
}

const closeRiskSwotForm = (value: any) => {
  if (value) {
    riskSwotStore.getRiskSwot()
  }
  isRiskFormOpen.value = false
  isConfirmModalShow.value = false
  isConfirmCreateRiskShow.value = false
  selectedRiskSwot.value = undefined
}

const confirmDelete = (type: RiskSwotType, item: RiskSwot) => {
  riskSwotType.value = type
  selectedRiskSwot.value = item
  isConfirmModalShow.value = true
}

const handleDelete = () =>
  new Promise((resolve, reject) => {
    riskSwotStore
      .deleteRiskSwot(selectedRiskSwot.value!.rssId)
      .then(() => {
        resolve(null)
      })
      .catch((e) => reject(e))
  })

const confirmCreateRisk = (type: RiskSwotType, item: RiskSwot) => {
  riskSwotType.value = type
  selectedRiskSwot.value = item
  isConfirmCreateRiskShow.value = true
}

const handleCreateRisk = () => {
  return new Promise((resolve, reject) => {
    riskSwotStore
      .createRiskFromSwot(selectedRiskSwot.value!.rssId)
      .then((res: any) => {
        selectedRiskSwot.value!.rskId = res.rskId
        resolve(null)
      })
      .catch((e) => reject(e))
  })
}

onMounted(() => {
  riskSwotStore.getRiskSwot()
})
</script>

<template>
  <ConfirmModal
    v-if="isConfirmModalShow"
    title="Confirmation"
    :on-ok="handleDelete"
    type="danger"
    @close="closeRiskSwotForm"
  >
    <template #body>
      <div class="capitalize">Do you want to delete this {{ riskSwotType?.toLowerCase() }}?</div>
    </template>
  </ConfirmModal>

  <ConfirmModal
    v-if="isConfirmCreateRiskShow"
    title="Confirmation"
    :on-ok="handleCreateRisk"
    ok-text="Create"
    type="default"
    @close="closeRiskSwotForm"
  >
    <template #body>
      <div>
        Do you want to create risk from this <b>"{{ selectedRiskSwot?.content }}"</b>?
      </div>
    </template>
  </ConfirmModal>

  <RiskSwotForm
    v-if="isRiskFormOpen"
    :risk-swot="selectedRiskSwot"
    :risk-swot-type="riskSwotType"
    @close="closeRiskSwotForm"
  ></RiskSwotForm>
  <div class="container-xl h-full px-4 sm:px-8 lg:px-16 xl:px-20 mx-auto pt-5 pb-6 overflow-auto">
    <PageHeader title="SWOT">
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
    </PageHeader>
    <div v-if="status === 'loading'" class="flex items-center justify-center h-24">
      <font-awesome-icon icon="spinner" class="fa-spin mr-2 fa-lg text-gray-600" />
    </div>
    <div v-else class="grid grid-cols-2 grid-rows-2 gap-6">
      <div v-for="swot in riskSwotSections" :key="swot.type" class="bg-base-white rounded-lg p-8 flex-1">
        <div class="flex justify-between border-b border-gray-300 pb-4">
          <span class="text-xl font-medium">{{ swot.title }}</span>
          <button class="text-primary-500 hover:text-primary-700" @click="openAddSwot(swot.type)">
            <font-awesome-icon icon="circle-plus" class="mr-1" />
            Add
          </button>
        </div>
        <ul v-if="swotByType(swot.type).length" class="divide-y mt-2">
          <li v-for="(item, index) in swotByType(swot.type)" :key="index" class="flex items-center py-3">
            <div class="flex-1 flex">
              <p class="mr-2">{{ item.content }}</p>
            </div>
            <Menu as="div" class="relative inline-block text-left">
              <MenuButton>
                <font-awesome-icon icon="ellipsis-vertical" class="cursor-pointer px-1" />
              </MenuButton>
              <MenuItems
                class="absolute bg-base-white overflow-hidden w-40 right-0 mt-2 py-2 origin-top-right rounded-md shadow-md focus:outline-none z-10"
              >
                <MenuItem>
                  <div
                    class="w-full px-4 py-3 flex cursor-pointer hover:bg-gray-100 border-b border-gray-100 items-center"
                    @click="openEditSwot(swot.type, item)"
                  >
                    <font-awesome-icon icon="pen" class="mr-3" />
                    <span>Edit</span>
                  </div>
                </MenuItem>
                <MenuItem v-if="!item.rskId">
                  <div
                    class="w-full px-4 py-3 flex cursor-pointer hover:bg-gray-100 border-b border-gray-100 items-center"
                    @click="confirmCreateRisk(swot.type, item)"
                  >
                    <font-awesome-icon icon="circle-plus" class="mr-3" />
                    <span>Create Risk</span>
                  </div>
                </MenuItem>
                <MenuItem>
                  <div
                    class="w-full px-4 py-3 flex cursor-pointer hover:bg-gray-100 text-red-500 items-center"
                    @click="confirmDelete(swot.type, item)"
                  >
                    <font-awesome-icon icon="trash" class="mr-3" />
                    Delete
                  </div>
                </MenuItem>
              </MenuItems>
            </Menu>
          </li>
        </ul>
        <div v-else class="flex items-center justify-center h-20 text-gray-500 capitalize">
          No {{ swot.type.toLowerCase() }}
        </div>
      </div>
    </div>
  </div>
</template>
