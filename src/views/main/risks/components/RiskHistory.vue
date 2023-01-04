<script lang="ts" setup>
import { useHistoryStore } from '@/store/use-history-store'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted } from 'vue'
import ComponentLoading from '@/core/components/ComponentLoading.vue'
import { HistoryType, FieldHistoryName } from '@/core/models/history.model'
import { formatDateTime } from '@/core/helpers/common'
import UserAvatar from '@/core/components/UserAvatar.vue'
import RiskHistoryItem from './RiskHistoryItem.vue'

const historyStore = useHistoryStore()
const { status, histories } = storeToRefs(historyStore)
const emits = defineEmits(['close'])
const props = defineProps<{ riskId: string }>()

onMounted(() => {
  historyStore.getRiskHistories(props.riskId)
})

onUnmounted(() => {
  historyStore.$reset()
})
</script>
<template>
  <AppModal title="History" :has-footer="false" @close="(value:any) => emits('close', value)">
    <template #body>
      <div class="relative min-h-[120px] space-y-4">
        <ComponentLoading :loading="status === 'loading'"></ComponentLoading>
        <template v-if="histories.length">
          <div v-for="item in histories" :key="item.hstId">
            <div v-if="item.type === HistoryType.CREATE" class="flex items-center">
              <UserAvatar :user="item.user" class="mr-3"></UserAvatar>
              <div class="flex-1 flex">
                <div class="flex-1">
                  <b>{{ item.user.firstName }} {{ item.user.lastName }}</b> created <b>the Risk</b>
                </div>

                <span class="text-gray-600 text-sm ml-4 italic">{{ formatDateTime(item.createdAt) }}</span>
              </div>
            </div>
            <div v-else-if="item.type === HistoryType.UPDATE" class="flex w-full">
              <UserAvatar :user="item.user" class="mr-3"></UserAvatar>
              <div class="flex-1">
                <div class="mb-4 mt-2 flex">
                  <div class="flex-1">
                    <b>{{ item.user.firstName }} {{ item.user.lastName }}</b> updated
                    <b>{{ item.changes.length > 1 ? 'the Risk:' : FieldHistoryName[item.changes[0].fieldName] }}</b>
                  </div>

                  <span class="text-gray-600 text-sm ml-4 italic">{{ formatDateTime(item.createdAt) }}</span>
                </div>
                <div v-if="item.changes.length > 1" class="space-y-2">
                  <RiskHistoryItem v-for="change in item.changes" :key="change.fieldName" :change="change" />
                </div>
                <RiskHistoryItem v-else :has-label="false" :change="item.changes[0]" />
              </div>
            </div></div
        ></template>
        <div v-else class="flex items-center justify-center min-h-[120px]">No History</div>
      </div>
    </template>
  </AppModal>
</template>
