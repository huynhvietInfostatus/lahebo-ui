<script lang="ts" setup>
import { pageSizes, PaginationInfo, SortableColumn, SortDirection, SortInfo } from '@/core/models/table.model'
import { useActionStore } from '@/store/use-action-store'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import ActionForm from './components/ActionForm.vue'
import { formatDate, hasPermission } from '@/core/helpers/common'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { Action, ActionActType, ActionStatus } from '@/core/models/action.model'
import ConfirmModal from '@/core/components/ConfirmModal.vue'
import ComponentLoading from '@/core/components/ComponentLoading.vue'
import { AppPermission } from '@/core/models/permission.model'
import ActionStatusUpdate from './components/ActionStatusUpdate.vue'
import { useAuthStore } from '@/store/use-auth-store'
import ActionView from './components/ActionView.vue'
import ActionFilter from './components/ActionFilter.vue'
import Pagination from '@/core/components/Pagination.vue'
import { LocationQueryValue, useRouter } from 'vue-router'
import { QueryParams } from '@/core/models/query-param.model'
import { RouteNames } from '@/core/models/app-router.model'
import { RoleEnum } from '@/core/models/role.model'

const isActionFormShow = ref(false)
const isViewActionShow = ref(false)
const isConfirmDeleteModalOpen = ref(false)
const isConfirmModalOpen = ref(false)
const actionStore = useActionStore()
const actionActType = ref<ActionActType>()
const authStore = useAuthStore()
const router = useRouter()

const { userId, userRole } = storeToRefs(authStore)
const { actions, status, total } = storeToRefs(actionStore)

const columns = ref<SortableColumn[]>([
  {
    label: 'Action',
    fullLabel: '',
    field: 'description',
    sortable: true
  },
  {
    label: 'Source',
    fullLabel: '',
    field: 'source',
    sortable: true
  },
  {
    label: 'Assignee',
    fullLabel: '',
    field: 'assignedFullName',
    sortable: true
  },
  {
    label: 'Location',
    fullLabel: '',
    field: 'location',
    sortable: true
  },
  {
    label: 'Department',
    fullLabel: '',
    field: 'department',
    sortable: true
  },
  {
    label: 'Due Date',
    fullLabel: '',
    field: 'dueDate',
    sortable: true
  },
  {
    label: 'Forecast Date',
    fullLabel: '',
    field: 'forecastDate',
    sortable: true
  },
  {
    label: 'Status',
    fullLabel: '',
    field: 'status',
    sortable: true,
    class: 'justify-center'
  }
])

const defaultSort: SortInfo = {
  col: 'createdAt',
  direction: 'DESC'
}

const sort = ref({ ...defaultSort })
let params = {}
const initialParams = ref<QueryParams>()

const selectedAction = ref<Action>()
const currentPage = ref<PaginationInfo>({
  current: 0,
  total: total.value,
  pageSize: 10,
  sibling: 1
})

watch(total, () => {
  currentPage.value.total = total.value
})

onMounted(() => {
  const { col, direction, pageSize, current, ...otherParams } = router.currentRoute.value.query
  sort.value.col = (col as unknown as string) ?? defaultSort.col
  sort.value.direction = (direction as unknown as SortDirection) ?? defaultSort.direction

  try {
    const _pageSize = +(pageSize ?? pageSizes[0])
    if (!pageSizes.includes(_pageSize)) currentPage.value.pageSize = pageSizes[0]
    else currentPage.value.pageSize = _pageSize
  } catch (error) {
    currentPage.value.pageSize = pageSizes[0]
  }

  try {
    currentPage.value.current = +(current ?? 0)
  } catch (error) {
    currentPage.value.current = 0
  }

  if (otherParams) {
    Object.keys(otherParams).forEach((key) => {
      if (key !== 'keyword' && !Array.isArray(otherParams[key])) {
        otherParams[key] = [otherParams[key] as LocationQueryValue]
      }
    })
    initialParams.value = otherParams as QueryParams
  } else {
    initialParams.value = {}
  }
})

const onClose = (changed?: boolean) => {
  if (changed) {
    doSearch()
  }
  isActionFormShow.value = false
  selectedAction.value = undefined
  isConfirmDeleteModalOpen.value = false
  isConfirmModalOpen.value = false
  isViewActionShow.value = false
}

const doSearch = () => {
  router.push({
    name: RouteNames.ACTION_MANAGEMENT,
    query: {
      ...sort.value,
      ...params,
      pageSize: currentPage.value.pageSize,
      current: currentPage.value.current
    }
  })
  actionStore.getActions({
    take: currentPage.value.pageSize,
    skip: currentPage.value.pageSize * currentPage.value.current,
    sortBy: `${sort.value.col}-${sort.value.direction}`,
    ...params
  })
}

const onSort = (event: SortInfo) => {
  if (!event.direction) {
    sort.value = { ...defaultSort }
  } else {
    sort.value = event
  }
  doSearch()
}

const onChangeParams = (p: any) => {
  params = p
  doSearch()
}

const onChangePage = (pageInfo: { [key: string]: number }) => {
  currentPage.value.current = pageInfo.page
  currentPage.value.pageSize = pageInfo.pageSize
  doSearch()
}

const deleteAction = () => {
  return new Promise((res, rej) => {
    actionStore
      .deleteAction(selectedAction.value!.actId)
      .then(() => {
        res(true)
      })
      .catch(() => rej(false))
  })
}
const openConfirmDeleteModal = (action: Action) => {
  selectedAction.value = action
  isConfirmDeleteModalOpen.value = true
}
const openConfirmModal = (action: Action, type: ActionActType) => {
  selectedAction.value = action
  actionActType.value = type
  isConfirmModalOpen.value = true
}

const openActionForm = (action?: Action) => {
  selectedAction.value = action
  isActionFormShow.value = true
}
const openViewAction = (action: Action) => {
  selectedAction.value = action
  isViewActionShow.value = true
}
</script>
<template>
  <ConfirmModal
    v-if="isConfirmDeleteModalOpen"
    title="Confirmation"
    type="danger"
    :on-ok="deleteAction"
    @close="onClose"
  >
    <template #body>Do you want to delete this action?</template>
  </ConfirmModal>
  <ActionView v-if="isViewActionShow" :action="selectedAction!" @close="onClose" />
  <ActionStatusUpdate
    v-if="isConfirmModalOpen"
    :action="selectedAction!"
    :type="actionActType!"
    @close="onClose"
  ></ActionStatusUpdate>

  <ActionForm v-if="isActionFormShow" :action="selectedAction" @close="onClose"></ActionForm>
  <div class="container-xl h-full px-4 sm:px-8 lg:px-16 xl:px-20 mx-auto pt-5 pb-6 flex flex-col">
    <PageHeader title="Action Management">
      <AppButton
        v-app-permission="[AppPermission.ACTION_CREATE]"
        icon="circle-plus"
        type="primary"
        @click="openActionForm"
      >
        Add Action
      </AppButton>
    </PageHeader>
    <div class="flex-1 flex flex-col rounded-lg w-full bg-base-white overflow-hidden">
      <ActionFilter
        v-if="initialParams != null"
        :params="initialParams"
        class="px-6 py-8"
        @on-change="onChangeParams"
      />
      <div class="overflow-y-auto flex-1 relative z-0">
        <ComponentLoading :loading="status === 'loading'" />

        <table class="lh-table">
          <thead class="font-bold">
            <tr>
              <th v-for="col in columns" :key="col.label" scope="col">
                <SortableTableHead :class="col.class" :sort-col="sort" :col="col" @on-sort="onSort"></SortableTableHead>
              </th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="action in actions" :key="action.actId" class="border-b">
              <td class="min-w-[220px] max-w-[320px]">
                <div
                  class="overflow-hidden inline-block max-w-full text-ellipsis hover:underline cursor-pointer"
                  @click="openViewAction(action)"
                >
                  {{ action.description }}
                </div>
              </td>
              <td class="min-w-[180px]">
                {{ action.actionSource.name }}
              </td>
              <td class="font-bold">
                {{ action.assignedUser?.firstName ?? '-' }} {{ action.assignedUser?.lastName ?? '-' }}
              </td>
              <td>
                <div v-if="action.location" class="whitespace-nowrap">
                  <font-awesome-icon icon="location-dot" class="mr-2" />
                  {{ action.location.name }}
                </div>
              </td>
              <td>
                <div v-if="action.department" class="whitespace-nowrap">
                  <font-awesome-icon icon="building" class="mr-2" />
                  {{ action.department.name }}
                </div>
              </td>
              <td>
                <div class="italic">{{ formatDate(action.dueDate) }}</div>
              </td>
              <td>
                <div class="italic">{{ formatDate(action.forecastDate) }}</div>
              </td>
              <td class="text-center">
                <AppStatus :status="action.status" type="action" />
              </td>
              <td class="!overflow-visible">
                <Menu as="div" class="relative inline-block text-left">
                  <MenuButton>
                    <font-awesome-icon icon="ellipsis-vertical" class="cursor-pointer px-1" />
                  </MenuButton>
                  <MenuItems
                    class="absolute w-56 divide-y divide-gray-100 bg-base-white overflow-hidden right-0 mt-2 py-2 origin-top-right rounded-md shadow-md focus:outline-none z-10"
                  >
                    <div>
                      <MenuItem
                        v-if="
                          (action.status === ActionStatus.OPEN || action.status === ActionStatus.REJECTED) &&
                          (action.department?.usrId === userId ||
                            action.location?.usrId === userId ||
                            action.assignedUsrId === userId ||
                            hasPermission([AppPermission.ACTION_SEND_FOR_APPROVAL]))
                        "
                      >
                        <button
                          class="w-full px-4 py-3 flex cursor-pointer hover:bg-gray-100 items-center"
                          @click="openConfirmModal(action, 'Send')"
                        >
                          <font-awesome-icon icon="paper-plane" class="mr-3" />
                          <span>Send For Approval</span>
                        </button>
                      </MenuItem>
                      <template
                        v-if="
                          action.status === ActionStatus.IN_REVIEW &&
                          (action.risk?.ownId === userId ||
                            action.department?.usrId === userId ||
                            action.location?.usrId === userId ||
                            hasPermission([AppPermission.ACTION_FORCE_REVIEW]))
                        "
                      >
                        <MenuItem>
                          <button
                            class="w-full px-4 py-3 flex cursor-pointer hover:bg-gray-100 items-center"
                            @click="openConfirmModal(action, 'Approve')"
                          >
                            <font-awesome-icon icon="check" class="mr-3" />
                            <span>Approve</span>
                          </button>
                        </MenuItem>
                        <MenuItem>
                          <button
                            class="w-full px-4 py-3 flex cursor-pointer hover:bg-gray-100 items-center"
                            @click="openConfirmModal(action, 'Reject')"
                          >
                            <font-awesome-icon icon="times" class="mr-3" />
                            <span>Reject</span>
                          </button>
                        </MenuItem>
                      </template>
                    </div>
                    <div
                      v-if="
                        action.assignedUsrId === userId ||
                        action.risk?.ownId === userId ||
                        action.usrId === userId ||
                        userRole?.name === RoleEnum.SUPER_ADMIN ||
                        userRole?.name === RoleEnum.MANAGER
                      "
                    >
                      <MenuItem>
                        <button
                          class="w-full px-4 py-3 flex cursor-pointer hover:bg-gray-100 items-center"
                          @click="openActionForm(action)"
                        >
                          <font-awesome-icon icon="pen" class="mr-3" />
                          <span>Edit</span>
                        </button>
                      </MenuItem>
                      <MenuItem>
                        <button
                          class="w-full px-4 py-3 flex cursor-pointer hover:bg-gray-100 text-red-500 items-center"
                          @click="openConfirmDeleteModal(action)"
                        >
                          <font-awesome-icon icon="trash" class="mr-3" />
                          Delete
                        </button>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Menu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination class="px-6 py-8" :page-info="currentPage" @on-page-change="onChangePage" />
    </div>
  </div>
</template>
