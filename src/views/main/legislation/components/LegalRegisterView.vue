<script lang="ts" setup>
import { LegalRegister } from '@/core/models/legislation.model'
import { Switch } from '@headlessui/vue'
import { computed } from 'vue'

const props = defineProps<{ item: LegalRegister }>()
const emits = defineEmits(['close'])
const listDes = computed(() => {
  return props.item.orgLegislation.legislation.description.split(/\n/g)
})
</script>

<template>
  <AppModal
    width="800px"
    :has-footer="false"
    title="Legal Register Details"
    @close="(value:any) => emits('close', value)"
  >
    <template #body>
      <div class="space-y-4">
        <div class="flex space-x-4">
          <span class="font-bold w-32 flex-shrink-0">Act</span>
          <div>{{ props.item.orgLegislation.legislation.act.name }}</div>
        </div>
        <div class="flex space-x-4">
          <span class="font-bold w-32 flex-shrink-0">Division</span>
          <div>{{ props.item.orgLegislation.legislation.division.name }}</div>
        </div>
        <div class="flex space-x-4">
          <span class="font-bold w-32 flex-shrink-0">Description</span>
          <ul class="space-y-2">
            <li v-for="d in listDes" :key="d">{{ d }}</li>
          </ul>
        </div>
        <div class="flex space-x-4">
          <span class="font-bold w-32 flex-shrink-0">Reference Number</span>
          <div>{{ props.item.referenceNumber }}</div>
        </div>
        <div class="flex space-x-4">
          <span class="font-bold w-32 flex-shrink-0">ISO</span>
          <div>{{ props.item.iso.name }}</div>
        </div>
        <div class="flex space-x-4">
          <span class="font-bold w-32 flex-shrink-0">Location</span>
          <div>{{ props.item.location.name }}</div>
        </div>
        <div class="space-y-4">
          <span class="font-bold w-32 flex-shrink-0">Control</span>
          <ul class="space-y-4">
            <li v-for="c in item.orgControls" :key="c" class="rounded-md bg-gray-100 px-4 py-2">
              {{ c }}
            </li>
          </ul>
        </div>
        <div class="flex space-x-4 items-center">
          <span class="font-bold w-32 flex-shrink-0">Compliance</span>
          <Switch
            :class="!item.compliance ? 'bg-gray-300' : 'bg-primary-500'"
            class="relative inline-flex h-6 w-11 items-center rounded-full cursor-default"
          >
            <span class="sr-only"></span>
            <span
              :class="item.compliance ? 'translate-x-6' : 'translate-x-1'"
              class="inline-block h-4 w-4 transform rounded-full bg-base-white"
            />
          </Switch>
        </div>
        <div class="flex space-x-4">
          <span class="font-bold w-32 flex-shrink-0">State</span>
          <div>{{ props.item.state }}</div>
        </div>
      </div>
    </template>
  </AppModal>
</template>
