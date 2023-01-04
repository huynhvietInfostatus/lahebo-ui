<template>
  <div class="w-full flex-1 max-w-md">
    <img class="mb-8 mx-auto" src="https://labeho-public.s3.ap-southeast-2.amazonaws.com/assets/logo.png" alt="Lahebo Logo" />
    <div class="bg-base-white shadow-md rounded-lg relative p-10 overflow-hidden">
      <div class="text-2xl text-primary-500 font-semi-bold uppercase mb-8 text-center">Reset Password</div>
      <form @submit="submitForm">
        <div class="form-item" :class="{ 'has-error': v$.verificationCode.$errors.length }">
          <span class="form-label">Verification Code</span>
          <input
            v-model="state.verificationCode"
            v-maska="'######'"
            type="text"
            class="form-input"
            placeholder="Enter your code"
            maxlength="6"
            @blur="v$.verificationCode.$touch"
          />
          <p v-if="v$.verificationCode.$errors.length" class="form-error-message">
            {{ v$.verificationCode.$errors[0].$message }}
          </p>
        </div>
        <div class="form-item" :class="{ 'has-error': v$.newPassword.$errors.length }">
          <span class="form-label">New Password</span>
          <input
            v-model="state.newPassword"
            type="password"
            class="form-input"
            placeholder="Enter your new password"
            @blur="v$.newPassword.$touch"
          />
          <p v-if="v$.newPassword.$errors.length" class="form-error-message multi-line">
            {{ v$.newPassword.$errors[0].$message }}
          </p>
        </div>
        <div class="form-item" :class="{ 'has-error': v$.confirmedPassword.$errors.length }">
          <span class="form-label">Confirm Password</span>
          <input
            v-model="state.confirmedPassword"
            type="password"
            class="form-input"
            placeholder="Re-enter your password"
            @blur="v$.confirmedPassword.$touch"
          />
          <p v-if="v$.confirmedPassword.$errors.length" class="form-error-message">
            {{ v$.confirmedPassword.$errors[0].$message }}
          </p>
        </div>
        <div class="text-center">
          <button
            type="submit"
            :disabled="status === 'loading'"
            class="text-base-white bg-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-primary-700 focus:ring-2 focus:ring-primary-300 font-medium rounded px-4 h-[42px] focus:outline-none dark:focus:ring-blue-800 mb-3"
            @click="submitForm"
          >
            Reset
            <font-awesome-icon v-if="status === 'loading'" icon="spinner" class="fa-spin ml-2" />
            <font-awesome-icon v-else icon="arrow-right" class="ml-2" />
          </button>
        </div>
      </form>
      <div class="text-center text-sm text-gray-500">
        Back to
        <router-link :to="{ name: RouteNames.FORGOT_PASSWORD }" class="text-primary-500 hover:underline cursor-pointer">
          Forgot Password
        </router-link>
      </div>

      <div class="absolute h-2 bg-primary-500 bottom-0 left-0 right-0"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import useVuelidate from '@vuelidate/core'
import { helpers, maxLength, minLength, required, sameAs } from '@vuelidate/validators'
import { RouteNames } from '@/core/models/app-router.model'
import { useAuthStore } from '@/store/use-auth-store'
import { PASSWORD_REGEX } from '@/core/constants/app-constants'
import { Status } from '@/core/models/common.model'
import { resetPassword } from '@/core/services/auth.services'
import { useToast } from 'vue-toastification'
import { useRoute } from 'vue-router'

interface ResetPassword {
  username: string
  newPassword: string
  confirmedPassword: string
  verificationCode: string
}

const toast = useToast()
const route = useRoute()
const authStore = useAuthStore()
const status = ref<Status>('idle')

const state = ref<ResetPassword>({
  username: route.query.username?.toString() ?? '',
  newPassword: '',
  confirmedPassword: '',
  verificationCode: ''
})

const rules = computed(() => ({
  username: { required },
  newPassword: {
    required,
    minLengthValue: minLength(8),
    maxLengthValue: maxLength(25),
    custom: helpers.withMessage(
      'Require at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
      helpers.regex(PASSWORD_REGEX)
    )
  },
  confirmedPassword: { required, sameAs: sameAs(state.value.newPassword) },
  verificationCode: { required, minLengthValue: minLength(6) }
}))

const submitForm = async (event?: Event) => {
  event?.preventDefault()

  await v$.value.$validate()
  if (!v$.value.$invalid) {
    status.value = 'loading'
    try {
      await resetPassword({
        username: state.value.username,
        newPassword: state.value.newPassword,
        verificationCode: state.value.verificationCode
      })
      toast.success('Your password has been reset successfully')
      await authStore.signIn({
        username: state.value.username,
        password: state.value.newPassword
      })
      status.value = 'idle'
    } catch (e) {
      status.value = 'error'
    }
  }
}
const v$ = useVuelidate(rules, state)
</script>
