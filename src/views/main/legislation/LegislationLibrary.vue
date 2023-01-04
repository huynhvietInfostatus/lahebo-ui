<script lang="ts" setup>
import LegislationLayout from '@/core/layout/LegislationLayout.vue'
import LegislationTable from './components/LegislationTable.vue'
</script>
<template>
  <LegislationLayout>
    <template #header>
      <PageHeader title="Legislation Library"> </PageHeader>
    </template>
    <LegislationTable />
  </LegislationLayout>
</template>
