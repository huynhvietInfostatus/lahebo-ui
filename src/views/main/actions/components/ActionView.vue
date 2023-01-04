<script lang="ts" setup>
import { Action } from '@/core/models/action.model'
import { formatDate } from '@/core/helpers/common'
import AttachmentUpload from './AttachmentUpload.vue'
import { useActionStore } from '@/store/use-action-store'
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{ action: Action }>()

const emits = defineEmits(['close'])

const actionStore = useActionStore()

onMounted(() => {
  actionStore.attachments = props.action.attachments
})
onUnmounted(() => {
  actionStore.attachments = []
})
</script>
<template>
  <AppModal :has-footer="false" title="Action Detail" @close="(value:any) => emits('close', value)">
    <template #body>
      <div>
        <div class="form-item">
          <span class="form-label">Description</span>
          <textarea
            readonly
            class="form-input"
            :value="props.action.description"
            placeholder="Enter the description"
            rows="4"
          />
        </div>
        <div class="flex space-x-4">
          <div class="form-item flex-1">
            <span class="form-label">Source</span>
            <input readonly class="form-input" label="name" :value="props.action.actionSource.name" />
          </div>

          <div class="form-item flex-1">
            <span class="form-label">Risk</span>
            <input readonly class="form-input" label="description" :value="props.action.risk?.description ?? ''" />
          </div>
        </div>

        <div class="flex space-x-4">
          <div class="form-item flex-1">
            <span class="form-label">Department</span>
            <input class="form-input" readonly :value="props.action.department?.name ?? ''" />
          </div>

          <div class="form-item flex-1">
            <span class="form-label">Location</span>
            <input readonly class="form-input" :value="props.action.location?.name ?? ''" />
          </div>
        </div>
        <div class="flex space-x-4">
          <div class="form-item flex-1">
            <span class="form-label">Assignee</span>
            <input
              readonly
              class="form-input"
              :value="props.action.assignedUser?.firstName ?? '-' + ' ' + props.action.assignedUser?.lastName ?? '-'"
            />
          </div>
          <div class="form-item flex-1">
            <span class="form-label">ISO Standard</span>
            <input readonly class="form-input" :value="props.action.isoStandard?.name ?? ''" />
          </div>
        </div>
        <div class="flex space-x-4">
          <div class="form-item flex-1">
            <span class="form-label">Forecast Date</span>
            <input readonly class="form-input" :value="formatDate(props.action.forecastDate)" />
          </div>

          <div class="form-item flex-1">
            <span class="form-label">Due Date</span>
            <input readonly class="form-input" :value="formatDate(props.action.dueDate)" />
          </div>
        </div>
        <div class="form-item">
          <span class="form-label">Attachments</span>
          <AttachmentUpload :disabled="true"></AttachmentUpload>
        </div>
        <div class="form-item">
          <span class="form-label">Remarks</span>
          <textarea readonly :value="props.action.remarks" class="form-input" />
        </div>
      </div>
    </template>
  </AppModal>
</template>
