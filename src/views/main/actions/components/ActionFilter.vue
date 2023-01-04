<script lang="ts" setup>
import FilterDropDown from '@/core/components/FilterDropDown.vue'
import { FilterDropDownItem } from '@/core/models/common.model'
import { computed, onMounted, onUnmounted, reactive, watch } from 'vue'
import { useRiskLookups } from '@/core/helpers/risk-service'
import { useAuthStore } from '@/store/use-auth-store'
import { storeToRefs } from 'pinia'
import { useUserSetupStore } from '@/store/use-user-setup-store'
import { ActionStatusName } from '@/core/models/action.model'
import { QueryParams } from '@/core/models/query-param.model'
import { debounce } from '@/core/helpers/common'

const emits = defineEmits(['onChange'])
const props = defineProps<{ params: QueryParams }>()

const { actionSources, actionStatuses } = useRiskLookups()
const authStore = useAuthStore()

const { userDepartments, userLocations } = storeToRefs(authStore)
const userStore = useUserSetupStore()

const { assignees } = storeToRefs(userStore)

const sourceItems = computed<FilterDropDownItem[]>(() =>
  actionSources.value.map((r) => ({ id: r.ascId, name: r.name }))
)
const depItems = computed<FilterDropDownItem[]>(() => userDepartments.value.map((r) => ({ id: r.depId, name: r.name })))
const locItems = computed<FilterDropDownItem[]>(() => userLocations.value.map((r) => ({ id: r.locId, name: r.name })))
const statusItems = computed<FilterDropDownItem[]>(() =>
  actionStatuses.map((r) => ({ id: r, name: ActionStatusName[r] }))
)
const userItems = computed<FilterDropDownItem[]>(() =>
  assignees.value
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
)

const initStateValue = {
  keyword: props.params['keyword'] ?? '',
  assignedUsrIds: props.params['assignedUsrIds'] ?? [],
  sources: props.params['sources'] ?? [],
  departments: props.params['departments'] ?? [],
  locations: props.params['locations'] ?? [],
  status: props.params['status'] ?? []
}

const filterState = reactive<{ [key: string]: any }>({ ...initStateValue })

watch(
  filterState,
  () => {
    emits('onChange', filterState)
  },
  { immediate: true }
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
  filterState.assignedUsrIds = []
  filterState.sources = []
  filterState.departments = []
  filterState.locations = []
  filterState.status = []
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
})
onUnmounted(() => {
  userStore.userDropdownList = []
})
</script>
<template>
  <div class="flex space-x-2 items-center">
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
    <FilterDropDown v-model="filterState.assignedUsrIds" clearable :items="userItems" title="Assignees" />
    <FilterDropDown v-model="filterState.sources" clearable :items="sourceItems" title="Sources" />
    <FilterDropDown v-model="filterState.status" clearable :width="120" single :items="statusItems" title="Status" />
    <AppButton v-if="hasValue" icon="times" @click="clearFilter"> Clear</AppButton>
  </div>
</template>
