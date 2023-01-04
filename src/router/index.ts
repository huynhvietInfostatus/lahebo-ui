import { RoleEnum } from './../core/models/role.model'
import { AppPermission } from '@/core/models/permission.model'
import { useAuthStore } from '@/store/use-auth-store'
import { TokenService } from '@/core/helpers/token-service'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import AuthLayout from '@/core/layout/AuthLayout.vue'
import MainLayout from '@/core/layout/MainLayout.vue'
import PaymentLayout from '@/core/layout/PaymentLayout.vue'
import DefaultLayout from '@/core/layout/DefaultLayout.vue'
import OrganisationSettingsLayout from '@/core/layout/OrganisationSettingsLayout.vue'
import { RouteNames, RoutePaths } from '@/core/models/app-router.model'
import { useLoading } from 'vue-loading-overlay'
import { hasPermission, hasRole } from '@/core/helpers/common'

// Mains
const Dashboard = () => import('@/views/main/dashboard/Dashboard.vue')
const RiskManagement = () => import('@/views/main/risks/RiskManagement.vue')
const ActionManagement = () => import('@/views/main/actions/ActionManagement.vue')
const RiskSwot = () => import('@/views/main/risks/RiskSwot.vue')
const RiskUploader = () => import('@/views/main/risks/RiskUploader.vue')
const NotificationPage = () => import('@/views/main/NotificationPage.vue')
const UserProfile = () => import('@/views/main/UserProfile.vue')
const ReportExport = () => import('@/views/main/ReportExport.vue')

// Payment
const PricingPlan = () => import('@/views/payment/PricingPlan.vue')
const PaymentSuccess = () => import('@/views/payment/PaymentSuccess.vue')
const PaymentFailure = () => import('@/views/payment/PaymentFailure.vue')
const PaymentExpired = () => import('@/views/payment/PaymentExpired.vue')

// Auths
const SignIn = () => import('@/views/auth/SignIn.vue')
const SignUp = () => import('@/views/auth/SignUp.vue')
const MfaSignIn = () => import('@/views/auth/MfaSignIn.vue')
const MfaSetup = () => import('@/views/auth/MfaSetup.vue')
const ForgotPassword = () => import('@/views/auth/ForgotPassword.vue')
const ResetPassword = () => import('@/views/auth/ResetPassword.vue')
const NewUserResetPassword = () => import('@/views/auth/NewUserResetPassword.vue')
const VerifyOtp = () => import('@/views/auth/VerifyOtp.vue')

// Orgs
const OrganisationDetails = () => import('@/views/main/organisation-settings/OrganisationDetails.vue')
const UserSetup = () => import('@/views/main/organisation-settings/UserSetup.vue')
const RiskMatrix = () => import('@/views/main/organisation-settings/RiskMatrix.vue')
const EditRiskMatrix = () => import('@/views/main/organisation-settings/EditRiskMatrix.vue')
const Locations = () => import('@/views/main/organisation-settings/Locations.vue')
const Departments = () => import('@/views/main/organisation-settings/Departments.vue')
const PaymentDetails = () => import('@/views/main/organisation-settings/PaymentDetails.vue')
const LegislationLibrary = () => import('@/views/main/legislation/LegislationLibrary.vue')
const SubcscribedItems = () => import('@/views/main/legislation/SubscribedItems.vue')
const LegalRegister = () => import('@/views/main/legislation/LegalRegister.vue')

// errors
const UnauthorizedPage = () => import('@/views/errors/401Unauthorized.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: RoutePaths.INITIAL,
    redirect: { name: RouteNames.RISK_MANAGEMENT },
    beforeEnter: [checkAuth],
    component: DefaultLayout,
    children: [
      {
        path: RoutePaths.INITIAL,
        redirect: { name: RouteNames.RISK_MANAGEMENT },
        beforeEnter: [shouldHasPayment],
        component: MainLayout,
        children: [
          {
            path: RoutePaths.DASHBOARD,
            name: RouteNames.DASHBOARD,
            component: Dashboard,
            meta: { permissions: [AppPermission.REPORT_VIEW] }
          },
          {
            path: RoutePaths.ORGANISATION_SETTINGS,
            name: RouteNames.ORGANISATION_SETTINGS,
            redirect: { name: RouteNames.ORGANISATION_DETAILS },
            meta: {
              permissions: [AppPermission.ORGANISATION_ADMIN]
            },
            component: OrganisationSettingsLayout,
            children: [
              {
                path: RoutePaths.ORGANISATION_SETTINGS,
                name: RouteNames.ORGANISATION_SETTINGS,
                component: DefaultLayout,
                children: [
                  {
                    path: RoutePaths.ORGANISATION_DETAILS,
                    name: RouteNames.ORGANISATION_DETAILS,
                    component: OrganisationDetails
                  },
                  {
                    path: RoutePaths.USER_SETUP,
                    name: RouteNames.USER_SETUP,
                    component: UserSetup
                  },
                  {
                    path: RoutePaths.RISK_MATRIX,
                    name: RouteNames.RISK_MATRIX,
                    component: RiskMatrix
                  },
                  {
                    path: RoutePaths.LOCATIONS,
                    name: RouteNames.LOCATIONS,
                    component: Locations
                  },
                  {
                    path: RoutePaths.DEPARTMENTS,
                    name: RouteNames.DEPARTMENTS,
                    component: Departments
                  },
                  {
                    path: RoutePaths.PAYMENT_DETAILS,
                    name: RouteNames.PAYMENT_DETAILS,
                    component: PaymentDetails
                  },
                  {
                    path: RoutePaths.EDIT_RISK_MATRIX,
                    name: RouteNames.EDIT_RISK_MATRIX,
                    component: EditRiskMatrix
                  }
                ]
              }
            ]
          },
          {
            path: RoutePaths.LEGISLATION_LIBRARY,
            name: RouteNames.LEGISLATION_LIBRARY,
            redirect: { name: RouteNames.LEGISLATION_LIBRARY_HOME },
            component: DefaultLayout,
            children: [
              {
                path: RoutePaths.LEGISLATION_LIBRARY_HOME,
                name: RouteNames.LEGISLATION_LIBRARY_HOME,
                component: LegislationLibrary
              },
              {
                path: RoutePaths.SUBSCRIBED_ITEMS,
                name: RouteNames.SUBSCRIBED_ITEMS,
                component: SubcscribedItems
              },
              {
                path: RoutePaths.LEGAL_REGISTER,
                name: RouteNames.LEGAL_REGISTER,
                component: LegalRegister
              }
            ]
          },
          {
            path: RoutePaths.ACTION_MANAGEMENT,
            name: RouteNames.ACTION_MANAGEMENT,
            component: ActionManagement
          },
          {
            path: RoutePaths.RISK_MANAGEMENT,
            name: RouteNames.RISK_MANAGEMENT,
            component: RiskManagement
          },
          {
            path: RoutePaths.NOTIFICATION,
            name: RouteNames.NOTIFICATION,
            component: NotificationPage
          },
          {
            path: RoutePaths.USER_PROFILE,
            name: RouteNames.USER_PROFILE,
            component: UserProfile
          },
          {
            path: RoutePaths.SWOT,
            name: RouteNames.SWOT,
            component: RiskSwot
          },
          {
            path: RoutePaths.RISK_UPLOADER,
            name: RouteNames.RISK_UPLOADER,
            component: RiskUploader
          },
          {
            path: RoutePaths.EXPORT_REPORT,
            name: RouteNames.EXPORT_REPORT,
            component: ReportExport
          }
        ]
      },
      {
        path: RoutePaths.PAYMENT,
        redirect: { name: RouteNames.PRICING_PLAN },
        beforeEnter: [shouldNotPayment],
        component: PaymentLayout,
        children: [
          { path: RoutePaths.PRICING_PLAN, component: PricingPlan, name: RouteNames.PRICING_PLAN },
          {
            path: RoutePaths.PAYMENT_SUCCESS,
            component: PaymentSuccess,
            name: RouteNames.PAYMENT_SUCCESS
          },
          {
            path: RoutePaths.PAYMENT_FAILURE,
            component: PaymentFailure,
            name: RouteNames.PAYMENT_FAILURE
          },
          {
            path: RoutePaths.PAYMENT_EXPIRED,
            component: PaymentExpired,
            name: RouteNames.PAYMENT_EXPIRED
          }
        ]
      }
    ]
  },

  {
    path: RoutePaths.MFA_SETUP,
    meta: { requiredAuth: true },
    component: AuthLayout,
    children: [
      {
        path: '',
        name: RouteNames.MFA_SETUP,
        component: MfaSetup
      }
    ]
  },
  {
    path: RoutePaths.INITIAL,
    redirect: { name: RouteNames.SIGN_IN },
    meta: { requiredAuth: false },
    beforeEnter: [checkUnAuth],
    component: AuthLayout,
    children: [
      {
        path: RoutePaths.SIGN_IN,
        name: RouteNames.SIGN_IN,
        component: SignIn
      },
      {
        path: RoutePaths.SIGN_UP,
        name: RouteNames.SIGN_UP,
        component: SignUp
      },
      {
        path: RoutePaths.MFA_SIGN_IN,
        name: RouteNames.MFA_SIGN_IN,
        component: MfaSignIn
      },
      {
        path: RoutePaths.VERIFY_OTP,
        name: RouteNames.VERIFY_OTP,
        component: VerifyOtp
      },
      {
        path: RoutePaths.FORGOT_PASSWORD,
        name: RouteNames.FORGOT_PASSWORD,
        component: ForgotPassword
      },
      {
        path: RoutePaths.RESET_PASSWORD,
        name: RouteNames.RESET_PASSWORD,
        component: ResetPassword
      },
      {
        path: RoutePaths.NEW_USER_RESET_PASSWORD,
        name: RouteNames.NEW_USER_RESET_PASSWORD,
        component: NewUserResetPassword
      }
    ]
  },
  {
    path: RoutePaths.UNAUTHORIZED,
    name: RouteNames.UNAUTHORIZED,
    component: UnauthorizedPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

function checkUnAuth(to: any, from: any) {
  if (!TokenService.isTokenExprired()) {
    if (from && from.name) return false
    return { name: RouteNames.ORGANISATION_SETTINGS }
  }
  TokenService.logout()
  return true
}

function shouldHasPayment() {
  const authStore = useAuthStore()
  const status = authStore.paymentStatus
  if (status === 'active') {
    return true
  } else if (status === 'past_due') {
    return { name: RouteNames.PAYMENT_EXPIRED }
  } else return { name: RouteNames.PRICING_PLAN }
}
function shouldNotPayment() {
  const authStore = useAuthStore()
  if (!authStore.hasPayment) {
    return true
  }
  return { name: RouteNames.RISK_MANAGEMENT }
}

async function checkAuth() {
  const $loading = useLoading()
  const loader = $loading.show()

  const auth = TokenService.getAuth()
  const user = TokenService.getUser()
  if (!auth || !user) {
    TokenService.logout()
    loader.hide()
    return { name: RouteNames.SIGN_IN }
  }
  const isExpired = TokenService.isTokenExprired()
  const authStore = useAuthStore()
  if (isExpired) {
    try {
      await authStore.refreshToken()
      await authStore.getUserProfile()
      loader.hide()
      return true
    } catch (error) {
      TokenService.logout()
      loader.hide()
      return { name: RouteNames.SIGN_IN }
    }
  }
  await authStore.getUserProfile()
  loader.hide()
  return true
}

router.beforeResolve((to, from, next) => {
  const permissions: AppPermission[] = (to.meta.permissions ?? []) as unknown as AppPermission[]
  const roles: RoleEnum[] = (to.meta.roles ?? []) as unknown as RoleEnum[]
  if (!hasPermission(permissions) || !hasRole(roles)) next({ name: RouteNames.UNAUTHORIZED })
  else next()
})

export default router
