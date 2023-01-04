import axios, { AxiosRequestConfig } from 'axios'
import { useToast } from 'vue-toastification'
import { TokenService } from '@/core/helpers/token-service'
import { useAuthStore } from '@/store/use-auth-store'

const axiosApiInstance = axios.create()
const baseUrl = import.meta.env.VITE_API_URL

axios.interceptors.response.use(
  function (response) {
    return response.data
  },
  async function (error) {
    const toast = useToast()
    const message = error?.response?.data?.message ?? error.message
    const _authStore = useAuthStore()
    if (
      error?.config?.headers?.Authorization &&
      error?.response?.status === 401 &&
      !error.config.url.includes('refresh-token')
    ) {
      try {
        if (TokenService.isTokenExprired()) {
          await _authStore.refreshToken()
          const originalRequest = error.config
          return axiosApiInstance(setAuthHeader(originalRequest))
        } else {
          toast.error(message)
          return Promise.reject(error)
        }
      } catch (error) {
        toast.error(message)
        _authStore.logout()
        return Promise.reject(error)
      }
    } else {
      if (Array.isArray(message)) {
        const errMsg = message.join('. ')
        toast.error(errMsg)
      } else {
        toast.error(message)
      }

      return Promise.reject(error)
    }
  }
)

axios.interceptors.request.use(
  function (config) {
    return setAuthHeader(config)
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  }
)

function setAuthHeader(config: AxiosRequestConfig<any>): AxiosRequestConfig<any> {
  const idToken = TokenService.getIdToken()
  console.log(config.url, baseUrl);
  if (idToken && config.headers && config.url?.startsWith(baseUrl)) {
    config.headers.Authorization = `Bearer ${idToken}`
  }

  return config
}
