<script lang="ts" setup>
import { LegislationDes } from '@/core/models/legislation.model'
import { formatDate } from '@/core/helpers/common'
import { computed } from 'vue'

const props = defineProps<{ item: LegislationDes }>()
const emits = defineEmits(['close'])
const listDes = computed(() => {
  return props.item.description.split(/\n/g)
})
</script>
<template>
  <AppModal :has-footer="false" title="Legislation Detail" @close="(value:any) => emits('close', value)">
    <template #body>
      <div class="space-y-4">
        <div class="flex space-x-4">
          <span class="font-bold w-24 flex-shrink-0">Act</span>
          <div>{{ props.item.act.name }}</div>
        </div>
        <div class="flex space-x-4">
          <span class="font-bold w-24 flex-shrink-0">Effective Date</span>
          <div>{{ formatDate(props.item.act.effectiveDate) }}</div>
        </div>
        <div class="flex space-x-4">
          <span class="font-bold w-24 flex-shrink-0">Division</span>
          <div>{{ props.item.division.name }}</div>
        </div>
        <div class="flex space-x-4">
          <span class="font-bold w-24 flex-shrink-0">Description</span>
          <ul class="space-y-2">
            <li v-for="d in listDes" :key="d">{{ d }}</li>
          </ul>
        </div>
      </div>
    </template>
  </AppModal>
</template>
