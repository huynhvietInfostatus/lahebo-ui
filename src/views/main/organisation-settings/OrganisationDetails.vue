<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-6">
      <div class="text-xl uppercase font-semibold text-primary-500">Organisation Detail</div>

      <template v-if="isEditing">
        <div class="w-72 flex items-center justify-end">
          <button
            type="button"
            class="text-gray-700 bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-gray-300 focus:ring-2 focus:ring-primary-300 font-medium rounded px-4 h-[36px] focus:outline-none dark:focus:ring-blue-800 mr-5"
            @click="cancelEdit"
          >
            <font-awesome-icon icon="xmark-circle" class="mr-2"></font-awesome-icon>
            Cancel
          </button>
          <button
            type="button"
            class="text-base-white bg-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-primary-700 focus:ring-2 focus:ring-primary-300 font-medium rounded px-4 h-[36px] focus:outline-none dark:focus:ring-blue-800"
            :disabled="status === 'loading'"
            @click="submitForm()"
          >
            <font-awesome-icon v-if="status === 'loading'" icon="spinner" class="fa-spin mr-2" />
            <font-awesome-icon v-else icon="floppy-disk" class="mr-2" />
            Save
          </button>
        </div>
      </template>
      <template v-else>
        <button
          type="button"
          class="text-base-white bg-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-gray-700 focus:ring-2 focus:ring-gray-300 font-medium rounded px-4 h-[36px] focus:outline-none dark:focus:ring-gray-800"
          @click="isEditing = true"
        >
          <font-awesome-icon icon="pen" class="mr-2"></font-awesome-icon>
          Edit
        </button>
      </template>
    </div>

    <div class="bg-base-white p-10">
      <div class="w-[48rem]">
        <form>
          <div class="flex">
            <div class="form-item flex-1 mr-4" :class="{ 'has-error': v$.name.$errors.length }">
              <span class="form-label">Name</span>
              <lah-input
                v-model="state.name"
                :disabled="!isEditing"
                placeholder="Enter the organisation name"
                @blur="v$.name.$touch"
              />
              <p v-if="v$.name.$errors.length" class="form-error-message">
                {{ v$.name.$errors[0].$message }}
              </p>
            </div>

            <div class="form-item flex-1" :class="{ 'has-error': v$.contactUserId.$errors.length }">
              <span class="form-label">Account Holder</span>
              <vue-select
                v-model="state.contactUserId"
                append-to-body
                :reduce="(user: any) => user.usrId"
                :options="listSuperAdmin"
                :clearable="false"
                :disabled="!isEditing"
                :get-option-label="(usr: any) => [usr.firstName, usr.lastName].join(' ')"
                placeholder="Select Account Holder"
                @search:blur="v$.contactUserId.$touch"
              />
              <p v-if="v$.contactUserId.$errors.length" class="form-error-message">
                {{ v$.contactUserId.$errors[0].$message }}
              </p>
            </div>
          </div>

          <div class="flex">
            <div class="form-item flex-1 mr-4" :class="{ 'has-error': v$.code.$errors.length }">
              <span class="form-label">Business Classification Code</span>
              <lah-input
                v-model="state.code"
                maxlength="5"
                :disabled="!isEditing"
                placeholder="Enter the Business Classification Code"
                @blur="v$.code.$touch"
              />
              <p v-if="v$.code.$errors.length" class="form-error-message">
                {{ v$.code.$errors[0].$message }}
              </p>
            </div>

            <div class="form-item flex-1">
              <span class="form-label">Business Size</span>
              <vue-select
                v-model="state.size"
                :options="orgSizes"
                :reduce="(orgSize: any) => orgSize.value"
                :disabled="!isEditing"
                label="text"
              />
            </div>
          </div>

          <div class="flex">
            <div class="form-item flex-1" :class="{ 'has-error': v$.timeZone.$errors.length }">
              <span class="form-label">Time Zone</span>
              <vue-select
                v-model="state.timeZone"
                :options="timeZones"
                placeholder="Select Time Zone"
                :disabled="!isEditing"
                :clearable="false"
                @search:blur="v$.timeZone.$touch"
              />
              <p v-if="v$.timeZone.$errors.length" class="form-error-message">
                {{ v$.timeZone.$errors[0].$message }}
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import useVuelidate from '@vuelidate/core'
import { helpers, minLength, required } from '@vuelidate/validators'
import { OrgInfoPayload, OrgSize, orgSizes } from '@/core/models/org.model'
import { useOrgStore } from '@/store/use-org-store'
import { useLookupStore } from '@/store/use-lookup-store'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/use-auth-store'
import VueSelect from 'vue-select'
import { ORG_CODE_REGEX } from '@/core/constants/app-constants'
import LahInput from '@/core/components/LahInput.vue'
import { useUserSetupStore } from '@/store/use-user-setup-store'

interface OrgForm {
  name: string
  code: string
  timeZone: string
  contactUserId: string | null
  size: OrgSize
}

const authStore = useAuthStore()
const orgStore = useOrgStore()
const orgUserStore = useUserSetupStore()
const lookupStore = useLookupStore()

const isEditing = ref<boolean>(false)
const state = ref<OrgForm>({
  name: '',
  code: '',
  timeZone: '',
  contactUserId: null,
  size: OrgSize.MICRO
})
const { timeZones } = storeToRefs(lookupStore)
const { status } = storeToRefs(orgStore)
const { listSuperAdmin } = storeToRefs(orgUserStore)

function onOrgInfoChanged(info?: OrgInfoPayload) {
  state.value.name = info?.name ?? ''
  state.value.code = info?.code ?? ''
  state.value.timeZone = info?.timeZone ?? ''
  state.value.size = info?.size ?? OrgSize.MICRO
  state.value.contactUserId = info?.contactUserId ?? null
}

onMounted(() => {
  orgUserStore.getUserList({}, true)
})
watch(() => orgStore.info, onOrgInfoChanged, { immediate: true })

if (!orgStore.info) {
  orgStore.fetch(authStore.user!.me!.orgId!)
}

if (!timeZones.value || timeZones.value.length === 0) {
  lookupStore.fetchTimeZones()
}

const rules = computed(() => ({
  name: { required, minLengthValue: minLength(3) },
  code: {
    custom: helpers.withMessage('Invalid Business Classification Code format', helpers.regex(ORG_CODE_REGEX))
  },
  timeZone: { required },
  contactUserId: { required }
}))

function cancelEdit() {
  isEditing.value = false
  onOrgInfoChanged(orgStore.info)
}

function submitForm() {
  v$.value.$validate()
  if (!v$.value.$invalid) {
    orgStore.updateInfo(authStore.user!.me!.orgId!, state.value).then(() => {
      if (status.value === 'idle') {
        isEditing.value = false
      }
    })
  }
}

const v$ = useVuelidate(rules, state)

onUnmounted(() => {
  orgUserStore.userDropdownList = []
})
</script>
