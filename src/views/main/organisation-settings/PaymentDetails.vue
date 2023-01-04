<script lang="ts" setup>
import { usePaymentStore } from '@/store/use-payment-store'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { formatDate } from '@/core/helpers/common'
import ComponentLoading from '@/core/components/ComponentLoading.vue'
import PaymentPlanDialogVue from './components/PaymentPlanDialog.vue'

const paymentStore = usePaymentStore()
const { invoices, status, subscription } = storeToRefs(paymentStore)
const isConfirmModalOpen = ref(false)
const isPlanDialogShow = ref(false)
const baseUrl = import.meta.env.VITE_BASE_URL

onMounted(() => {
  paymentStore.getInvoices()
  paymentStore.getSubscription()
})

const onClose = () => {
  isConfirmModalOpen.value = false
  isPlanDialogShow.value = false
}

const unsubcribe = () =>
  new Promise((res, rej) => {
    paymentStore
      .unsubscribe()
      .then(() => {
        res(true)
      })
      .catch(() => {
        rej(false)
      })
  })

const updatePaymentDetails = () => {
  paymentStore.checkoutWithSession({
    mode: 'setup',
    successUrl: `${baseUrl}/payment/payment-success`,
    cancelUrl: `${baseUrl}/payment/pricing-plans`
  })
}
</script>
<template>
  <PaymentPlanDialogVue v-if="isPlanDialogShow" @close="onClose" />
  <ConfirmModal
    v-if="isConfirmModalOpen"
    ok-icon=""
    ok-text="Unsubscribe"
    title="Confirmation"
    type="warning"
    :on-ok="unsubcribe"
    @close="onClose"
  >
    <template #body>Do you want to unsubcribe?</template>
  </ConfirmModal>
  <PageHeader title="Payment Details"> </PageHeader>

  <div class="bg-base-white relative p-10 divide-y divide-gray-100">
    <ComponentLoading :loading="status === 'loading'"></ComponentLoading>
    <div v-if="subscription" class="space-y-4 py-6 pt-0">
      <div class="uppercase font- text-gray-500">Current Subscription</div>
      <div class="space-y-4">
        <div class="flex">
          <span class="min-w-[140px]">Plan:</span>
          <span class="font-bold capitalize"
            >{{ subscription.plan.amount / 100 }} {{ subscription.plan.currency }} /
            {{ subscription.plan.interval }}</span
          >
        </div>
        <div class="flex">
          <span class="min-w-[140px]">Start - End:</span>
          <span class="font-bold capitalize"
            >{{ formatDate(new Date(subscription.current_period_start * 1000)) }} -
            {{ formatDate(new Date(subscription.current_period_end * 1000)) }}</span
          >
        </div>

        <div v-if="subscription.cancel_at != null" class="flex">
          <span class="min-w-[140px]">Cancel At</span>
          <span class="font-bold">
            {{ formatDate(new Date(subscription.cancel_at * 1000)) }}
          </span>
        </div>
        <div class="flex">
          <span class="min-w-[140px]">Status</span>
          <div
            class="py-1 min-w-[60px] px-2 capitalize rounded text-sm text-center inline-block font-bold border"
            :class="{ 'border-green-500 text-green-500': subscription.status === 'active' }"
          >
            {{ subscription.status }}
          </div>
        </div>
        <div v-if="subscription.cancel_at == null" class="space-x-2">
          <AppButton type="primary"  @click="updatePaymentDetails">Update Payment Details</AppButton>
          <AppButton type="light" @click="() => (isConfirmModalOpen = true)">Unsubscribe</AppButton>
          <!-- <AppButton type="light" @click="() => (isPlanDialogShow = true)">Change Subscription</AppButton> -->
        </div>
      </div>
    </div>
    <div v-if="invoices.length" class="space-y-4 py-6 pb-0">
      <div class="uppercase font- text-gray-500">Invoices</div>
      <div v-for="invoice in invoices" :key="invoice.id" class="space-y-4">
        <div class="italic">#{{ invoice.number }}</div>
        <div class="space-y-2 bg-gray-50 py-4 px-6 rounded">
          <div class="flex items-baseline">
            <span class="min-w-[140px]">Invoice pdf:</span>
            <a class="text-primary-500" :href="invoice.invoice_pdf">Download</a>
          </div>
          <div class="uppercase text-gray-500">Items:</div>
          <ul class="divide-y divide-gray-300 !mt-0">
            <li v-for="item in invoice.lines.data" :key="item.id" class="space-y-2 py-2">
              <div class="font-bold">{{ item.description }}</div>
              <div class="space-y-2">
                <div class="flex items-baseline">
                  <span class="min-w-[140px]">Start-End:</span>
                  <span class="font-bold"
                    >{{ formatDate(new Date(item.period.start * 1000)) }} -
                    {{ formatDate(new Date(item.period.end * 1000)) }}</span
                  >
                </div>
                <div class="flex items-baseline">
                  <span class="min-w-[140px]">Total:</span>
                  <span class="font-bold capitalize">{{ item.price.unit_amount / 100 }} {{ item.price.currency }}</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
