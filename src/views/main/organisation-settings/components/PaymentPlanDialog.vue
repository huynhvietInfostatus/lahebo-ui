<script lang="ts" setup>
import { usePaymentStore } from '@/store/use-payment-store'
import { ref } from 'vue'
import PricesComponent from '@/views/components/PricesComponent.vue'

const emits = defineEmits(['close'])
const isShowConfirmModal = ref(false)
const nextPay = ref()
let selectedId: string | undefined

const paymentStore = usePaymentStore()
const onSelectPlan = (id: string) => {
  selectedId = id
  paymentStore.addUpcomingInvoice(id).then((res: any) => {
    if (res) {
      nextPay.value = res
      if (res.total > 0) {
        isShowConfirmModal.value = true
      } else {
        doPayment()
      }
    }
  })
}

const doPayment = () =>
  new Promise((res, rej) => {
    if (selectedId)
      paymentStore
        .updateSubscription(selectedId)
        .then(() => {
          emits('close', false)
          res(true)
        })
        .catch(() => rej(null))
    else {
      rej(null)
    }
  })

const onClose = () => {
  isShowConfirmModal.value = false
  selectedId = undefined
}
</script>

<template>
  <confirm-modal
    v-if="isShowConfirmModal"
    class="z-[1000]"
    title="Confirmation"
    :on-ok="doPayment"
    ok-text="Checkout"
    @close="onClose"
  >
    <template #body>
      <div class="leading-relaxed">
        You have to pay <b class="capitalize">{{ nextPay.amount_due / 100 }} {{ nextPay.currency }}</b> for this plan!
        Do you want to continue?
      </div>
    </template>
  </confirm-modal>
  <div
    id="app-modal"
    class="fixed z-[999] top-0 left-0 w-full h-full bg-base-black/40 flex items-center justify-center"
    @click.self="emits('close', false)"
  >
    <!-- Modal content -->
    <div class="flex flex-col rounded-lg bg-base-white relative" style="width: 1200px">
      <button class="text-gray-500 hover:text-gray-800 absolute right-6 top-4" @click="emits('close', false)">
        <font-awesome-icon icon="xmark"></font-awesome-icon>
      </button>
      <div class="flex-1 px-8 py-6 overflow-y-auto">
        <PricesComponent @on-select="onSelectPlan" />
      </div>
    </div>
  </div>
</template>
<style scoped>
#app-modal > div {
  max-height: calc(100vh - 64px);
}
</style>
