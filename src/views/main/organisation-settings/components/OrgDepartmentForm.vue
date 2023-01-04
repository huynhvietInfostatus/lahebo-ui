<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { helpers, required } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import { OrgDepartment } from '@/core/models/org-department.model'
import { useUserSetupStore } from '@/store/use-user-setup-store'
import { storeToRefs } from 'pinia'
import { useOrgDepartmentStore } from '@/store/use-org-department-store'
import LahInput from '@/core/components/LahInput.vue'
import VueSelect from 'vue-select'
import { REQUIRED_THREE_CHARACTERS } from '@/core/constants/app-constants'
import toastService from '@/core/helpers/toast-service'

interface OrgDepartmentForm {
  name: string
  manager: string | null
}

const props = defineProps<{ department?: OrgDepartment }>()
const emits = defineEmits(['close'])

const orgUserStore = useUserSetupStore()
const orgDepartmentStore = useOrgDepartmentStore()

const { userDropdownList } = storeToRefs(orgUserStore)

onMounted(() => {
  orgUserStore.getUserList(
    {
      rolIds: '786785e2-0c7d-48fb-8f6e-dff3b774bacc,bc905564-1873-44be-9c7b-cb288145e82b'
    },
    true
  )
})

const state = ref<OrgDepartmentForm>({
  name: props.department?.name ?? '',
  manager: props.department?.usrId ?? null
})

const rules = computed(() => ({
  name: {
    required,
    custom: helpers.withMessage('At least 3 alphabet characters', helpers.regex(REQUIRED_THREE_CHARACTERS))
  },
  manager: { required }
}))

const submit = () =>
  new Promise((resolve, reject) => {
    v$.value.$validate()
    if (!v$.value.$invalid) {
      if (props.department) {
        orgDepartmentStore
          .updateDepartment(props.department.depId, state.value)
          .then(() => {
            toastService.success('The department has been updated!')
            resolve(true)
          })
          .catch(() => reject(false))
      } else {
        orgDepartmentStore
          .addDepartment(state.value)
          .then(() => {
            toastService.success('The department has been added!')
            resolve(true)
          })
          .catch(() => reject(false))
      }
    } else {
      reject(false)
    }
  })

const v$ = useVuelidate(rules, state)
</script>

<template>
  <AppModal
    :title="props.department ? 'Edit Department' : 'Add Department'"
    :ok-text="props.department ? 'Save' : 'Add'"
    :on-ok="submit"
    width="460px"
    :ok-icon="props.department && 'save'"
    :can-dismiss="false"
    @close="(value: any) => emits('close', value)"
  >
    <template #body>
      <form>
        <div class="form-item" :class="{ 'has-error': v$.name.$errors.length }">
          <span class="form-label">Name</span>
          <lah-input v-model="state.name" placeholder="Name" @blur="v$.name.$touch" />
          <p v-if="v$.name.$errors.length" class="form-error-message">
            {{ v$.name.$errors[0].$message }}
          </p>
        </div>
        <div class="form-item flex-1" :class="{ 'has-error': v$.manager.$errors.length }">
          <span class="form-label">Manager</span>
          <vue-select
            v-model="state.manager"
            append-to-body
            :reduce="(user: any) => user.usrId"
            :options="userDropdownList"
            :clearable="false"
            :get-option-label="(usr: any) => [usr.firstName, usr.lastName].join(' ')"
            placeholder="Select Manager"
            @search:blur="v$.manager.$touch"
          />
          <p v-if="v$.manager.$errors.length" class="form-error-message">
            {{ v$.manager.$errors[0].$message }}
          </p>
        </div>
      </form>
    </template>
  </AppModal>
</template>
