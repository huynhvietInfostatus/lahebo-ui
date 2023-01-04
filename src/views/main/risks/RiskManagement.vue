<script lang="ts" setup>
import { useRiskStore } from '@/store/use-risk-store'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { LocationQueryValue, useRouter } from 'vue-router'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { formatDate, getUserName, hasPermission } from '@/core/helpers/common'
import { ActionType, Risk, RiskStatus } from '@/core/models/risk.model'
import ConfirmModal from '@/core/components/ConfirmModal.vue'
import RiskForm from '@/views/main/risks/RiskForm.vue'
import RaiseRiskForm from '@/views/main/risks/RaiseRiskForm.vue'
import { useRiskMatrixStore } from '@/store/use-risk-matrix.store'
import { RouteNames } from '@/core/models/app-router.model'
import RiskMitigations from '@/views/main/risks/RiskMitigations.vue'
import { pageSizes, PaginationInfo, SortableColumn, SortDirection, SortInfo } from '@/core/models/table.model'
import { AppPermission } from '@/core/models/permission.model'
import RiskStatusUpdate from './components/RiskStatusUpdate.vue'
import ComponentLoading from '@/core/components/ComponentLoading.vue'
import { useAuthStore } from '@/store/use-auth-store'
import RiskHistory from './components/RiskHistory.vue'
import RiskFilter from './components/RiskFilter.vue'
import Pagination from '@/core/components/Pagination.vue'
import { QueryParams } from '@/core/models/query-param.model'
import { RoleEnum } from '@/core/models/role.model'
import toastService from '@/core/helpers/toast-service'

const toast = useToast()
const riskMatrixStore = useRiskMatrixStore()
const { exposureLevels } = storeToRefs(riskMatrixStore)
const riskStore = useRiskStore()
const router = useRouter()
const authStore = useAuthStore()

const { userId, userRole } = storeToRefs(authStore)

const { risks, status, totalRecords } = storeToRefs(riskStore)

const getBeforeRme = (risk: Risk) => {
  if (risk.beforeRml && risk.beforeRms) {
    const value = risk.beforeRml.value * risk.beforeRms.value
    const rme = exposureLevels.value.find((it) => it.fromValue <= value && it.toValue >= value)
    return {
      value,
      name: rme?.name,
      color: rme?.color
    }
  }
}

const getAfterRme = (risk: Risk) => {
  if (risk.afterRml && risk.afterRms) {
    const value = risk.afterRml.value * risk.afterRms.value
    const rme = exposureLevels.value.find((it) => it.fromValue <= value && it.toValue >= value)
    return {
      value,
      name: rme?.name,
      color: rme?.color
    }
  }
}

const maxExposureValue = computed(() => {
  if (exposureLevels.value.length === 0) {
    return 1
  } else {
    return Math.max(...exposureLevels.value.map((it) => it.toValue))
  }
})

const adjustedRisks = computed(() => {
  return risks.value.map((it) => ({
    ...it,
    username: getUserName(it.owner),
    beforeRme: getBeforeRme(it),
    afterRme: getAfterRme(it),
    formattedCreatedAt: formatDate(it.createdAt),
    formattedDueDate: formatDate(it.dueDate)
  }))
})

const selectedRisk = ref<Risk>()
const actionType = ref<ActionType>()
const isShowRiskForm = ref(false)
const isShowRaiseRiskForm = ref(false)
const isShowMitigationForm = ref(false)
const isShowDeleteConfirmation = ref(false)
const isShowConfirmation = ref(false)
const isShowUpdateStatusConfirmation = ref(false)
const isShowHistories = ref(false)
const columns = ref<SortableColumn[]>([
  {
    label: 'Risk',
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
    label: 'Risk Owner',
    fullLabel: '',
    field: 'ownerName',
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
    label: 'IL',
    fullLabel: 'Inherent Likelihood',
    field: 'likelihoodBefore',
    sortable: true
  },
  {
    label: 'IC',
    fullLabel: 'Inherent Consequence',
    field: 'consequenceBefore',
    sortable: true
  },
  {
    label: 'IRE',
    fullLabel: 'Inherent Risk Exposure Level',
    field: 'beforeRme',
    sortable: false
  },
  {
    label: 'RL',
    fullLabel: 'Residual Likelihood',
    field: 'likelihoodAfter',
    sortable: true
  },
  {
    label: 'RC',
    fullLabel: 'Residual Consequence',
    field: 'consequenceAfter',
    sortable: true
  },
  {
    label: 'RRE',
    fullLabel: 'Residual Risk Exposure Level',
    field: 'afterRme',
    sortable: false
  },
  {
    label: 'Due Date',
    fullLabel: '',
    field: 'dueDate',
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
const currentSort = ref<SortInfo>({ ...defaultSort })
const currentPage = ref<PaginationInfo>({
  current: 0,
  total: totalRecords.value,
  pageSize: 10,
  sibling: 1
})
let params = {}
const initialParams = ref<QueryParams>()

watch(totalRecords, () => {
  currentPage.value.total = totalRecords.value
})

const doSearch = (nav = true) => {
  if (nav)
    router.push({
      name: RouteNames.RISK_MANAGEMENT,
      query: {
        ...currentSort.value,
        ...params,
        pageSize: currentPage.value.pageSize,
        current: currentPage.value.current
      }
    })
  return riskStore.fetchRisks({
    take: currentPage.value.pageSize,
    skip: currentPage.value.pageSize * currentPage.value.current,
    sortBy: `${currentSort.value.col}-${currentSort.value.direction}`,
    ...params
  })
}

const onSort = (event: SortInfo) => {
  if (!event.direction) {
    currentSort.value = { ...defaultSort }
  } else {
    currentSort.value = event
  }
  doSearch()
}

onMounted(() => {
  const { col, direction, pageSize, current, ...otherParams } = router.currentRoute.value.query
  currentSort.value.col = (col as unknown as string) ?? defaultSort.col
  currentSort.value.direction = (direction as unknown as SortDirection) ?? defaultSort.direction

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

  if (exposureLevels.value.length === 0) {
    riskMatrixStore.getRiskMatrixExposureLevels()
  }
})

const onEditRisk = (value: Risk) => {
  if (value.status === RiskStatus.DRAFT) showRaisedRiskForm(value)
  else showRiskForm(value)
}

const showRiskForm = (value?: Risk) => {
  selectedRisk.value = value
  isShowRiskForm.value = true
}
const showRaisedRiskForm = (value?: Risk) => {
  selectedRisk.value = value
  isShowRaiseRiskForm.value = true
}

const onShowDeleteConfirmation = (value: Risk) => {
  selectedRisk.value = value
  isShowDeleteConfirmation.value = true
}
const onShowConfirm = (value: Risk, type: ActionType) => {
  selectedRisk.value = value
  actionType.value = type
  isShowConfirmation.value = true
}
const onShowHistories = (value: Risk) => {
  selectedRisk.value = value
  isShowHistories.value = true
}

const onDeleteRisk = () =>
  new Promise((resolve, reject) => {
    riskStore.deleteRisk(selectedRisk.value!.rskId).then(
      () => {
        toast.success('Deleted the risk successfully')
        resolve(true)
      },
      (err) => {
        console.log(err)
        reject(false)
      }
    )
  })

const onShowMitigationForm = (value: Risk) => {
  selectedRisk.value = value
  isShowMitigationForm.value = true
}

const onCloseModal = (changed?: boolean) => {
  if (changed) {
    const riskId = selectedRisk.value?.rskId
    const type = actionType.value
    doSearch().then(() => {
      if (type === 'Accept') {
        selectedRisk.value = risks.value.find((r) => r.rskId === riskId)
        isShowRiskForm.value = true
      }
    })
  }
  selectedRisk.value = undefined
  isShowRaiseRiskForm.value = false
  isShowUpdateStatusConfirmation.value = false
  isShowConfirmation.value = false
  isShowDeleteConfirmation.value = false
  isShowRiskForm.value = false
  isShowMitigationForm.value = false
  actionType.value = undefined
  isShowHistories.value = false
}

const onChangePage = (pageInfo: { [key: string]: number }) => {
  currentPage.value.current = pageInfo.page
  currentPage.value.pageSize = pageInfo.pageSize
  doSearch()
}

const onChangeParams = (p: any) => {
  params = p
  doSearch()
}

const updateStatus = (value: any, riskId: string) => {
  riskStore.updateRiskStatusValue(riskId, value).then(() => {
    toastService.success('Update status successfully!')
  })
}

const toPage = (name: string) => {
  router.push({ name })
}
</script>

<template>
  <RiskHistory v-if="isShowHistories" :risk-id="selectedRisk!.rskId" @close="onCloseModal"></RiskHistory>
  <div class="container-xl h-full px-4 sm:px-8 lg:px-16 xl:px-20 mx-auto pt-5 pb-6 flex flex-col">
    <PageHeader title="Risk Register">
      <AppButton
        v-app-permission="[AppPermission.RISK_UPLOAD]"
        icon="upload"
        class="mr-2"
        type="light"
        @click="toPage(RouteNames.RISK_UPLOADER)"
      >
        Upload Risks
      </AppButton>
      <AppButton
        v-app-permission="[AppPermission.RISK_SWOT]"
        icon="eye"
        class="mr-2"
        type="light"
        @click="toPage(RouteNames.SWOT)"
      >
        View SWOT
      </AppButton>
      <Menu as="div" class="relative inline-block text-left">
        <div>
          <MenuButton
            class="text-base-white bg-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-primary-700 focus:ring-2 focus:ring-primary-300 font-medium rounded px-4 h-[36px] focus:outline-none dark:focus:ring-blue-800"
          >
            <font-awesome-icon icon="plus-circle" class="mr-2" />
            Add/Raise Risk
          </MenuButton>
        </div>
        <MenuItems
          class="absolute z-[100] bg-base-white overflow-hidden right-0 mt-2 w-[144px] py-2 origin-top-right rounded-md shadow-md focus:outline-none"
        >
          <MenuItem v-app-role.exclude="[RoleEnum.USER]" v-app-permission="[AppPermission.RISK_CREATE]">
            <button class="py-3 px-6 w-full text-left cursor-pointer hover:bg-gray-100" @click="showRiskForm()">
              Add New Risk
            </button>
          </MenuItem>
          <MenuItem>
            <button class="py-3 px-6 w-full text-left cursor-pointer hover:bg-gray-100" @click="showRaisedRiskForm()">
              Raise a Risk
            </button>
          </MenuItem>
        </MenuItems>
      </Menu>
    </PageHeader>
    <div class="flex-1 flex flex-col rounded-lg w-full bg-base-white overflow-hidden">
      <RiskFilter v-if="initialParams != null" class="px-6 py-8" :params="initialParams" @on-change="onChangeParams" />
      <div class="overflow-y-auto flex-1 relative z-0">
        <ComponentLoading :loading="status === 'loading'" />
        <table v-if="adjustedRisks.length" class="lh-table">
          <thead class="font-bold bg-gray-100">
            <tr>
              <th v-for="col in columns" :key="col.label" scope="col">
                <SortableTableHead
                  :class="col.class"
                  :sort-col="currentSort"
                  :col="col"
                  @on-sort="onSort"
                ></SortableTableHead>
              </th>
              <th scope="col" class="px-2 py-6"></th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="risk in adjustedRisks" :key="risk.rskId" class="bg-white border-b">
              <td class="min-w-[220px] max-w-[320px]">
                {{ risk.description }}
              </td>
              <td class="min-w-[180px]">{{ risk.riskSource?.name ?? '-' }}</td>
              <td class="font-bold">
                {{ risk.username }}
              </td>
              <td>
                <div v-if="risk.location" class="whitespace-nowrap">
                  <font-awesome-icon icon="location-dot" class="mr-2" />
                  {{ risk.location.name }}
                </div>
              </td>
              <td>
                <div v-if="risk.department" class="whitespace-nowrap">
                  <font-awesome-icon icon="building" class="mr-2" />

                  {{ risk.department.name }}
                </div>
              </td>
              <td>{{ risk.beforeRml?.value ?? '-' }}</td>
              <td>{{ risk.afterRms?.value ?? '-' }}</td>
              <td>
                <RiskExposure
                  v-if="risk.beforeRme?.value"
                  :color="risk.beforeRme?.color ?? '#FFFFFF'"
                  :name="risk.beforeRme?.name ?? ''"
                  :value="risk.beforeRme?.value"
                  :max-value="maxExposureValue"
                >
                </RiskExposure>
              </td>
              <td>{{ risk.afterRml?.value ?? '-' }}</td>
              <td>{{ risk.afterRms?.value ?? '-' }}</td>
              <td>
                <RiskExposure
                  v-if="risk.afterRme?.value"
                  :color="risk.afterRme?.color ?? '#FFFFFF'"
                  :name="risk.afterRme?.name ?? ''"
                  :value="risk.afterRme?.value"
                  :max-value="maxExposureValue"
                >
                </RiskExposure>
              </td>
              <td class="italic">{{ risk.formattedDueDate || '-' }}</td>
              <td class="text-center !overflow-visible">
                <AppStatus
                  :can-update="
                    (risk.ownId === userId || userRole?.name === RoleEnum.SUPER_ADMIN) &&
                    risk.status === RiskStatus.OPEN &&
                    !risk.actions.length
                  "
                  :status="risk.status"
                  type="risk"
                  @on-change="(value:any) => updateStatus(value, risk.rskId)"
                />
              </td>
              <td class="!overflow-visible">
                <Menu as="div" class="relative inline-block text-left">
                  <MenuButton>
                    <font-awesome-icon icon="ellipsis-vertical" class="cursor-pointer px-1" />
                  </MenuButton>
                  <MenuItems
                    class="absolute w-56 divide-y divide-gray-100 bg-base-white overflow-hidden right-0 mt-2 py-2 origin-top-right rounded-md shadow-md focus:outline-none z-10"
                  >
                    <div
                      v-if="
                        risk.status === RiskStatus.DRAFT &&
                        (risk.ownId === userId ||
                          risk.department?.usrId === userId ||
                          risk.location?.usrId === userId ||
                          hasPermission([AppPermission.RISK_FORCE_REVIEW]))
                      "
                    >
                      <MenuItem>
                        <button
                          class="w-full flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100"
                          @click="onShowConfirm(risk, 'Accept')"
                        >
                          <font-awesome-icon icon="check" class="mr-3" />
                          <span>Accept</span>
                        </button>
                      </MenuItem>
                      <MenuItem>
                        <button
                          class="w-full flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100"
                          @click="onShowConfirm(risk, 'Unaccept')"
                        >
                          <font-awesome-icon icon="times" class="mr-3" />
                          <span>Reject</span>
                        </button>
                      </MenuItem>
                    </div>
                    <div
                      v-if="
                        risk.status === RiskStatus.AWAITING_REVIEW &&
                        (risk.ownId === userId || hasPermission([AppPermission.RISK_FORCE_REVIEW]))
                      "
                    >
                      <MenuItem>
                        <button
                          class="w-full flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100"
                          @click="onShowConfirm(risk, 'Approve')"
                        >
                          <font-awesome-icon icon="check" class="mr-3" />
                          <span>Approve</span>
                        </button>
                      </MenuItem>
                      <MenuItem>
                        <button
                          class="w-full flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100"
                          @click="onShowConfirm(risk, 'Reject')"
                        >
                          <font-awesome-icon icon="times" class="mr-3" />
                          <span>Reject</span>
                        </button>
                      </MenuItem>
                    </div>
                    <div>
                      <MenuItem v-if="risk.status !== RiskStatus.DRAFT" v-app-permission="[AppPermission.RISK_EDIT]">
                        <button
                          class="w-full flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100"
                          @click="onShowMitigationForm(risk)"
                        >
                          <font-awesome-icon icon="eye" class="mr-3" />
                          <span>Mitigation</span>
                        </button>
                      </MenuItem>
                      <MenuItem v-if="risk.status !== RiskStatus.DRAFT">
                        <button
                          class="w-full flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100"
                          @click="onShowHistories(risk)"
                        >
                          <font-awesome-icon icon="clock" class="mr-3" />
                          <span>History</span>
                        </button>
                      </MenuItem>
                    </div>
                    <div>
                      <MenuItem v-app-permission="[AppPermission.RISK_EDIT]">
                        <button
                          class="w-full flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100"
                          @click="onEditRisk(risk)"
                        >
                          <font-awesome-icon icon="pen" class="mr-3" />
                          <span>Edit</span>
                        </button>
                      </MenuItem>
                      <MenuItem
                        v-if="
                          risk.status === RiskStatus.DRAFT ||
                          RiskStatus.OPEN ||
                          risk.ownId === userId ||
                          risk.department?.usrId === userId ||
                          risk.location?.usrId === userId
                        "
                        v-app-permission="[AppPermission.RISK_DELETE]"
                      >
                        <button
                          class="w-full text-red-500 flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100"
                          @click="onShowDeleteConfirmation(risk)"
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
        <div v-else class="text-center min-h-[120px] flex items-center justify-center">No Risk Found</div>
      </div>
      <Pagination class="px-6 py-8" :page-info="currentPage" @on-page-change="onChangePage" />
    </div>
    <risk-form v-if="isShowRiskForm" :risk="selectedRisk" @close="onCloseModal" />
    <raise-risk-form v-if="isShowRaiseRiskForm" :risk="selectedRisk" @close="onCloseModal" />
    <risk-mitigations v-if="isShowMitigationForm" :risk="selectedRisk" @close="onCloseModal" />
    <confirm-modal
      v-if="isShowDeleteConfirmation"
      type="danger"
      title="Confirmation"
      :on-ok="onDeleteRisk"
      ok-icon="trash"
      ok-text="Delete"
      @close="onCloseModal"
    >
      <template #body>
        <div class="leading-relaxed">
          This will permanently delete the Risk and Associated Actions and Subtasks. These items will no longer be
          accessible to you or anyone else. This Action is irreversible.
        </div>
      </template>
    </confirm-modal>
    <RiskStatusUpdate
      v-if="isShowConfirmation"
      :type="actionType!"
      :risk="selectedRisk!"
      @close="onCloseModal"
    ></RiskStatusUpdate>
  </div>
</template>

<style scoped>
.capitalize {
  text-transform: lowercase;
}

.capitalize:first-letter {
  text-transform: uppercase;
}
</style>
