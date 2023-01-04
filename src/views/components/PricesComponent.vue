<script lang="ts" setup>
import { usePaymentStore } from '@/store/use-payment-store'
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'
import ComponentLoading from '@/core/components/ComponentLoading.vue'
import { Product } from '@/core/models/product.model'
const paymentStore = usePaymentStore()
const { prices, priceStatus, subscription, products } = storeToRefs(paymentStore)
const emits = defineEmits(['onSelect'])
onMounted(() => {
  if (!prices.value.length) paymentStore.getPrices()
  if (!products.value.length) paymentStore.getProducts()
})
const listProducts = computed(() => {
  let result: Product[] = []
  products.value.forEach((p) => {
    var price = prices.value.find((pr) => pr.id === p.default_price)
    if (price)
      result.push({
        id: p.id,
        priceId: price.id,
        name: p.name,
        des: p.description,
        currency: price?.currency ?? 'N/A',
        unitAmount: price?.unit_amount ?? 'N/A',
        interval: price?.recurring?.interval ?? ''
      } as Product)
  })
  return result
})

const payment = (id: string) => {
  emits('onSelect', id)
}
</script>
<template>
  <ComponentLoading :loading="priceStatus === 'loading'"></ComponentLoading>
  <div v-if="prices.length" class="flex-1 max-w-screen-lg mx-auto">
    <div class="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
      <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900">Choose your subscription plan</h2>
    </div>
    <div class="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      <!-- Pricing Card -->
      <template v-for="item in listProducts" :key="item.id">
        <div
          v-if="item.id !== subscription?.plan?.id"
          class="w-full flex flex-col p-6 mx-auto text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow xl:p-8"
        >
          <h3 class="mb-4 text-2xl font-semibold capitalize text-primary-500">{{ item.name || 'N/A' }}</h3>
          <div class="flex justify-center items-baseline mb-4">
            <span class="mr-2 text-2xl font-extrabold">{{ item.unitAmount / 100 }} A$</span>
            <span class="text-gray-500 dark:text-gray-400">/ {{ item.interval }}</span>
          </div>
          <!-- List -->
          <div class="flex-1 mb-4 text-left text-gray-600">{{ item.des }}</div>
          <AppButton type="primary" @click="() => payment(item.priceId)">Get started</AppButton>
        </div>
      </template>

      <!-- Pricing Card -->
    </div>
  </div>
</template>
