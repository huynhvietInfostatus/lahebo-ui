<script lang="ts" setup>
import { computed, PropType } from 'vue'
import { ActionStatusColor, ActionStatusName } from '../models/action.model'
import { RiskStatus, RiskStatusColor, RiskStatusText } from '../models/risk.model'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

type StatusType = 'action' | 'risk'

const props = defineProps({
  status: { type: String as PropType<RiskStatus>, required: true },
  type: { type: String as PropType<StatusType>, required: true },
  canUpdate: { type: Boolean, defautl: false }
})

const emits = defineEmits(['onChange'])

const statusText = computed(() => {
  if (props.type === 'action') return ActionStatusName[props.status]
  else if (props.type === 'risk') return RiskStatusText[props.status]
  return ''
})
const statusColor = computed(() => {
  if (props.type === 'action') return ActionStatusColor[props.status]
  else if (props.type === 'risk') return RiskStatusColor[props.status]
  return ''
})

const statusList = {
  [RiskStatus.AWAITING_REVIEW]: 'Awaiting Review'
}
</script>
<template>
  <div
    v-if="!canUpdate"
    class="py-1 min-w-[60px] px-2 rounded text-sm text-center inline-block font-bold border"
    :style="{ color: statusColor, borderColor: statusColor }"
  >
    {{ statusText }}
  </div>
  <Menu v-else as="div" class="relative inline-block text-left">
    <div>
      <MenuButton
        :style="{ color: statusColor, borderColor: statusColor }"
        class="py-1 min-w-[60px] px-2 rounded text-sm text-center inline-block font-bold border"
      >
        {{ statusText }}
        <font-awesome-icon icon="angle-down" class="ml-2" />
      </MenuButton>
    </div>
    <MenuItems
      class="z-10 absolute bg-base-white overflow-hidden right-0 mt-2 w-[144px] py-2 origin-top-right rounded-md shadow-md focus:outline-none"
    >
      <MenuItem v-for="(item, key) in statusList" :key="key">
        <div class="py-3 px-6 w-full text-center cursor-pointer hover:bg-gray-100" @click="emits('onChange', key)">
          {{ item }}
        </div>
      </MenuItem>
    </MenuItems>
  </Menu>
</template>
