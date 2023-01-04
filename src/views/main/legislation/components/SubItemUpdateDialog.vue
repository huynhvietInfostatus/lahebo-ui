<script lang="ts" setup>
import { LegislationSubItem } from '@/core/models/legislation.model'
import LegislationTable from './LegislationTable.vue'

const emits = defineEmits(['close'])
const props = defineProps<{
  item: LegislationSubItem
}>()
</script>
<template>
  <AppModal
    width="1000px"
    title="Update Subscribed Item"
    :has-footer="false"
    ok-text="Save"
    ok-icon="save"
    @close="(value:any) => emits('close', value)"
  >
    <LegislationTable :sub-item="props.item" @on-update-success="() => emits('close', true)" />
  </AppModal>
</template>
