<template>
  <div class="w-full flex-1 max-w-xl">
    <img class="mb-8 mx-auto" src="https://labeho-public.s3.ap-southeast-2.amazonaws.com/assets/logo.png" alt="Lahebo Logo" />
    <div class="bg-base-white shadow-md rounded-lg relative p-10 overflow-hidden">
      <div class="text-2xl text-primary-500 font-semi-bold uppercase mb-8 text-center">Create Account</div>
      <form @submit="submitForm">
        <!-- name -->
        <div class="flex">
          <div class="form-item flex-1 mr-4" :class="{ 'has-error': v$.firstName.$errors.length }">
            <span class="form-label">First Name</span>
            <lah-input v-model="state.firstName" placeholder="Enter your first name" @blur="v$.firstName.$touch" />
            <p v-if="v$.firstName.$errors.length" class="form-error-message multi-line">
              {{ v$.firstName.$errors[0].$message }}
            </p>
          </div>
          <div class="form-item flex-1" :class="{ 'has-error': v$.lastName.$errors.length }">
            <span class="form-label">Last Name</span>
            <lah-input v-model="state.lastName" placeholder="Enter your last name" @blur="v$.lastName.$touch" />
            <p v-if="v$.lastName.$errors.length" class="form-error-message multi-line">
              {{ v$.lastName.$errors[0].$message }}
            </p>
          </div>
        </div>
        <!-- end name -->
        <!-- or name -->
        <div class="form-item" :class="{ 'has-error': v$.organisationName.$errors.length }">
          <span class="form-label">Organisation Name</span>
          <lah-input
            v-model="state.organisationName"
            placeholder="Enter your organisation name"
            @blur="v$.organisationName.$touch"
          />
          <p v-if="v$.organisationName.$errors.length" class="form-error-message">
            {{ v$.organisationName.$errors[0].$message }}
          </p>
        </div>
        <!-- end or name -->
        <!-- email -->
        <div class="flex">
          <div class="form-item flex-1 mr-4" :class="{ 'has-error': v$.email.$errors.length }">
            <span class="form-label">Email</span>
            <lah-input
              v-model="state.email"
              placeholder="Enter your email"
              :allowed-special-chars="['.', '@', '+', '_', '-']"
              @blur="v$.email.$touch"
            />
            <p v-if="v$.email.$errors.length" class="form-error-message">
              {{ v$.email.$errors[0].$message }}
            </p>
          </div>
          <div class="form-item flex-1" :class="{ 'has-error': v$.username.$errors.length }">
            <span class="form-label">Username</span>
            <lah-input
              v-model="state.username"
              placeholder="Enter your username"
              :allowed-special-chars="[]"
              @blur="v$.username.$touch"
            />
            <p v-if="v$.username.$errors.length" class="form-error-message">
              {{ v$.username.$errors[0].$message }}
            </p>
          </div>
        </div>
        <!-- end mail -->
        <!-- phone -->
        <div class="form-item" :class="{ 'has-error': v$.phoneNumber.$errors.length }">
          <span class="form-label">Phone Number</span>
          <vue-tel-input
            :value="formattedNumber"
            :input-options="{ maxlength: 16, placeholder: 'Enter your phone number' }"
            @blur="v$.phoneNumber.$touch"
            @input="onInputPhoneNumber"
          />
          <p v-if="v$.phoneNumber.$errors.length" class="form-error-message">
            {{ v$.phoneNumber.$errors[0].$message }}
          </p>
        </div>
        <!-- end phone-->
        <!-- passsword -->
        <div class="flex mb-8">
          <div class="form-item flex-1 mr-4" :class="{ 'has-error': v$.password.$errors.length }">
            <span class="form-label">Password</span>
            <input
              v-model="state.password"
              type="password"
              class="form-input"
              placeholder="Enter your password"
              @blur="v$.password.$touch"
            />
            <p v-if="v$.password.$errors.length" class="form-error-message">
              {{ v$.password.$errors[0].$message }}
            </p>
          </div>
          <div class="form-item flex-1" :class="{ 'has-error': v$.confirmedPassword.$errors.length }">
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
        </div>
        <!-- end password -->
        <div class="text-center">
          <button
            type="submit"
            :disabled="status === 'loading'"
            class="text-base-white bg-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-primary-700 focus:ring-2 focus:ring-primary-300 font-medium rounded px-4 h-[42px] focus:outline-none dark:focus:ring-blue-800 mb-3"
            @click="submitForm()"
          >
            Sign Up
            <font-awesome-icon v-if="status === 'loading'" icon="spinner" class="fa-spin ml-2" />
            <font-awesome-icon v-else icon="arrow-right" class="ml-2" />
          </button>
        </div>
      </form>
      <div class="text-center font-light text-gray-500">
        Already had account?
        <router-link
          :to="{ name: RouteNames.SIGN_IN }"
          class="text-primary-500 hover:underline cursor-pointer font-normal"
          >Sign In
        </router-link>
      </div>

      <div class="absolute h-2 bg-primary-500 bottom-0 left-0 right-0"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, email, sameAs, helpers, minLength, maxLength } from '@vuelidate/validators'
import { RouteNames } from '@/core/models/app-router.model'
import { useAuthStore } from '@/store/use-auth-store'
import { SignUpPayload } from '@/core/models/auth.model'
import { storeToRefs } from 'pinia'
import { PASSWORD_REGEX, USERNAME_REGEX } from '@/core/constants/app-constants'
import LahInput from '@/core/components/LahInput.vue'
import { external } from '@/core/helpers/common'

interface SignUp {
  firstName: string
  lastName: string
  organisationName: string
  email: string
  username: string
  phoneNumber: string
  password: string
  confirmedPassword: string
}

const state = ref<SignUp>({
  firstName: '',
  lastName: '',
  organisationName: '',
  email: '',
  username: '',
  password: '',
  confirmedPassword: '',
  phoneNumber: ''
})

const isPhoneNumberValid = ref<boolean>(false)
const formattedNumber = ref<string>('')

const rules = computed(() => ({
  firstName: { required, minLengthValue: minLength(3) },
  lastName: { required, minLengthValue: minLength(3) },
  email: { required, email },
  username: {
    required,
    minLengthValue: minLength(8),
    maxLengthValue: maxLength(25),
    custom: helpers.withMessage('Invalid username format', helpers.regex(USERNAME_REGEX))
  },
  organisationName: { required, minLengthValue: minLength(3) },
  password: {
    required,
    minLengthValue: minLength(8),
    maxLengthValue: maxLength(25),
    custom: helpers.withMessage(
      'Require at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
      helpers.regex(PASSWORD_REGEX)
    )
  },
  phoneNumber: {
    required,
    custom: helpers.withMessage('Phone number is invalid', external(isPhoneNumberValid))
  },
  confirmedPassword: { required, sameAs: sameAs(state.value.password) }
}))

const authStore = useAuthStore()
const { status } = storeToRefs(authStore)

const onInputPhoneNumber = (phone: any, phoneObject: { formatted: string; valid: boolean; number: string }) => {
  if (phoneObject?.formatted) {
    formattedNumber.value = phoneObject.formatted
    state.value.phoneNumber = phoneObject.number
    isPhoneNumberValid.value = phoneObject.valid
  }
}

function submitForm(event?: Event) {
  event?.preventDefault()

  v$.value.$validate()
  if (!v$.value.$invalid) {
    const payload: SignUpPayload = {
      firstName: state.value.firstName,
      lastName: state.value.lastName,
      password: state.value.password,
      orgName: state.value.organisationName,
      phoneNumber: state.value.phoneNumber.toString(),
      username: state.value.username,
      email: state.value.email
    }
    authStore.signUp(payload)
  }
}

const v$ = useVuelidate(rules, state)

defineExpose({ isPhoneNumberValid })
</script>
