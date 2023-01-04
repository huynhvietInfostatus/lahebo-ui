<script lang="ts" setup>
import { usePaymentStore } from '@/store/use-payment-store'
import PricesComponent from '../components/PricesComponent.vue'
const paymentStore = usePaymentStore()

const baseUrl = import.meta.env.VITE_BASE_URL
const payment = (id: string) => {
  paymentStore.checkoutWithSession({
    successUrl: `${baseUrl}/payment/payment-success`,
    cancelUrl: `${baseUrl}/payment/pricing-plans`,
    priceId: id,
    quantity: 1,
    mode: 'subscription',
    allowPromotionCodes: true
  })
}
</script>
<template>
  <div class="h-screen relative overflow-auto">
    <div class="flex h-full items-center justify-center container px-4 sm:px-8 lg:px-16 xl:px-20 mx-auto pt-5 pb-6">
      <PricesComponent @on-select="payment" />
    </div>
  </div>
</template>
