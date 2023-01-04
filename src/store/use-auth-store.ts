import { TokenService } from '@/core/helpers/token-service'
import { RouteNames } from '@/core/models/app-router.model'
import { SignInPayload, SignUpPayload } from '@/core/models/auth.model'
import { defineStore } from 'pinia'
import { fetchUserInfo, refreshToken, resendCode, signIn, signUp } from '@/core/services/auth.services'
import router from '@/router'
import ToastService from '@/core/helpers/toast-service'
import { Status } from '@/core/models/common.model'
import { OrgUser } from '@/core/models/user.model'
import { RoleEnum } from './../core/models/role.model'

interface AuthState {
  status: Status
  error: string
  user?: {
    auth: any
    me: OrgUser
  }
  credentials?: {
    username: string
    password: string
  }
}

export const useAuthStore = defineStore('authStore', {
  state: () =>
  ({
    status: 'idle',
    error: '',
    user: {
      auth: TokenService.getAuth(),
      me: TokenService.getUser()
    }
  } as AuthState),
  actions: {
    signUp(payload: SignUpPayload) {
      this.status = 'loading'
      signUp(payload)
        .then(() => {
          this.status = 'idle'
          ToastService.success('Register successfully!')
          router.push({
            name: RouteNames.VERIFY_OTP,
            query: { username: payload.username, email: payload.email }
          })
        })
        .catch((err) => {
          this.status = 'error'
          console.log(err)
        })
    },
    getUserProfile() {
      return fetchUserInfo().then((res) => {
        TokenService.setUser(res)
        if (this.user) this.user.me = res as unknown as OrgUser
      })
    },
    async signIn(payload: SignInPayload) {
      try {
        this.status = 'loading'
        const auth = (await signIn(payload)) as any
        if (auth['needToReset']) {
          ToastService.warn('Please reset your temporary password before using the application!')
          await router.push({ name: RouteNames.NEW_USER_RESET_PASSWORD, query: { username: payload.username } })
        } else if (auth['needTotpCode']) {
          this.credentials = payload
          await router.push({ name: RouteNames.MFA_SIGN_IN })
        } else {
          this.credentials = undefined

          TokenService.setAuth(auth)
          const me = (await fetchUserInfo()) as unknown as OrgUser

          TokenService.setUser(me)
          this.user = { auth, me }

          if (me.mfaRegistered) {
            await this.toFirstPage()
          } else {
            await router.push({ name: RouteNames.MFA_SETUP })
          }
        }
        this.status = 'idle'
      } catch (err: any) {
        if (err.response?.data?.message === 'User is not confirmed.') {
          await resendCode({ username: payload.username })
          await router.push({
            name: RouteNames.VERIFY_OTP,
            query: { username: payload.username }
          })
          this.status = 'idle'
        } else {
          this.status = 'error'
        }
      }
    },
    refreshToken() {
      return refreshToken()
        .then((res) => {
          this.user!.auth = res
          TokenService.setAuth(res)
          return res
        })
        .catch((e) => {
          throw e
        })
    },
    logout() {
      this.user = undefined
      TokenService.logout()
      router.push({ name: RouteNames.SIGN_IN })
    },
    toFirstPage() {
      const user = this.user?.me
      let routerName = ''
      if (user?.role.name === RoleEnum.SUPER_ADMIN && user?.isFirstLogin) {
        routerName = RouteNames.ORGANISATION_DETAILS
      } else {
        routerName = RouteNames.RISK_MANAGEMENT
      }
      return router.push({ name: routerName })
    }
  },
  getters: {
    orgId: (state) => state.user?.me?.orgId ?? '',
    userId: (state) => state.user?.me?.usrId ?? '',
    avatarName: (state) => {
      const me = state.user?.me
      if (me) {
        return `${me.firstName.charAt(0)}${me.lastName.charAt(0)}`
      }
      return ''
    },
    me: (state) => {
      return state.user?.me
    },
    email: (state) => {
      return state.user?.me?.email
    },
    auth: (state) => {
      return state.user?.auth
    },
    userRole: (state) => {
      const me = state.user?.me
      return me?.role
    },
    userPermissions: (state) => {
      const me = state.user?.me
      return me?.role.permissions ?? []
    },
    userLocations: (state) => {
      return state.user?.me?.locations || []
    },
    userDepartments: (state) => {
      return state.user?.me?.departments || []
    },
    hasPayment: (state) => {
      return state.user?.me?.organization.stripePaymentStatus === 'active'
    },
    paymentStatus: (state) => {
      return state.user?.me?.organization.stripePaymentStatus
    },
    currentPriceId: (state) => {
      return state.user?.me?.stripeLineItem?.price.id
    },
    customerId: (state) => {
      return state.user?.me?.organization.stripeCustomerId ?? ''
    }
  }
})
