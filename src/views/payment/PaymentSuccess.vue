<script lang="ts" setup>
import { RouteNames } from '@/core/models/app-router.model'
import router from '@/router'
import { onUnmounted, ref } from 'vue'

const timeout = ref(10)
const timeoutFunc = setInterval(() => {
  if (timeout.value === 0) toHomePage()
  else timeout.value = timeout.value - 1
}, 1000)

const toHomePage = () => {
  router.push({ name: RouteNames.ORGANISATION_SETTINGS })
}
onUnmounted(() => {
  clearInterval(timeoutFunc)
})
</script>
<template>
  <div class="flex items-center justify-center h-screen flex-col">
    <div class="text-5xl font-bold mb-6">Congratulation!</div>
    <div class="mb-2 text-gray-600">Redirect to home page in ... {{ timeout }}</div>
    <span class="text-gray-600 mb-2">Or</span>
    <a class="hover:underline cursor-pointer text-gray-600" @click="toHomePage">Click here</a>
  </div>
</template>
