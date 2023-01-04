<script lang="ts" setup>
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Title' },
  okText: { type: String, default: 'Ok' },
  onOk: { type: Function },
  okIcon: { type: String },
  onCancel: { type: Function },
  cancelText: { type: String, default: 'Cancel' },
  canDismiss: { type: Boolean, default: true },
  width: { type: String, default: '672px' },
  hasFooter: { type: Boolean, default: true }
})

const emit = defineEmits(['close'])
const dismiss = () => {
  if (props.canDismiss) {
    emit('close', false)
  }
}
const isLoading = ref(false)

const onSubmit = () => {
  if (isLoading.value) return

  isLoading.value = true
  if (props.onOk)
    props.onOk().then(
      (val: any) => {
        isLoading.value = false
        emit('close', val)
      },
      () => (isLoading.value = false)
    )
}

const cancel = () => {
  if (props.onCancel) {
    props.onCancel()
  }
  isLoading.value = false
  emit('close', false)
}

defineExpose({ onSubmit })
</script>

<template>
  <div
    id="app-modal"
    class="fixed z-[999] top-0 left-0 w-full h-full bg-base-black/40 flex items-center justify-center"
    @click.self="dismiss"
  >
    <!-- Modal content -->
    <div class="flex flex-col rounded-lg bg-base-white" :style="{ width: props.width }">
      <slot>
        <!-- Modal header -->
        <div class="flex items-center justify-between px-8 py-5 border-b border-b-gray-200">
          <slot name="header">
            <div class="font-semibold text-xl text-gray-700 capitalize">{{ title }}</div>
            <button class="text-gray-500 hover:text-gray-800" @click="cancel">
              <font-awesome-icon icon="xmark"></font-awesome-icon>
            </button>
          </slot>
        </div>
        <!-- Modal body -->
        <div class="flex-1 px-8 py-6 overflow-y-auto">
          <slot name="body"></slot>
        </div>
        <!-- Modal footer -->
        <div v-if="props.hasFooter" class="flex items-center justify-center px-8 py-5 border-t border-t-gray-200">
          <slot name="footer">
            <AppButton type="light" icon="circle-xmark" class="mr-2" @click="cancel">{{ props.cancelText }}</AppButton>

            <AppButton
              v-if="props.onOk"
              :loading="isLoading"
              type="primary"
              :icon="okIcon ?? 'circle-check'"
              @click="onSubmit"
              >{{ props.okText ?? 'Ok' }}</AppButton
            >
          </slot>
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
#app-modal > div {
  max-height: calc(100vh - 64px);
}
</style>
