<script lang="ts" setup>
import { useOrgDepartmentStore } from '@/store/use-org-department-store'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import OrgDepartmentForm from './components/OrgDepartmentForm.vue'
import { OrgDepartment } from '@/core/models/org-department.model'
import { useLoading } from 'vue-loading-overlay'
import toastService from '@/core/helpers/toast-service'

const isDepartmentFormShow = ref(false)
const isConfirmModalShow = ref(false)
const orgDepartmentStore = useOrgDepartmentStore()
const { departments } = storeToRefs(orgDepartmentStore)
const selectedDepartment = ref<OrgDepartment | undefined>()
const editDepartment = (item: OrgDepartment) => {
  selectedDepartment.value = item
  isDepartmentFormShow.value = true
}
const $loading = useLoading()

const getDepartments = () => {
  const loader = $loading.show()
  orgDepartmentStore
    .getDepartments()
    .then(() => {
      loader.hide()
    })
    .catch(() => loader.hide())
}
const onClose = (value: any) => {
  if (value) {
    getDepartments()
  }
  isDepartmentFormShow.value = false
  isConfirmModalShow.value = false
  selectedDepartment.value = undefined
}
const confirmDeleteItem = (item: OrgDepartment) => {
  selectedDepartment.value = item
  isConfirmModalShow.value = true
}

const deleteItem = () =>
  new Promise((resolve, reject) => {
    orgDepartmentStore
      .deleteDepartment(selectedDepartment.value!.depId)
      .then(() => {
        toastService.success('The department has been deleted!')
        resolve(true)
      })
      .catch((e) => {
        console.log(e)
        reject(null)
      })
  })
onMounted(() => {
  getDepartments()
})
</script>
<template>
  <OrgDepartmentForm v-if="isDepartmentFormShow" :department="selectedDepartment" @close="onClose"></OrgDepartmentForm>
  <ConfirmModal v-if="isConfirmModalShow" title="Confirmation" :on-ok="deleteItem" type="danger" @close="onClose">
    <template #body> Do you want to delete this Department? </template></ConfirmModal
  >
  <PageHeader title="Departments">
    <button
      type="button"
      class="text-base-white bg-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-primary-700 focus:ring-2 focus:ring-primary-300 font-medium rounded px-4 h-[36px] focus:outline-none dark:focus:ring-blue-800"
      @click="isDepartmentFormShow = true"
    >
      <font-awesome-icon icon="circle-plus" class="mr-2" />
      Add Department
    </button>
  </PageHeader>
  <div v-if="departments.length" class="space-y-4">
    <div v-for="item in departments" :key="item.depId" class="bg-base-white px-6 py-5 rounded-lg shadow">
      <div class="flex justify-between items-center">
        <span class="text-xl font-medium">{{ item.name }}</span>
        <Menu as="div" class="relative inline-block text-left">
          <MenuButton>
            <font-awesome-icon icon="ellipsis-vertical" class="cursor-pointer px-1" />
          </MenuButton>
          <MenuItems
            class="absolute w-56 bg-base-white overflow-hidden right-0 mt-2 py-2 origin-top-right rounded-md shadow-md focus:outline-none z-10"
          >
            <MenuItem>
              <button
                class="w-full px-4 py-3 flex cursor-pointer hover:bg-gray-100 border-b border-gray-100 items-center"
                @click="editDepartment(item)"
              >
                <font-awesome-icon icon="pen" class="mr-3" />
                <span>Edit</span>
              </button>
            </MenuItem>
            <MenuItem>
              <button
                class="w-full px-4 py-3 flex cursor-pointer hover:bg-gray-100 text-red-500 items-center"
                @click="confirmDeleteItem(item)"
              >
                <font-awesome-icon icon="trash" class="mr-3" />
                Delete
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
      <div class="mt-2">
        <span class="mr-2">Manager:</span>
        <span class="text-gray-500">{{ item.manager?.firstName ?? '-' }} {{ item.manager?.lastName ?? '-' }}</span>
      </div>
    </div>
  </div>
  <div v-else class="flex items-center justify-center h-20 text-gray-500">No Department</div>
</template>
