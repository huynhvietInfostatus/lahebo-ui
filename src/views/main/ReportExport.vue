<script lang="ts" setup>
import FilterDropDown from '@/core/components/FilterDropDown.vue'
import { FilterDropDownItem } from '@/core/models/common.model'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { formatDate, getUserName } from '@/core/helpers/common'
import { useReportStore } from '@/store/use-report-store'
import { storeToRefs } from 'pinia'
import { useRiskMatrixStore } from '@/store/use-risk-matrix.store'
import { Risk, RiskReport, RiskStatus, RiskStatusText } from '@/core/models/risk.model'
import ComponentLoading from '@/core/components/ComponentLoading.vue'
import { exportCSVFile } from '@/core/helpers/csv-export'
import { ActionStatus, ActionStatusName, ActionReport } from '@/core/models/action.model'
import { useAuthStore } from '@/store/use-auth-store'
import { QueryParams } from '@/core/models/query-param.model'
import { RoleEnum } from '@/core/models/role.model'
import moment from 'moment'

interface FilterState {
  types: string[] | number[]
  dateRange: string[]
  departments: string[]
  locations: string[]
}

// define variables
const reportStore = useReportStore()
const riskMatrixStore = useRiskMatrixStore()
const { exposureLevels } = storeToRefs(riskMatrixStore)
const authStore = useAuthStore()

// get store value
const { userDepartments, userLocations, userRole } = storeToRefs(authStore)
const { risks, status, actionTotal, riskTotal, actions } = storeToRefs(reportStore)

const hasSearch = ref(false)

onMounted(() => {
  if (exposureLevels.value.length === 0) {
    riskMatrixStore.getRiskMatrixExposureLevels()
  }
})

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

const exportModules: FilterDropDownItem[] = [
  { name: 'Risk Register', id: 'risk', hidden: userRole.value?.name === RoleEnum.USER },
  { name: 'Action Center', id: 'action' }
]

const maxExposureValue = computed(() => {
  if (exposureLevels.value.length === 0) {
    return 1
  } else {
    return Math.max(...exposureLevels.value.map((it) => it.toValue))
  }
})

const module = ref([])

const riskFilterState = ref({
  types: [],
  dateRange: [],
  departments: [],
  locations: []
})
const actionFilterState = ref({
  types: [],
  dateRange: [],
  departments: [],
  locations: []
})

const riskColumns = [
  'Risk',
  'Source',
  'Risk Owner',
  'Location',
  'Department',
  'IL',
  'IC',
  'IRE',
  'RL',
  'RC',
  'RRE',
  'Due Date',
  'Status'
]
const actionColumns = ['Action', 'Source', 'Assignee', 'Location', 'Department', 'Due Date', 'Forecast Date', 'Status']

const exportCsv = () => {
  if (!module.value.length) return

  if (module.value[0] === 'risk') {
    var exportRisks = adjustedRisks.value.map((a) => {
      return {
        risk: a.description,
        source: a.riskSource?.name ?? '',
        owner: getUserName(a.owner),
        department: a.department?.name ?? '',
        location: a.location?.name ?? '',
        il: a.beforeRml?.value ?? 0,
        ic: a.afterRml?.value ?? 0,
        ire: a.beforeRme?.value ?? 0,
        rl: a.afterRml?.value ?? 0,
        rc: a.afterRms?.value ?? 0,
        rre: a.afterRme?.value ?? 0,
        dueDate: a.formattedDueDate ?? '',
        status: RiskStatusText[a.status] ?? ''
      } as RiskReport
    })
    console.log(exportRisks)
    exportCSVFile(riskColumns, exportRisks)
  } else {
    var exportActions = actions.value.map(
      (a) =>
        ({
          action: a.description,
          source: a.actionSource.name,
          assignee: getUserName(a.assignedUser),
          location: a.location.name ?? '',
          department: a.department.name ?? '',
          dueDate: formatDate(a.dueDate),
          forecastDate: formatDate(a.forecastDate),
          status: ActionStatusName[a.status]
        } as ActionReport)
    )
    console.log(exportActions)
    exportCSVFile(actionColumns, exportActions)
  }
}

const riskTypes = [
  {
    name: 'Risks overdue',
    query: {
      status: [RiskStatus.OPEN, RiskStatus.IN_PROGRESS],
      dueDateTo: moment().format('YYYY/MM/DD')
    }
  },
  {
    name: 'Risks in progress',
    query: {
      status: [RiskStatus.OPEN, RiskStatus.IN_PROGRESS]
    }
  },
  {
    name: 'Closed Risks',
    query: {
      status: [RiskStatus.CLOSED]
    }
  },
  {
    name: 'Open Risks',
    id: RiskStatus.OPEN,
    query: {
      status: [RiskStatus.OPEN]
    }
  }
]

const riskTypeItems = computed(() => {
  return riskTypes.map((item, index) => {
    return { id: index, name: item.name }
  })
})
const actionTypes = [
  {
    name: 'Closed Actions',
    query: {
      status: [ActionStatus.APPROVED]
    }
  },
  {
    name: 'Actions in progress',
    query: {
      status: [ActionStatus.IN_REVIEW, ActionStatus.REJECTED, ActionStatus.OPEN]
    }
  }
]
const actionsTypeItems = computed(() => {
  return actionTypes.map((item, index) => {
    return { id: index, name: item.name }
  })
})

const depItems = computed<FilterDropDownItem[]>(() => userDepartments.value.map((r) => ({ id: r.depId, name: r.name })))
const locItems = computed<FilterDropDownItem[]>(() => userLocations.value.map((r) => ({ id: r.locId, name: r.name })))

const applySearch = () => {
  if (!module.value.length) return
  hasSearch.value = true
  if (module.value[0] === 'risk') {
    reportStore.fetchRisks(getSearchQuery(riskFilterState.value))
  } else {
    reportStore.getActions(getSearchQuery(actionFilterState.value))
  }
}

const getSearchQuery = (value: FilterState) => {
  let query = { ...value } as QueryParams
  const { dateRange, types } = value
  delete query.dateRange
  delete query.types
  if (dateRange && dateRange.length)
    query = {
      ...query,
      createdAtFrom: moment(dateRange[0]).format('YYYY/MM/DD'),
      createdAtTo: moment(dateRange[1]).format('YYYY/MM/DD')
    }
  if (types.length) {
    if (module.value[0] === 'action') query = { ...query, ...(actionTypes[types[0] as number].query as QueryParams) }
    else query = { ...query, ...(riskTypes[types[0] as number].query as QueryParams) }
  }
  return query
}

onUnmounted(() => {
  reportStore.$reset()
})
</script>
<template>
  <div class="container-xl h-full px-4 sm:px-8 lg:px-16 xl:px-20 mx-auto pt-5 pb-6 flex flex-col">
    <PageHeader title="Report"> </PageHeader>
    <div class="flex-1 flex flex-col rounded-lg w-full bg-base-white overflow-hidden">
      <div class="flex space-x-2 z-10 px-6 py-6 items-center">
        <FilterDropDown v-model="module" :items="exportModules" title="Select Export Module" single />
        <template v-if="module.length && module[0] === 'risk'">
          <FilterDropDown
            v-model="riskFilterState.types"
            :items="riskTypeItems"
            clearable
            title="Select Risk type"
            single
          />
          <FilterDropDown
            v-model="riskFilterState.departments"
            :disabled="!module.length"
            clearable
            :items="depItems"
            title="Departments"
          />
          <FilterDropDown
            v-if="module.length"
            v-model="riskFilterState.locations"
            clearable
            :items="locItems"
            title="Locations"
          />

          <Datepicker
            v-if="module.length"
            v-model="riskFilterState.dateRange"
            :format="formatDate"
            style="min-width: 260px"
            preview-format="dd/MM/yyyy"
            placeholder="Select time frames"
            range
          />
        </template>
        <template v-if="module.length && module[0] === 'action'">
          <FilterDropDown
            v-model="actionFilterState.types"
            :items="actionsTypeItems"
            clearable
            title="Select action type"
            single
          />
          <FilterDropDown v-model="actionFilterState.departments" clearable :items="depItems" title="Departments" />
          <FilterDropDown v-model="actionFilterState.locations" clearable :items="locItems" title="Locations" />

          <Datepicker
            v-model="actionFilterState.dateRange"
            :format="formatDate"
            style="min-width: 260px"
            preview-format="dd/MM/yyyy"
            placeholder="Select time frames"
            range
          />
        </template>
        <AppButton v-if="module.length" icon="circle-plus" class="mr-2" type="dark" @click="applySearch">
          Create Report
        </AppButton>
      </div>
      <div class="overflow-y-auto flex-1 relative z-0">
        <ComponentLoading :loading="status === 'loading'" />
        <template v-if="module.length && module[0] === 'risk'">
          <table v-if="adjustedRisks.length" class="lh-table">
            <thead class="font-bold bg-gray-100">
              <tr>
                <th v-for="(col, index) in riskColumns" :key="index" scope="col">
                  {{ col }}
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
                <td class="text-center">
                  <AppStatus :status="risk.status" type="risk" />
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="hasSearch && !risks.length" class="text-center min-h-[120px] flex items-center justify-center">
            No risk found!
          </div>
        </template>

        <template v-if="module.length && module[0] === 'action'">
          <table v-if="actions.length" class="lh-table">
            <thead class="font-bold bg-gray-100">
              <tr>
                <th v-for="(col, index) in actionColumns" :key="index" scope="col">
                  {{ col }}
                </th>
                <th scope="col" class="px-2 py-6"></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="action in actions" :key="action.actId" class="bg-white border-b">
                <td class="min-w-[220px] max-w-[320px]">
                  {{ action.description }}
                </td>
                <td class="min-w-[180px]">{{ action.actionSource?.name ?? '-' }}</td>
                <td class="font-bold">
                  {{ getUserName(action.assignedUser) }}
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
                <td class="italic">{{ formatDate(action.dueDate) }}</td>
                <td class="italic">{{ formatDate(action.forecastDate) }}</td>
                <td class="text-center">
                  <AppStatus :status="action.status" type="action" />
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="hasSearch && !actions.length" class="text-center min-h-[120px] flex items-center justify-center">
            No actions found!
          </div>
        </template>
        <div v-if="!module.length" class="text-center min-h-[120px] flex items-center justify-center">
          Select module to export!
        </div>
      </div>
      <div v-if="module.length" class="py-6 px-6 space-x-4 text-right">
        <span class="text-gray-600 !ml-auto inline-block"
          >Total: {{ module[0] === 'action' ? actionTotal : riskTotal }}</span
        >

        <AppButton
          v-if="(module[0] === 'action' && actions.length) || (module[0] === 'risk' && risks.length)"
          icon="file-export"
          class="mr-2"
          type="primary"
          @click="exportCsv"
        >
          Export CSV
        </AppButton>
      </div>
    </div>
  </div>
</template>
