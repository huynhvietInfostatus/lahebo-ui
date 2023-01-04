<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { required } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'

import { Risk, RiskMitigationPayload, RiskMitigationUpdatePayload } from '@/core/models/risk.model'
import AppModal from '@/core/components/AppModal.vue'
import ConfirmModal from '@/core/components/ConfirmModal.vue'
import RiskMitigationForm from '@/views/main/risks/RiskMitigationForm.vue'
import { useRiskStore } from '@/store/use-risk-store'
import { useToast } from 'vue-toastification'
import { useUserSetupStore } from '@/store/use-user-setup-store'
import { storeToRefs } from 'pinia'

const props = defineProps<{ risk?: Risk }>()
const emits = defineEmits(['close'])

const toast = useToast()
const riskStore = useRiskStore()
const userStore = useUserSetupStore()
const { assignees } = storeToRefs(userStore)

const appModal = ref<InstanceType<typeof AppModal>>()
const showMitigationModal = ref(false)
const isConfirmModalShow = ref(false)
const mitigationIndex = ref<number>(-1)

if (!props.risk) {
  emits('close', false)
}

onMounted(() => {
  if (props.risk) userStore.getUserList({ locId: props.risk.locId, depId: props.risk.depId }, true)
})

onUnmounted(() => {
  userStore.userDropdownList = []
})
const state = ref<RiskMitigationUpdatePayload>({
  mitigations: props.risk?.mitigations ?? []
})

const rules = computed(() => ({
  mitigations: { required }
}))

const onUpdateMitigation = (_mitigationIndex: number) => {
  mitigationIndex.value = _mitigationIndex
  showMitigationModal.value = true
}

const onShowDeleteConfirmation = (_mitigationIndex: number) => {
  mitigationIndex.value = _mitigationIndex
  isConfirmModalShow.value = true
}

const onDeletedMitigation = () =>
  new Promise((resolve) => {
    state.value.mitigations.splice(mitigationIndex.value, 1)
    resolve(true)
  })

const onSubmitMitigationModal = (result: RiskMitigationPayload) => {
  if (mitigationIndex.value === -1) {
    state.value.mitigations.push(result)
  } else {
    state.value.mitigations[mitigationIndex.value] = result
  }
}

const submit = () =>
  new Promise((resolve, reject) => {
    v$.value.$validate()
    if (!v$.value.$invalid) {
      riskStore.updateMitigation(props.risk!.rskId, state.value.mitigations).then(
        () => {
          toast.success('Update mitigation strategy successfully')
          resolve(true)
        },
        (err) => {
          console.log(err)
          reject(false)
        }
      )
    } else {
      reject(false)
    }
  })

const onFormSubmit = (event?: Event) => {
  event?.preventDefault()
  appModal.value?.onSubmit()
}

const v$ = useVuelidate(rules, state)
</script>

<template>
  <app-modal
    ref="appModal"
    title="Mitigation Strategy"
    ok-text="Save"
    cancel-text="Close"
    :on-ok="submit"
    :can-dismiss="false"
    @close="(value) => emits('close', value)"
  >
    <template #body>
      <form @submit="onFormSubmit">
        <div class="font-semi-bold text-gray-400 text-lg mb-2 flex">
          <div class="flex-grow uppercase">MITIGATION</div>
          <div class="flex items-center justify-end text-primary-500 cursor-pointer" @click="onUpdateMitigation(-1)">
            <font-awesome-icon icon="circle-plus" class="mr-2" />
            <span class="text-base">Add</span>
          </div>
        </div>

        <table v-if="state.mitigations.length > 0" class="w-full text-left mb-4">
          <thead class="font-bold bg-gray-100">
            <tr>
              <th scope="col" class="px-4 py-3 text-center w-24">Is Action</th>
              <th scope="col" class="px-4 py-3">Content</th>
              <th scope="col" class="px-4 py-3">
                <span class="sr-only">Status</span>
              </th>
              <th scope="col" class="px-4 py-3 w-20">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(mitigation, index) in state.mitigations"
              :key="index"
              class="bg-white"
              :class="{ 'border-t': index > 0 }"
            >
              <td class="px-4 py-3 text-center">
                <font-awesome-icon
                  v-if="mitigation.isActionItem"
                  icon="circle-check"
                  class="text-primary-500 text-lg"
                />
              </td>
              <td class="px-4 py-3">
                {{ mitigation.content }}
              </td>
              <td class="text-center">
                <AppStatus
                  v-if="mitigation.isActionItem"
                  :status="mitigation.action?.status"
                  type="action"
                />
              </td>
              <td class="px-4 py-3 text-gray-500 text-right">
                <template v-if="!props.risk || !mitigation.actId">
                  <font-awesome-icon
                    icon="trash"
                    class="mr-2 cursor-pointer"
                    @click="onShowDeleteConfirmation(index)"
                  />
                  <font-awesome-icon icon="pen" class="cursor-pointer" @click="onUpdateMitigation(index)" />
                </template>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="v$.mitigations.$errors.length" class="form-error-message">
          {{ v$.mitigations.$errors[0].$message }}
        </p>
      </form>
    </template>
  </app-modal>
  <risk-mitigation-form
    v-if="showMitigationModal"
    :assignees="assignees"
    :mitigation="mitigationIndex >= 0 ? state.mitigations[mitigationIndex] : undefined"
    @submit="onSubmitMitigationModal"
    @close="showMitigationModal = false"
  />
  <confirm-modal
    v-if="isConfirmModalShow"
    title="Confirmation"
    :on-ok="onDeletedMitigation"
    @close="isConfirmModalShow = false"
  >
    <template #body>Do you want to delete this mitigation strategy?</template>
  </confirm-modal>
</template>
