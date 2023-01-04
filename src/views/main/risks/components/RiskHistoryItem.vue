<script lang="ts" setup>
import { HistoryChange } from '@/core/models/history.model'

import { FieldHistoryName } from '@/core/models/history.model'
import { formatDate } from '@/core/helpers/common'
import { PropType } from 'vue'
const props = defineProps({
  change: {
    type: Object as PropType<HistoryChange>,
    required: true
  },
  hasLabel: {
    type: Boolean,
    default: true
  }
})

const toMitigationList = (value: string): string[] => {
  try {
    return JSON.parse(value)
  } catch (error) {
    return []
  }
}
</script>
<template>
  <div>
    <div v-if="props.hasLabel" class="text-gray-500 mb-2">{{ FieldHistoryName[props.change.fieldName] }}:</div>
    <div v-if="props.change.fieldName === 'dueDate'" class="flex space-x-4">
      <div class="flex-1">{{ (!!props.change.oldValue && formatDate(props.change.oldValue)) || 'N/A' }}</div>
      <font-awesome-icon icon="arrow-right" />

      <div class="flex-1">{{ (!!props.change.newValue && formatDate(props.change.newValue)) || 'N/A' }}</div>
    </div>
    <div v-else-if="props.change.fieldName === 'mitigations'" class="flex space-x-4">
      <ul
        v-if="toMitigationList(props.change.oldValue).length"
        class="flex-1 border-l-4 pl-3 border-gray-300 space-y-2"
      >
        <li v-for="(item, index) in toMitigationList(props.change.oldValue)" :key="index">- {{ item }}</li>
      </ul>
      <div v-else class="flex-1 italic">[Empty]</div>
      <font-awesome-icon icon="arrow-right" />

      <ul
        v-if="toMitigationList(props.change.newValue).length"
        class="flex-1 border-l-4 pl-3 border-gray-300 space-y-2"
      >
        <li v-for="(item, index) in toMitigationList(props.change.newValue)" :key="index">- {{ item }}</li>
      </ul>
      <div v-else class="flex-1 italic">[Empty]</div>
    </div>
    <div v-else class="flex space-x-4">
      <div class="flex-1">{{ props.change.oldValue ?? 'N/A' }}</div>
      <font-awesome-icon icon="arrow-right" />

      <div class="flex-1">{{ props.change.newValue ?? 'N/A' }}</div>
    </div>
  </div>
</template>
