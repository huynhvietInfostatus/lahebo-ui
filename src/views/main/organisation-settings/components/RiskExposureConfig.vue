<script lang="ts" setup>
import { useRiskMatrixStore } from '@/store/use-risk-matrix.store'
import useVuelidate from '@vuelidate/core'
import { minLength } from '@vuelidate/validators'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import RiskExposureConfigItem from '@/views/main/organisation-settings/components/RiskExposureConfigItem.vue'
import { RiskMatrixExposureLevelPayload } from '@/core/models/risk-matrix.model'

const riskStore = useRiskMatrixStore()
const { status, exposureLevels } = storeToRefs(riskStore)

const emits = defineEmits(['close'])
const state = ref({
  collection: [] as RiskMatrixExposureLevelPayload[]
})
const isConfirmModalShow = ref(false)
let selectedId: number | null = null

const rules = computed(() => ({
  collection: { minLength: minLength(1) }
}))

watch(exposureLevels, (els) => {
  state.value.collection = []
  els.forEach((v) => {
    state.value.collection.push({
      fromValue: v.fromValue,
      toValue: v.toValue,
      color: v.color,
      name: v.name
    })
  })
})

const addItem = () => {
  let maxValue = 0
  if (exposureLevels.value.length > 0) {
    maxValue = Math.max(...exposureLevels.value.map((it) => it.toValue))
  }

  state.value.collection.push({
    fromValue: maxValue + 1,
    toValue: maxValue + 2,
    color: '#F0F0F0',
    name: ''
  })
}

onMounted(() => {
  riskStore.getRiskMatrixExposureLevels()
})

const onSubmit = () =>
  new Promise((res, rej) => {
    v$.value.$validate()
    if (!v$.value.$invalid) {
      riskStore
        .postRiskMatrixExposureLevels(state.value.collection)
        .then(() => {
          res(null)
        })
        .catch(() => rej())
    } else {
      rej()
    }
  })

const handleDeleteItem = () =>
  new Promise((res, rej) => {
    try {
      if (selectedId !== null && selectedId > -1) {
        state.value.collection.splice(selectedId, 1)
        selectedId = null
        res(null)
      }
    } catch (error) {
      rej(error)
    }
  })

const deleteItem = (index: number) => {
  isConfirmModalShow.value = true
  selectedId = index
}

const onUpdate = (item: RiskMatrixExposureLevelPayload, index: number) => {
  state.value.collection[index] = item
}

const v$ = useVuelidate(rules, state)
</script>
<template>
  <ConfirmModal
    v-if="isConfirmModalShow"
    title="Confirmation"
    :on-ok="handleDeleteItem"
    type="danger"
    @close="isConfirmModalShow = false"
  >
    <template #body> Do you want to delete this item?</template>
  </ConfirmModal>
  <app-modal
    title="Risk Exposure Config"
    ok-text="Save"
    :on-ok="onSubmit"
    :can-dismiss="false"
    @close="emits('close', $event)"
  >
    <template #body>
      <div v-if="status === 'loading'" class="flex items-center justify-center h-24">
        <font-awesome-icon icon="spinner" class="fa-spin mr-2 fa-lg text-gray-600" />
      </div>

      <template v-else>
        <table class="w-full">
          <thead>
            <tr class="text-left text-primary-500 leading-10">
              <th>From</th>
              <th>To</th>
              <th>Name</th>
              <th>Color</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <risk-exposure-config-item
              v-for="(item, index) in state.collection"
              :key="index"
              :model-value="state.collection[index]"
              :disable-delete="state.collection.length === 1"
              @on-update="onUpdate($event, index)"
              @delete-item="deleteItem(index)"
            />
          </tbody>
        </table>
        <button
          class="w-full h-[36px] rounded border-gray-300 border mt-2 hover:bg-gray-300 transition-all duration-200"
          @click="addItem"
        >
          <font-awesome-icon icon="plus-circle" class="mr-2" />
          Add
        </button>
      </template>
    </template>
  </app-modal>
</template>
