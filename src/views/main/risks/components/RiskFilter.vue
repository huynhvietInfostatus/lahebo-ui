<script lang="ts" setup>
import FilterDropDown from '@/core/components/FilterDropDown.vue'
import { FilterDropDownItem } from '@/core/models/common.model'
import { computed, onMounted, onUnmounted, reactive, watch } from 'vue'
import { useRiskLookups } from '@/core/helpers/risk-service'
import { useAuthStore } from '@/store/use-auth-store'
import { storeToRefs } from 'pinia'
import { RiskStatusText } from '@/core/models/risk.model'
import { useUserSetupStore } from '@/store/use-user-setup-store'
import { QueryParams } from '@/core/models/query-param.model'
import { debounce } from '@/core/helpers/common'
import { useRiskMatrixStore } from '@/store/use-risk-matrix.store'
import { OrgUser } from '@/core/models/user.model'

const emits = defineEmits(['onChange'])
const props = defineProps<{ params: QueryParams }>()

const { riskSources, riskStatuses } = useRiskLookups()
const authStore = useAuthStore()

const { userDepartments, userLocations } = storeToRefs(authStore)
const userStore = useUserSetupStore()
const riskMatrixStore = useRiskMatrixStore()

const { userDropdownList, owners } = storeToRefs(userStore)
const { exposureLevels } = storeToRefs(riskMatrixStore)

const filtedUser = (users: OrgUser[]) =>
  users
    .filter((u) => {
      return (
        u.departments.some((d) =>
          filterState.departments.length > 0
            ? filterState.departments.findIndex((id: string) => id === d.depId) > -1
            : userDepartments.value.findIndex((ud) => ud.depId === d.depId) > -1
        ) &&
        u.locations.some((l) =>
          filterState.locations.length > 0
            ? filterState.locations.findIndex((id: string) => id === l.locId) > -1
            : userLocations.value.findIndex((ud) => ud.locId === l.locId) > -1
        )
      )
    })
    .map((r) => ({
      id: r.usrId,
      name: r.usrId === authStore.userId ? 'Current User' : `${r.firstName} ${r.lastName}`
    }))
    .sort((a) => (a.id === authStore.userId ? -1 : 1))

const initStateValue = {
  keyword: props.params['keyword'] ?? '',
  owners: props.params['owners'] ?? [],
  createdByUsrIds: props.params['createdByUsrIds'] ?? [],
  sources: props.params['sources'] ?? [],
  departments: props.params['departments'] ?? [],
  locations: props.params['locations'] ?? [],
  status: props.params['status'] ?? [],
  ires: props.params['ires'] ?? [],
  rres: props.params['rres'] ?? []
}

const filterState = reactive<{ [key: string]: any }>({ ...initStateValue })

watch(
  filterState,
  () => {
    emits('onChange', filterState)
  },
  { immediate: true }
)

const sourceItems = computed<FilterDropDownItem[]>(() => riskSources.value.map((r) => ({ id: r.rscId, name: r.name })))
const depItems = computed<FilterDropDownItem[]>(() => userDepartments.value.map((r) => ({ id: r.depId, name: r.name })))
const locItems = computed<FilterDropDownItem[]>(() => userLocations.value.map((r) => ({ id: r.locId, name: r.name })))
const statusItems = computed<FilterDropDownItem[]>(() => riskStatuses.map((r) => ({ id: r, name: RiskStatusText[r] })))
const userItems = computed<FilterDropDownItem[]>(() => filtedUser(userDropdownList.value))
const ownerItems = computed<FilterDropDownItem[]>(() => filtedUser(owners.value))

const exposureLevelItems = computed<FilterDropDownItem[]>(() =>
  exposureLevels.value.map((r) => ({
    id: r.rmeId,
    name: r.name
  }))
)

const setKeyword = debounce((value: string) => {
  if (value.length >= 3) {
    filterState.keyword = value.trim()
  } else if (!value.trim()) {
    filterState.keyword = ''
  }
}, 300)

const onChangeKeyword = (event: any) => {
  const target = event.target as HTMLInputElement
  setKeyword(target.value)
}

const clearFilter = () => {
  filterState.keyword = ''
  filterState.sources = []
  filterState.createdByUsrIds = []
  filterState.owners = []
  filterState.departments = []
  filterState.locations = []
  filterState.status = []
  filterState.ires = []
  filterState.rres = []

  emits('onChange', filterState)
}

const hasValue = computed(() => {
  for (const key in filterState) {
    const val = filterState[key]
    if (val && val.length) return true
  }
  return false
})

const fetchUser = () => {
  userStore.getUserList({}, true)
}

onMounted(() => {
  fetchUser()
  riskMatrixStore.getRiskMatrixExposureLevels()
})
onUnmounted(() => {
  userStore.userDropdownList = []
})
</script>
<template>
  <div class="flex space-x-2 z-10">
    <div class="relative">
      <input
        type="text"
        placeholder="Search"
        class="form-input pr-8"
        :value="filterState.keyword"
        @input="onChangeKeyword($event)"
      />
      <font-awesome-icon class="absolute right-2 top-3.5 text-gray-500" icon="search" />
    </div>
    <FilterDropDown v-model="filterState.departments" clearable :items="depItems" title="Departments" />
    <FilterDropDown v-model="filterState.locations" clearable :items="locItems" title="Locations" />
    <FilterDropDown v-model="filterState.createdByUsrIds" clearable has-search :items="userItems" title="Created By" />
    <FilterDropDown v-model="filterState.owners" clearable has-search :items="ownerItems" title="Owners" />
    <FilterDropDown v-model="filterState.sources" clearable :items="sourceItems" title="Sources" />
    <FilterDropDown v-model="filterState.status" clearable single :width="180" :items="statusItems" title="Status" />
    <FilterDropDown v-model="filterState.ires" clearable :items="exposureLevelItems" title="IRE" />
    <FilterDropDown v-model="filterState.rres" clearable :items="exposureLevelItems" title="RRE" />
    <AppButton v-if="hasValue" icon="times" @click="clearFilter"> Clear</AppButton>
  </div>
</template>
