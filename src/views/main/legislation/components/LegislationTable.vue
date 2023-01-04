<script lang="ts" setup>
import { useLegislationLibrary } from '@/store/use-legislation-store'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { PaginationInfo, SortableColumn, SortInfo } from '@/core/models/table.model'
import Pagination from '@/core/components/Pagination.vue'
import { debounce, formatDate } from '@/core/helpers/common'
import ComponentLoading from '@/core/components/ComponentLoading.vue'
import { LegislationDes, LegislationSubItem } from '@/core/models/legislation.model'
import LegislationDetailDialog from './LegislationDetailDialog.vue'
import { computed } from 'vue'

interface FilterState {
  legActId: string | null
  legDivId: string | null
  name: string
}

const props = defineProps<{ subItem?: LegislationSubItem }>()
const emits = defineEmits(['onUpdateSuccess'])

const filterState = ref<FilterState>({
  legActId: null,
  legDivId: null,
  name: ''
})

const legStore = useLegislationLibrary()
const { acts, divisions, legisItems, legisItemCount, status } = storeToRefs(legStore)
const isConfirmModalShow = ref(false)
const isDetailDialogShow = ref(false)
const selectedItem = ref<LegislationDes>()

const columns = ref<SortableColumn[]>([
  {
    label: 'Act',
    fullLabel: '',
    field: 'act',
    sortable: false
  },
  {
    label: 'Effective Date',
    fullLabel: '',
    field: 'effectiveDate',
    sortable: false
  },
  {
    label: 'Division',
    fullLabel: '',
    field: 'division',
    sortable: false
  },
  {
    label: 'Description',
    fullLabel: '',
    field: 'description',
    sortable: false
  }
])
const defaultSort: SortInfo = {
  col: 'createdAt',
  direction: 'DESC'
}
const currentSort = ref<SortInfo>({ ...defaultSort })
const currentPage = ref<PaginationInfo>({
  current: 0,
  total: legisItemCount.value,
  pageSize: 10,
  sibling: 1
})
watch(legisItemCount, () => {
  currentPage.value.total = legisItemCount.value
})

const onSort = (event: SortInfo) => {
  if (!event.direction) {
    currentSort.value = { ...defaultSort }
  } else {
    currentSort.value = event
  }
  doSearch()
}

const onChangePage = (pageInfo: { [key: string]: number }) => {
  currentPage.value.current = pageInfo.page
  currentPage.value.pageSize = pageInfo.pageSize
  doSearch()
}

onMounted(() => {
  if (props.subItem) {
    filterState.value.name = props.subItem.legislation.name
    legStore.getActs({ name: props.subItem.legislation.act.name ?? '' }).then(() => {
      if (acts.value.length) {
        filterState.value.legActId = acts.value[0].legActId
        doSearch()
      }
    })
  } else {
    legStore.getActs()
  }
})

const fetchAct = debounce((search: string, loading: any) => {
  if (!search.length || search.length >= 3) {
    loading(true)
    legStore
      .getActs({ name: search })
      .then(() => {
        loading(false)
      })
      .catch(() => {
        loading(false)
      })
  }
}, 300)
const fetDivision = debounce((search: string, loading: any) => {
  if (!search.length || search.length >= 3) {
    loading(true)
    legStore
      .getDivisions({ name: search, legActId: filterState.value.legActId })
      .then(() => {
        loading(false)
      })
      .catch(() => {
        loading(false)
      })
  }
}, 300)

const doSearch = () => {
  return legStore.getLegisItems({
    take: currentPage.value.pageSize,
    skip: currentPage.value.pageSize * currentPage.value.current,
    sortBy: `${currentSort.value.col}-${currentSort.value.direction}`,
    ...filterState.value
  })
}

const onSubscribeItem = (item: LegislationDes) => {
  selectedItem.value = item
  isConfirmModalShow.value = true
}

const subscribeItem = () =>
  new Promise((resolve, reject) => {
    if (props.subItem) {
      legStore
        .updateSubscribeItem(props.subItem.orgLegId, selectedItem.value!.legId)
        .then(() => {
          emits('onUpdateSuccess')
          resolve(true)
        })
        .catch(() => {
          reject(false)
        })
    } else
      legStore
        .subscribeItem(selectedItem.value!.legId)
        .then(() => {
          resolve(true)
        })
        .catch(() => {
          reject(false)
        })
  })

watch(
  () => filterState.value.legActId,
  () => {
    if (filterState.value.legActId) {
      legStore.getDivisions({ legActId: filterState.value.legActId })
    }
  }
)

const onClose = (value: boolean) => {
  if (value) doSearch()
  isConfirmModalShow.value = false
  isDetailDialogShow.value = false
  selectedItem.value = undefined
}

const hasInputError = computed(() => {
  const { name } = filterState.value
  if (!name || !name.trim()) return false
  return name.trim().length < 3
})

const viewDetail = (item: LegislationDes) => {
  selectedItem.value = item
  isDetailDialogShow.value = true
}

const clearSearch = () => {
  filterState.value = {
    legActId: null,
    legDivId: null,
    name: ''
  }
  legStore.legisItems = []
  legStore.legisItemCount = 0
}

onUnmounted(() => {
  legStore.$reset()
})
</script>
<template>
  <ConfirmModal v-if="isConfirmModalShow" title="Confirmation" :on-ok="subscribeItem" @close="onClose">
    <template #body>Do you want to {{ (props.subItem && 'update') || 'subscribe' }} this item?</template>
  </ConfirmModal>
  <LegislationDetailDialog v-if="isDetailDialogShow" :item="selectedItem!" @close="onClose" />
  <div class="flex items-start space-x-4 px-6 max-w-6xl">
    <vue-select
      v-model="filterState.legActId"
      :options="acts"
      :reduce="(act: any) => act.legActId"
      label="name"
      placeholder="Select Legislation"
      class="flex-1"
      :filterable="false"
      @search="fetchAct"
    >
    </vue-select>
    <vue-select
      v-model="filterState.legDivId"
      :options="divisions"
      :disabled="!filterState.legActId"
      :reduce="(div: any) => div.legDivId"
      label="name"
      placeholder="Select Division"
      class="flex-1"
      :filterable="false"
      @search="fetDivision"
    >
    </vue-select>
    <div class="form-item" :class="{ 'has-error': hasInputError }">
      <input
        v-model="filterState.name"
        type="text"
        placeholder="Description"
        class="form-input pr-8 flex-1"
        :disabled="!filterState.legActId"
      />
      <p v-if="hasInputError" class="form-error-message">Please input at least 3 characters</p>
    </div>

    <div class="space-x-2 mt-[2px]">
      <AppButton :disabled="!filterState.legActId || hasInputError" type="dark" @click="() => doSearch()"
        >Search</AppButton
      >
      <AppButton
        :disabled="!filterState.legActId && !filterState.legDivId && !filterState.name"
        type="light"
        @click="() => clearSearch()"
        >Clear</AppButton
      >
    </div>
  </div>
  <div class="overflow-y-auto flex-1 relative z-0">
    <ComponentLoading :loading="status === 'loading'" />
    <table v-if="legisItems.length" class="lh-table">
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
          <th scope="col" class="px-2 py-6">Action</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="item in legisItems"
          :key="item.legId"
          class="bg-white border-b hover:bg-gray-100 cursor-pointer"
          @click="() => viewDetail(item)"
        >
          <td class="min-w-[220px] max-w-[300px]">
            {{ item.act.name }}
          </td>
          <td class="w-[100px] italic">
            {{ formatDate(item.act.effectiveDate) }}
          </td>
          <td class="min-w-[180px] max-w-[320px]">
            {{ item.division.name }}
          </td>
          <td class="min-w-[220px] max-w-[320px]">
            {{ item.description }}
          </td>
          <td>
            <button class="text-primary-500 hover:text-primary-700" @click.stop="() => onSubscribeItem(item)">
              {{ (props.subItem && 'Update') || 'Subscribe' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else class="text-center min-h-[120px] flex items-center justify-center">
      Please search for more legislation items
    </div>
  </div>
  <Pagination class="px-6 py-6" :page-info="currentPage" @on-page-change="onChangePage" />
</template>
