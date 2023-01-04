<script lang="ts" setup>
import { OrgUser } from '../models/user.model'
import { computed, PropType } from 'vue'

const props = defineProps({
  user: {
    type: Object as PropType<OrgUser>,
    required: true
  },
  width: {
    type: Number,
    default: 36
  }
})

const getName = computed(() => {
  return (props.user && `${props.user.firstName.charAt(0)}${props.user.lastName.charAt(0)}`) || ''
})
</script>

<template>
  <div
    :style="{ width: props.width + 'px', height: props.width + 'px' }"
    class="text-base-white flex-shrink-0 uppercase flex items-center justify-center font-semibold tracking-widest bg-primary-500 rounded-full"
  >
    {{ getName }}
  </div>
</template>
