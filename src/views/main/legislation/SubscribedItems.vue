<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import { PaginationInfo, SortableColumn, SortInfo } from '@/core/models/table.model'
import Pagination from '@/core/components/Pagination.vue'
import { formatDate } from '@/core/helpers/common'
import ComponentLoading from '@/core/components/ComponentLoading.vue'
import { LegislationSubItem } from '@/core/models/legislation.model'
import LegislationDetailDialog from './components/LegislationDetailDialog.vue'
import { useSubscribedItemsStore } from '@/store/use-subscribe-items-store'
import LegislationLayout from '@/core/layout/LegislationLayout.vue'
import SubItemUpdateDialog from './components/SubItemUpdateDialog.vue'

const filterState = ref({
  legActId: null,
  legDivId: null,
  name: ''
})

const subItemStore = useSubscribedItemsStore()
const { legisItems, count, status } = storeToRefs(subItemStore)
const isConfirmModalShow = ref(false)
const isDetailDialogShow = ref(false)
const isUpdateDialogShow = ref(false)
const selectedItem = ref<LegislationSubItem>()

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
  total: count.value,
  pageSize: 10,
  sibling: 1
})
watch(count, () => {
  currentPage.value.total = count.value
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
  subItemStore.getSubItems()
})

const doSearch = () => {
  return subItemStore.getSubItems({
    take: currentPage.value.pageSize,
    skip: currentPage.value.pageSize * currentPage.value.current,
    sortBy: `${currentSort.value.col}-${currentSort.value.direction}`,
    ...filterState.value
  })
}

const onSubscribeItem = (item: LegislationSubItem) => {
  selectedItem.value = item
  isConfirmModalShow.value = true
}

const onClose = (value: boolean) => {
  if (value) doSearch()
  isConfirmModalShow.value = false
  isDetailDialogShow.value = false
  isUpdateDialogShow.value = false
  selectedItem.value = undefined
}

const viewDetail = (item: LegislationSubItem) => {
  selectedItem.value = item
  isDetailDialogShow.value = true
}
const onOpenUpdateModel = (item: LegislationSubItem) => {
  selectedItem.value = item
  isUpdateDialogShow.value = true
}

const unSubscribeItem = () =>
  new Promise((resolve, reject) => {
    subItemStore
      .unSubscribeItem(selectedItem.value!.orgLegId)
      .then(() => {
        resolve(true)
      })
      .catch(() => {
        reject(false)
      })
  })

// const onChangeKeyword = (event: any) => {
//   const target = event.target as HTMLInputElement
//   setKeyword(target.value)
// }

// const setKeyword = debounce((value: string) => {
//   if (value.length >= 3) {
//     filterState.value.name = value.trim()
//     doSearch()
//   } else if (!value.trim()) {
//     filterState.value.name = ''
//     doSearch()
//   }
// }, 400)
</script>
<template>
  <ConfirmModal v-if="isConfirmModalShow" title="Confirmation" type="warning" :on-ok="unSubscribeItem" @close="onClose">
    <template #body>Do you want to unsubscribe this item?</template>
  </ConfirmModal>
  <LegislationDetailDialog v-if="isDetailDialogShow" :item="selectedItem!.legislation" @close="onClose" />
  <SubItemUpdateDialog v-if="isUpdateDialogShow" :item="selectedItem!" @close="onClose" />
  <LegislationLayout>
    <template #header>
      <PageHeader title="Subscribed Items"> </PageHeader>
    </template>
    <!-- <div class="flex items-start space-x-4 px-6 max-w-6xl pt-6 pb-6">
      <div class="relative">
        <input type="text" placeholder="Search" class="form-input pr-8" @input="onChangeKeyword($event)" />
        <font-awesome-icon class="absolute right-2 top-3.5 text-gray-500" icon="search" />
      </div>
    </div> -->
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
            <th scope="col" class="px-2 py-6">Subscription</th>
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
              {{ item.legislation.act.name }}
            </td>
            <td class="w-[100px] italic">
              {{ formatDate(item.legislation.act.effectiveDate) }}
            </td>
            <td class="min-w-[180px] max-w-[320px]">
              {{ item.legislation.division.name }}
            </td>
            <td class="min-w-[220px] max-w-[320px]">
              {{ item.legislation.description }}
            </td>
            <td>
              <button class="text-red-500 hover:text-red-700" @click.stop="() => onSubscribeItem(item)">
                Unsubscribe
              </button>
              <span v-if="!item.legislation.act.isLatest" class="w-[1px] h-[10px] mx-2 bg-gray-400 inline-block"></span>
              <button
                v-if="!item.legislation.act.isLatest"
                class="text-primary-500 hover:text-primary-700"
                @click.stop="() => onOpenUpdateModel(item)"
              >
                Update
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
  </LegislationLayout>
</template>
