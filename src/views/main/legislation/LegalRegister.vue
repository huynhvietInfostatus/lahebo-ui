<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import { PaginationInfo, SortableColumn, SortInfo } from '@/core/models/table.model'
import Pagination from '@/core/components/Pagination.vue'
import ComponentLoading from '@/core/components/ComponentLoading.vue'
import { LegalRegister } from '@/core/models/legislation.model'
import { useLegalRegisterStore } from '@/store/use-legal-register-store'
import RegisterLegalItemForm from './components/RegisterLegalItemForm.vue'
import ControlsDialog from './components/ControlsDialog.vue'
import AppToggle from '@/core/components/AppToggle.vue'
import LegislationLayout from '@/core/layout/LegislationLayout.vue'
import LegalRegisterView from './components/LegalRegisterView.vue'

const filteritem = ref({
  legActId: null,
  legDivId: null,
  name: ''
})

const legalStore = useLegalRegisterStore()
const { legalRegisterItems, count, status } = storeToRefs(legalStore)
const isConfirmModalShow = ref(false)
const isDetailDialogShow = ref(false)
const isControlsDialogShow = ref(false)
const isViewDetailShow = ref(false)
const selectedItem = ref<LegalRegister>()

const columns = ref<SortableColumn[]>([
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
  },
  {
    label: 'Reference Number',
    fullLabel: '',
    field: 'description',
    sortable: false
  },
  {
    label: 'ISO',
    fullLabel: '',
    field: 'iso',
    sortable: false
  },
  {
    label: 'Location',
    fullLabel: '',
    field: 'location',
    sortable: false
  },
  {
    label: 'Controls',
    fullLabel: '',
    field: 'controls',
    sortable: false
  },
  {
    label: 'Compliance',
    fullLabel: '',
    field: 'compliance',
    sortable: false
  },
  {
    label: 'State',
    fullLabel: '',
    field: 'state',
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
  doSearch()
})

const doSearch = () => {
  return legalStore.getLegalItems({
    take: currentPage.value.pageSize,
    skip: currentPage.value.pageSize * currentPage.value.current,
    sortBy: `${currentSort.value.col}-${currentSort.value.direction}`,
    ...filteritem.value
  })
}

// const onChangeKeyword = (event: any) => {
//   const target = event.target as HTMLInputElement
//   setKeyword(target.value)
// }

// const setKeyword = debounce((value: string) => {
//   if (value.length >= 3) {
//     filteritem.value.name = value.trim()
//     doSearch()
//   } else if (!value.trim()) {
//     filteritem.value.name = ''
//     doSearch()
//   }
// }, 400)

const openDetail = (item?: LegalRegister) => {
  isDetailDialogShow.value = true
  selectedItem.value = item
}
const viewDetail = (item: LegalRegister) => {
  selectedItem.value = item
  isViewDetailShow.value = true
}
const openViewControls = (item: LegalRegister) => {
  isControlsDialogShow.value = true
  selectedItem.value = item
}

const onCloseDialog = (value: any) => {
  if (value) doSearch()
  isControlsDialogShow.value = false
  isConfirmModalShow.value = false
  isViewDetailShow.value = false
  isDetailDialogShow.value = false
  selectedItem.value = undefined
}
const openConfirmDialog = (item: LegalRegister) => {
  isConfirmModalShow.value = true
  selectedItem.value = item
}
const deleteRegisterItem = () =>
  new Promise((res, rej) => {
    legalStore
      .deleteItem(selectedItem.value!.legRegId)
      .then(() => res(true))
      .catch(() => rej(false))
  })

const updateCompliance = (value: any, item: LegalRegister) => {
  legalStore.updateRegisterItem(item.legRegId, { compliance: value })
}
</script>
<template>
  <confirm-modal
    v-if="isConfirmModalShow"
    title="Confirmation"
    type="danger"
    :on-ok="deleteRegisterItem"
    @close="onCloseDialog"
  >
    <template #body>Do you want to delete this item?</template>
  </confirm-modal>
  <ControlsDialog v-if="isControlsDialogShow" :legal-item="selectedItem!" @close="onCloseDialog" />
  <RegisterLegalItemForm v-if="isDetailDialogShow" :item="selectedItem" @close="onCloseDialog" />
  <LegalRegisterView v-if="isViewDetailShow && selectedItem" :item="selectedItem" @close="onCloseDialog" />
  <LegislationLayout>
    <template #header>
      <PageHeader title="Legal Register">
        <AppButton icon="circle-plus" type="primary" @click="openDetail">Add</AppButton>
      </PageHeader>
    </template>
    <!-- <div class="flex items-start space-x-4 px-6 max-w-6xl pt-6 pb-6">
      <div class="relative">
        <input type="text" placeholder="Search" class="form-input pr-8" @input="onChangeKeyword($event)" />
        <font-awesome-icon class="absolute right-2 top-3.5 text-gray-500" icon="search" />
      </div>
    </div> -->
    <div class="overflow-y-auto flex-1 relative z-0">
      <ComponentLoading :loading="status === 'loading'" />
      <table v-if="legalRegisterItems.length" class="lh-table">
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
            <th scope="col">Action</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in legalRegisterItems"
            :key="item.legRegId"
            class="cursor-pointer hover:bg-gray-50"
            @click="viewDetail(item)"
          >
            <td class="max-w-[240px]">
              {{ item.orgLegislation?.legislation?.division?.name ?? '' }}
            </td>
            <td class="min-w-[220px] max-w-[300px]">
              {{ item.orgLegislation?.legislation?.description ?? '' }}
            </td>
            <td class="">
              {{ item.referenceNumber }}
            </td>
            <td class="min-w-[180px] max-w-[320px]">
              {{ item.iso.name }}
            </td>
            <td class="min-w-[120px]">
              {{ item.location.name }}
            </td>
            <td class="w-[100px]">
              <span class="cursor-pointer text-primary-500 hover:text-primary-700" @click.stop="openViewControls(item)"
                >View Controls</span
              >
            </td>
            <td class="w-[100px]">
              <AppToggle :value="item.compliance" @on-change="updateCompliance($event, item)" />
            </td>
            <td>
              {{ item.state }}
            </td>
            <td>
              <div class="divide-x divide-gray-300">
                <span class="text-primary-500 cursor-pointer hover:text-primary-700 pr-2" @click.stop="openDetail(item)"
                  >Edit</span
                >
                <span class="text-red-500 cursor-pointer hover:text-red-700 pl-2" @click.stop="openConfirmDialog(item)"
                  >Delete</span
                >
              </div>
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
