<script lang="ts" setup>
import { PropType, ref, watch } from 'vue'
import { rotate, SortableColumn, SortDirection, SortInfo } from '../models/table.model'

const props = defineProps({
  col: {
    type: Object as PropType<SortableColumn>,
    required: true
  },
  sortCol: {
    type: Object as PropType<SortInfo>,
    required: true
  }
})

const emits = defineEmits(['onSort'])
const direction = ref<SortDirection>(props.sortCol.col === props.col.field ? props.sortCol.direction : '')

watch(
  props.sortCol,
  () => {
    if (props.sortCol.col !== props.col.field) {
      direction.value = ''
    } else if (direction.value !== props.sortCol.direction) {
      direction.value = props.sortCol.direction
    }
  },
  { immediate: true }
)

const onSort = () => {
  if (!props.col.sortable) return
  direction.value = rotate[direction.value]
  emits('onSort', { direction: direction.value, col: props.col.field })
}
</script>
<template>
  <div class="inline-flex items-center" :class="{ 'cursor-pointer': props.col.sortable }" @click="onSort">
    <span>{{ props.col.label }}</span>
    <div v-if="props.col.sortable" class="ml-2 flex-shrink-0">
      <img v-if="!direction" class="w-[8px] h-auto" src="@/assets/imgs/sort-default.svg" alt="" />
      <img
        v-else
        class="w-[8px] h-auto"
        src="@/assets/imgs/sort-up.svg"
        alt=""
        :class="{ 'rotate-180': direction === 'DESC' }"
      />
    </div>
  </div>
</template>
