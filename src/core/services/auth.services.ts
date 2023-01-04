import { TokenService } from './../helpers/token-service'
import {
  ForgotPasswordPayload,
  ResendCodePayload,
  ResetPasswordPayload,
  SignInPayload,
  SignUpPayload,
  VerifyCodePayload
} from '@/core/models/auth.model'
import { apiUrl } from './../configs/api-config'
import axios from 'axios'

function signUp(payload: SignUpPayload) {
  return axios.post(`${apiUrl}/auth/register`, payload)
}

function signIn(payload: SignInPayload) {
  if (payload.totpCode != null) {
    return axios.post(`${apiUrl}/auth/login/require-totp-code`, payload)
  } else if (payload.newPassword != null) {
    return axios.post(`${apiUrl}/auth/login/require-new-password`, payload)
  } else {
    return axios.post(`${apiUrl}/auth/login`, payload)
  }
}

function forgotPassword(payload: ForgotPasswordPayload) {
  return axios.post(`${apiUrl}/auth/forgot-password`, payload)
}

function resetPassword(payload: ResetPasswordPayload) {
  return axios.post(`${apiUrl}/auth/confirm-password`, payload)
}

function fetchUserInfo() {
  return axios.get(`${apiUrl}/auth/me`)
}

function verifyCode(payload: VerifyCodePayload) {
  return axios.post(`${apiUrl}/auth/verify-code`, payload)
}

function resendCode(payload: ResendCodePayload) {
  return axios.post(`${apiUrl}/auth/resend-code`, payload)
}

function refreshToken() {
  const auth = TokenService.getAuth()
  const user = TokenService.getUser()
  if (auth && user)
    return axios.post(`${apiUrl}/auth/refresh-token`, {
      refreshToken: auth.refreshToken?.token,
      username: user.username
    })
  return Promise.reject(null)
}

function associateSoftwareToken(refreshToken: string) {
  return axios.post(`${apiUrl}/auth/associate-software-token`, { refreshToken })
}

function verifySoftwareToken(refreshToken: string, totpCode: string, friendlyDeviceName: string) {
  return axios.post(`${apiUrl}/auth/verify-software-token`, {
    refreshToken,
    totpCode,
    friendlyDeviceName
  })
}

export {
  signUp,
  signIn,
  fetchUserInfo,
  verifyCode,
  resendCode,
  refreshToken,
  forgotPassword,
  resetPassword,
  associateSoftwareToken,
  verifySoftwareToken
}
