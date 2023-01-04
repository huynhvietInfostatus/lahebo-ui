<script lang="ts" setup>
import { useOrgLocationStore } from '@/store/use-org-location-store'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import OrgLocationForm from './components/OrgLocationForm.vue'
import { OrgLocation } from '@/core/models/org-location.model'
import { useLoading } from 'vue-loading-overlay'
import toastService from '@/core/helpers/toast-service'

const isLocationFormShow = ref(false)
const isConfirmModalShow = ref(false)
const isConfirmHeadOfficeModalShow = ref(false)
const orgLocationStore = useOrgLocationStore()
const { locations } = storeToRefs(orgLocationStore)
const selectedLocation = ref<OrgLocation | undefined>()
const $loading = useLoading()
const editLocation = (item: OrgLocation) => {
  selectedLocation.value = item
  isLocationFormShow.value = true
}
const onClose = (value: any) => {
  if (value) {
    getLocations()
  }
  isLocationFormShow.value = false
  isConfirmModalShow.value = false
  isConfirmHeadOfficeModalShow.value = false
  selectedLocation.value = undefined
}
const confirmDeleteItem = (item: OrgLocation) => {
  selectedLocation.value = item
  isConfirmModalShow.value = true
}
const confirmHeadOffice = (item: OrgLocation) => {
  selectedLocation.value = item
  isConfirmHeadOfficeModalShow.value = true
}

const setAsHeadOffice = () => {
  return new Promise((resolve, reject) => {
    orgLocationStore
      .updateLocation(selectedLocation.value!.locId, { isHeadOffice: true })
      .then(() => {
        orgLocationStore.getLocations()
        resolve(null)
      })
      .catch(() => reject())
  })
}

const deleteItem = () =>
  new Promise((resolve, reject) => {
    orgLocationStore
      .deleteLocation(selectedLocation.value!.locId)
      .then(() => {
        toastService.success('The location has been deleted!')
        resolve(null)
      })
      .catch(() => reject())
  })

const getLocations = () => {
  const loader = $loading.show()
  orgLocationStore
    .getLocations()
    .then(() => {
      loader.hide()
    })
    .catch(() => loader.hide())
}
onMounted(() => {
  getLocations()
})
</script>
<template>
  <OrgLocationForm v-if="isLocationFormShow" :location="selectedLocation" @close="onClose"></OrgLocationForm>
  <ConfirmModal v-if="isConfirmModalShow" title="Confirmation" :on-ok="deleteItem" type="danger" @close="onClose">
    <template #body> Do you want to delete this Location? </template></ConfirmModal
  >
  <ConfirmModal v-if="isConfirmHeadOfficeModalShow" title="Confirmation" :on-ok="setAsHeadOffice" @close="onClose">
    <template #body>
      Do you want to set <b>{{ selectedLocation?.name }}</b> as Head Office?
    </template></ConfirmModal
  >
  <PageHeader title="Locations">
    <button
      type="button"
      class="text-base-white bg-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-primary-700 focus:ring-2 focus:ring-primary-300 font-medium rounded pl-6 pr-4 h-[36px] focus:outline-none dark:focus:ring-blue-800"
      @click="isLocationFormShow = true"
    >
      <font-awesome-icon icon="circle-plus" class="mr-2" />
      Add Location
    </button>
  </PageHeader>
  <div v-if="locations.length" class="space-y-4">
    <div v-for="item in locations" :key="item.locId" class="bg-base-white px-6 py-5 rounded-lg shadow">
      <div class="flex justify-between items-center">
        <div class="flex items-center">
          <span class="text-xl font-medium">{{ item.name }}</span>
          <div
            v-if="item.isHeadOffice"
            class="text-primary-500 text-sm border-primary-500 border px-2 py-1 rounded ml-3"
          >
            Head Office
          </div>
        </div>

        <Menu as="div" class="relative inline-block text-left">
          <MenuButton>
            <font-awesome-icon icon="ellipsis-vertical" class="cursor-pointer px-1" />
          </MenuButton>
          <MenuItems
            class="absolute w-56 bg-base-white overflow-hidden right-0 mt-2 py-2 origin-top-right rounded-md shadow-md focus:outline-none z-10"
          >
            <MenuItem v-if="!item.isHeadOffice">
              <button
                class="w-full pl-6 pr-4 py-3 flex cursor-pointer hover:bg-gray-100 border-b border-gray-100 items-center"
                @click="confirmHeadOffice(item)"
              >
                <font-awesome-icon icon="check-circle" class="mr-3" />
                <span>Set as Head Office</span>
              </button>
            </MenuItem>
            <MenuItem>
              <button
                class="w-full pl-6 pr-4 py-3 flex cursor-pointer hover:bg-gray-100 border-b border-gray-100 items-center"
                @click="editLocation(item)"
              >
                <font-awesome-icon icon="pen" class="mr-3" />
                <span>Edit</span>
              </button>
            </MenuItem>
            <MenuItem :disabled="item.isHeadOffice">
              <button
                class="w-full pl-6 pr-4 py-3 flex cursor-pointer disabled:cursor-not-allowed disabled:text-red-300 hover:bg-gray-100 text-red-500 items-center"
                @click="confirmDeleteItem(item)"
              >
                <font-awesome-icon icon="trash" class="mr-3" />
                Delete
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
      <ul class="space-y-2 mt-2">
        <li class="text-gray-500">
          <font-awesome-icon icon="user-tie" class="mr-4" />
          {{ item.keyContact?.firstName ?? '-' }} {{ item.keyContact?.lastName ?? '-' }}
        </li>
        <li class="text-gray-500">
          <font-awesome-icon icon="phone" class="mr-4" />
          <span v-phone-number>{{ item.phoneNumber }}</span>
        </li>
        <li class="text-gray-500"><font-awesome-icon icon="location-dot" class="mr-4" /> {{ item.address }}</li>
      </ul>
    </div>
  </div>
  <div v-else class="flex items-center justify-center h-20 text-gray-500">No Location</div>
</template>
