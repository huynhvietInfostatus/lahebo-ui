<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import ConfirmModal from '@/core/components/ConfirmModal.vue'
import { storeToRefs } from 'pinia'
import { useUserSetupStore } from '@/store/use-user-setup-store'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { PageInfo, SortableColumn, SortInfo } from '@/core/models/table.model'
import { OrgUser } from '@/core/models/user.model'
import UserSetupForm from './components/UserSetupForm.vue'
import ComponentLoading from '@/core/components/ComponentLoading.vue'
import { useOrgDepartmentStore } from '@/store/use-org-department-store'
import { useOrgLocationStore } from '@/store/use-org-location-store'
import { QueryParams } from '@/core/models/query-param.model'
import { RoleNames } from '@/core/models/role.model'

const selectedUser = ref<OrgUser>()
const isDetailModalShow = ref(false)
const isConfirmModalShow = ref(false)
const _userSetupStore = useUserSetupStore()
const { users, listStatus, listRoles } = storeToRefs(_userSetupStore)
const departmentStore = useOrgDepartmentStore()
const locationStore = useOrgLocationStore()
const { departments } = storeToRefs(departmentStore)
const { locations } = storeToRefs(locationStore)

interface FilterState {
  depId: string | null
  locId: string | null
  rolIds: string | null
}

const filterState = ref<FilterState>({ depId: null, locId: null, rolIds: null })

watch(filterState.value, () => {
  doSearch()
})

const columns = ref<SortableColumn[]>([
  {
    label: 'First Name',
    fullLabel: '',
    field: 'firstName',
    sortable: true
  },
  {
    label: 'Last Name',
    fullLabel: '',
    field: 'lastName',
    sortable: true
  },
  {
    label: 'Phone Number',
    fullLabel: '',
    field: 'phoneNumber',
    sortable: true
  },
  {
    label: 'Email',
    fullLabel: '',
    field: 'email',
    sortable: true
  },
  {
    label: 'Username',
    fullLabel: '',
    field: 'username',
    sortable: true
  },
  {
    label: 'Departments',
    fullLabel: '',
    field: 'departments',
    sortable: false
  },
  {
    label: 'Locations',
    fullLabel: '',
    field: 'locations',
    sortable: false
  },
  {
    label: 'Role',
    fullLabel: '',
    field: 'role',
    sortable: true
  }
])

const defaultSort: SortInfo = {
  col: 'createdAt',
  direction: 'DESC'
}

const currentPage = ref<PageInfo>({
  take: 20,
  skip: 0
})

const sort = ref({ ...defaultSort })

const openConfirmModal = (item: OrgUser) => {
  isConfirmModalShow.value = true
  selectedUser.value = item
}

const deleteUser = () => {
  return new Promise((res, rej) => {
    _userSetupStore
      .deleteUser(selectedUser.value!.usrId!)
      .then(() => {
        res(null)
      })
      .catch(() => {
        rej()
      })
  })
}

const doSearch = () => {
  const filters = filterState.value as QueryParams
  _userSetupStore.getUserList({
    ...filters,
    take: currentPage.value.take,
    skip: currentPage.value.skip,
    sortBy: `${sort.value.col}-${sort.value.direction}`
  })
}

const openDetailModal = (item?: OrgUser) => {
  selectedUser.value = item
  isDetailModalShow.value = true
}

const clearSearch = () => {
  filterState.value.depId = null
  filterState.value.locId = null
  filterState.value.rolIds = null
}

onMounted(() => {
  doSearch()
  locationStore.getLocations()
  departmentStore.getDepartments()
  _userSetupStore.getRoles()
})

onUnmounted(() => {
  _userSetupStore.$reset()
})

const closeModal = (value: any) => {
  isConfirmModalShow.value = false
  isDetailModalShow.value = false
  selectedUser.value = undefined
  if (value) doSearch()
}

const onSort = (event: SortInfo) => {
  if (!event.direction) {
    sort.value = { ...defaultSort }
  } else {
    sort.value = event
  }
  doSearch()
}
</script>

<template>
  <UserSetupForm v-if="isDetailModalShow" :user="selectedUser" @close="closeModal"> </UserSetupForm>
  <ConfirmModal
    v-if="isConfirmModalShow"
    title="Confirmation"
    ok-icon="box-archive"
    ok-text="Archive"
    :on-ok="deleteUser"
    type="danger"
    @close="closeModal"
  >
    <template #body> Do you want to archive this user? </template>
  </ConfirmModal>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-6">
      <div class="text-xl uppercase font-semibold text-primary-500">User Setup</div>
      <button
        type="button"
        class="text-base-white bg-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-primary-700 focus:ring-2 focus:ring-primary-300 font-medium rounded px-4 h-[36px] focus:outline-none dark:focus:ring-blue-800"
        @click="openDetailModal()"
      >
        <font-awesome-icon icon="circle-plus" class="mr-2" />
        Add user
      </button>
    </div>
    <div class="flex-1 flex flex-col bg-base-white rounded-lg shadow-md py-10 relative min-h-[200px]">
      <div class="flex items-center space-x-4 px-8 mb-8 max-w-6xl">
        <vue-select
          v-model="filterState.rolIds"
          :options="listRoles"
          :reduce="(role: any) => role.rolId"
          label="name"
          placeholder="Select Role"
          class="flex-1"
        >
          <template #selected-option="{ name }">
            {{ RoleNames[name] }}
          </template>
          <template #option="{ name }">
            {{ RoleNames[name] }}
          </template>
        </vue-select>
        <vue-select
          v-model="filterState.depId"
          :options="departments"
          :reduce="(dep: any) => dep.depId"
          label="name"
          placeholder="Select Department"
          class="flex-1"
        />
        <vue-select
          v-model="filterState.locId"
          :options="locations"
          :reduce="(loc: any) => loc.locId"
          label="name"
          placeholder="Select Location"
          class="flex-1"
        />
        <AppButton
          icon="times"
          :disabled="!filterState.depId && !filterState.locId && !filterState.rolIds"
          @click="clearSearch"
        >
          Clear
        </AppButton>
      </div>
      <div class="relative flex-1 overflow-y-auto">
        <ComponentLoading :loading="listStatus === 'loading'">
          <table class="lh-table">
            <thead class="bg-gray-100 text-gray-700">
              <tr>
                <th v-for="col in columns" :key="col.label" scope="col">
                  <SortableTableHead :sort-col="sort" :col="col" @on-sort="onSort"></SortableTableHead>
                </th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in users" :key="index" class="bg-white border-b">
                <th scope="row" class="font-medium min-w-[120px] text-gray-700 whitespace-nowrap">
                  {{ item.firstName }}
                </th>
                <td class="min-w-[120px]">{{ item.lastName }}</td>
                <td v-phone-number class="min-w-[180px]">{{ item.phoneNumber }}</td>
                <td class="">{{ item.email }}</td>
                <td class="">{{ item.username }}</td>
                <td class="max-w-[120px] overflow-hidden text-ellipsis">
                  {{ (item.departmentString ?? []).join(',') }}
                </td>
                <td class="max-w-[120px] overflow-hidden text-ellipsis">
                  {{ (item.locationString ?? []).join(', ') }}
                </td>
                <td class="font-semibold">{{ RoleNames[item.role.name] }}</td>

                <td class="text-right !overflow-visible">
                  <Menu as="div" class="relative inline-block text-left">
                    <div>
                      <MenuButton
                        class="text-gray-600 hover:text-gray-700 transition-colors duration-200 focus:shadow-outline-purple focus:outline-none"
                      >
                        <font-awesome-icon icon="ellipsis-vertical" class="w-5 h-5" />
                      </MenuButton>
                    </div>
                    <transition
                      enter-active-class="transition duration-100 ease-out"
                      enter-from-class="transform scale-95 opacity-0"
                      enter-to-class="transform scale-100 opacity-100"
                      leave-active-class="transition duration-75 ease-in"
                      leave-from-class="transform scale-100 opacity-100"
                      leave-to-class="transform scale-95 opacity-0"
                    >
                      <MenuItems
                        class="absolute z-10 bg-base-white overflow-hidden right-0 mt-2 py-2 w-48 origin-top-right rounded-md shadow-md focus:outline-none"
                      >
                        <MenuItem v-slot="{ active }">
                          <button
                            :class="[
                              active ? 'bg-primary-500 text-base-white' : 'text-gray-700',
                              'group flex w-full items-center px-4 py-3'
                            ]"
                            @click="openDetailModal(item)"
                          >
                            <font-awesome-icon icon="pen" class="mr-4" />
                            Edit
                          </button>
                        </MenuItem>
                        <MenuItem v-slot="{ active }">
                          <button
                            :class="[
                              active ? 'bg-red-500 text-base-white' : 'text-red-500',
                              'group flex w-full items-center px-4 py-3'
                            ]"
                            @click="openConfirmModal(item)"
                          >
                            <font-awesome-icon icon="trash" class="mr-3" />
                            Delete
                          </button>
                        </MenuItem>
                      </MenuItems>
                    </transition>
                  </Menu>
                </td>
              </tr>
            </tbody>
          </table>
        </ComponentLoading>
      </div>
    </div>
  </div>
</template>
