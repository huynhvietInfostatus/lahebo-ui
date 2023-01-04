<script lang="ts" setup>
import { USERNAME_REGEX } from '@/core/constants/app-constants'
import { OrgUser, UpdateUserPayload } from '@/core/models/user.model'
import { useUserSetupStore } from '@/store/use-user-setup-store'
import { email, helpers, maxLength, minLength, required } from '@vuelidate/validators'
import { computed, onMounted, ref } from 'vue'
import { external } from '@/core/helpers/common'
import useVuelidate from '@vuelidate/core'
import { useOrgLocationStore } from '@/store/use-org-location-store'
import { storeToRefs } from 'pinia'
import { useOrgDepartmentStore } from '@/store/use-org-department-store'
import { RoleNames } from '@/core/models/role.model'

interface FormState {
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  locIds: string[]
  depIds: string[]
  rolId: string | null
}

const props = defineProps<{ user: OrgUser | undefined }>()
const emits = defineEmits(['close'])
const isPhoneNumberValid = ref<boolean>(false)

const state = ref<FormState>({
  firstName: props.user?.firstName ?? '',
  lastName: props.user?.lastName ?? '',
  username: props.user?.username ?? '',
  email: props.user?.email ?? '',
  phoneNumber: props.user?.phoneNumber ?? '',
  locIds: props.user?.locations.map((l) => l.locId) ?? [],
  depIds: props.user?.departments.map((l) => l.depId) ?? [],
  rolId: props.user?.rolId ?? null
})
const rules = computed(() => ({
  firstName: { required },
  lastName: { required },
  email: { required, email },
  phoneNumber: {
    required,
    custom: helpers.withMessage('Phone number is invalid', external(isPhoneNumberValid))
  },
  username: {
    required,
    minLengthValue: minLength(8),
    maxLengthValue: maxLength(25),
    custom: helpers.withMessage('Invalid username format', helpers.regex(USERNAME_REGEX))
  },
  locIds: {
    required: state.value.depIds.length && required
  },
  rolId: { required },
  depIds: {
    required: state.value.locIds.length && required
  }
}))
const v$ = useVuelidate(rules, state)
defineExpose({ isPhoneNumberValid })
const formattedNumber = ref<string>(props.user?.phoneNumber ?? '')
const onInputPhoneNumber = (phone: any, phoneObject: { formatted: string; valid: boolean; number: string }) => {
  if (phoneObject?.formatted) {
    state.value.phoneNumber = phoneObject.number
    formattedNumber.value = phoneObject.formatted
    isPhoneNumberValid.value = phoneObject.valid
  }
}
const _userSetupStore = useUserSetupStore()
const locationsStore = useOrgLocationStore()
const departmentsStore = useOrgDepartmentStore()
const { locations } = storeToRefs(locationsStore)
const { departments } = storeToRefs(departmentsStore)
const { listRoles } = storeToRefs(_userSetupStore)
const submit = () =>
  new Promise((resolve, reject) => {
    v$.value.$validate()
    if (!v$.value.$invalid) {
      if (!props.user) {
        _userSetupStore
          .addUser(state.value)
          .then(() => {
            resolve(true)
          })
          .catch(() => {
            reject()
          })
      } else {
        const value = { ...state.value } as UpdateUserPayload
        delete value.username
        _userSetupStore
          .updateUser(value, props.user.usrId)
          .then(() => {
            resolve(true)
          })
          .catch(() => {
            reject()
          })
      }
    } else {
      reject()
    }
  })

onMounted(() => {
  locationsStore.getLocations()
  departmentsStore.getDepartments()
  _userSetupStore.getRoles()
})
</script>
<template>
  <AppModal
    :title="props.user ? 'Edit User' : 'Add User'"
    :ok-text="props.user ? 'Save' : 'Add'"
    :ok-icon="props.user && 'save'"
    :can-dismiss="false"
    :on-ok="submit"
    @close="(value:any) => emits('close', value)"
  >
    <template #body>
      <form>
        <div class="flex space-x-4">
          <div class="form-item flex-1" :class="{ 'has-error': v$.firstName.$errors.length }">
            <span class="form-label">First Name</span>
            <lah-input v-model="state.firstName" placeholder="First Name" @blur="v$.firstName.$touch" />
            <p v-if="v$.firstName.$errors.length" class="form-error-message">
              {{ v$.firstName.$errors[0].$message }}
            </p>
          </div>
          <div class="form-item flex-1" :class="{ 'has-error': v$.lastName.$errors.length }">
            <span class="form-label">Last Name</span>
            <lah-input v-model="state.lastName" placeholder="Last Name" @blur="v$.lastName.$touch" />
            <p v-if="v$.lastName.$errors.length" class="form-error-message">
              {{ v$.lastName.$errors[0].$message }}
            </p>
          </div>
        </div>
        <div class="flex space-x-4">
          <div class="form-item flex-1" :class="{ 'has-error': v$.email.$errors.length }">
            <span class="form-label">Email</span>
            <lah-input
              v-model="state.email"
              :allowed-special-chars="['@', '.', '+', '_', '-']"
              type="email"
              placeholder="Email"
              @blur="v$.email.$touch"
            />
            <p v-if="v$.email.$errors.length" class="form-error-message">
              {{ v$.email.$errors[0].$message }}
            </p>
          </div>
          <div class="form-item flex-1" :class="{ 'has-error': v$.username.$errors.length }">
            <span class="form-label">User Name</span>
            <lah-input
              v-model="state.username"
              :allowed-special-chars="[]"
              :disabled="!!props.user"
              placeholder="Username"
              @blur="v$.username.$touch"
            />
            <p v-if="v$.username.$errors.length" class="form-error-message">
              {{ v$.username.$errors[0].$message }}
            </p>
          </div>
        </div>
        <div class="flex space-x-4">
          <div class="form-item flex-1" :class="{ 'has-error': v$.rolId.$errors.length }">
            <span class="form-label">Role</span>
            <vue-select
              v-model="state.rolId"
              :options="listRoles"
              :reduce="(role: any) => role.rolId"
              label="name"
              append-to-body
              placeholder="Select Role"
              @search:blur="v$.rolId.$touch"
            >
              <template #selected-option="{ name }">
                {{ RoleNames[name] }}
              </template>
              <template #option="{ name }">
                {{ RoleNames[name] }}
              </template>
            </vue-select>
            <p v-if="v$.rolId.$errors.length" class="form-error-message">
              {{ v$.rolId.$errors[0].$message }}
            </p>
          </div>
          <div class="form-item flex-1" :class="{ 'has-error': v$.phoneNumber.$errors.length }">
            <span class="form-label">Phone Number</span>
            <vue-tel-input
              :value="formattedNumber"
              :input-options="{ maxlength: 16, placeholder: 'Enter phone number' }"
              @blur="v$.phoneNumber.$touch"
              @input="onInputPhoneNumber"
            />
            <p v-if="v$.phoneNumber.$errors.length" class="form-error-message">
              {{ v$.phoneNumber.$errors[0].$message }}
            </p>
          </div>
        </div>

        <div class="form-item" :class="{ 'has-error': v$.locIds.$errors.length }">
          <span class="form-label">Locations</span>
          <vue-select
            v-model="state.locIds"
            :options="locations"
            :reduce="(loc: any) => loc.locId"
            label="name"
            append-to-body
            multiple
            placeholder="Select Locations"
            @search:blur="v$.locIds.$touch"
          />
          <p v-if="v$.locIds.$errors.length" class="form-error-message">
            {{ v$.locIds.$errors[0].$message }}
          </p>
        </div>
        <div class="form-item" :class="{ 'has-error': v$.depIds.$errors.length }">
          <span class="form-label">Departments</span>
          <vue-select
            v-model="state.depIds"
            append-to-body
            :options="departments"
            :reduce="(dep: any) => dep.depId"
            label="name"
            multiple
            placeholder="Select Departments"
            @search:blur="v$.depIds.$touch"
          />
          <p v-if="v$.depIds.$errors.length" class="form-error-message">
            {{ v$.depIds.$errors[0].$message }}
          </p>
        </div>
      </form>
    </template>
  </AppModal>
</template>
