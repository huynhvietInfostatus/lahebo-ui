<script lang="ts" setup>
const props = defineProps({
  color: { type: String, default: '#dedede' },
  name: { type: String, required: true },
  value: { type: Number },
  maxValue: { type: Number, required: true }
})
</script>
<template>
  <div class="min-w-[80px]">
    <div class="flex items-center text-xs justify-between mb-1">
      <span class="font-semibold">{{ props.name }}</span>
      <span class="font-semibold">{{ props.value ?? '' }}</span>
    </div>
    <div class="w-full h-2 rounded overflow-hidden bg-gray-200">
      <div
        class="h-full"
        :style="{
          background: props.color,
          width: `${((props.value ?? 0) * 100) / props.maxValue}%`
        }"
      />
    </div>
  </div>
</template>
