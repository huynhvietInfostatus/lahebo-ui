<script lang="ts" setup>
const props = defineProps<{ loading: boolean }>()
</script>
<template>
  <slot />
  <div v-if="props.loading" class="absolute inset-0 w-full z-50 bg-base-white/60 flex items-center justify-center">
    <font-awesome-icon icon="spinner" class="fa-spin mr-2 fa-lg text-gray-600" />
  </div>
</template>
