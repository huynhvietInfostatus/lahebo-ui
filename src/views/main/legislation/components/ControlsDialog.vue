<script lang="ts" setup>
import { LegalRegister } from '@/core/models/legislation.model'
import { useLegalRegisterStore } from '@/store/use-legal-register-store'
import { ref } from 'vue'
import ControlsMangement from './ControlsMangement.vue'

const props = defineProps<{ legalItem: LegalRegister }>()
const controls = ref(props.legalItem.orgControls)
const emits = defineEmits(['close'])
const legRegisterStore = useLegalRegisterStore()
const submit = () =>
  new Promise((res, rej) => {
    if (controls.value.length) {
      legRegisterStore
        .updateRegisterItem(props.legalItem.legRegId, { orgControls: controls.value })
        .then(() => res(true))
        .catch(() => rej(false))
    } else {
      rej(false)
    }
  })
</script>
<template>
  <AppModal
    title="Controls"
    :on-ok="submit"
    ok-text="Save"
    ok-icon="save"
    @close="(value:any) => emits('close', value)"
  >
    <template #body>
      <ControlsMangement v-model="controls" />
      <p v-if="!controls.length" class="form-error-message mt-2">Please add at least 1 control</p>
    </template>
  </AppModal>
</template>
