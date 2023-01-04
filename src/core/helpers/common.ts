import { RoleEnum } from './../models/role.model'
import { QueryParams } from '@/core/models/query-param.model'
import { OrgUser } from '@/core/models/user.model'
import { Ref } from 'vue'
import { helpers } from '@vuelidate/validators'
import { AppPermission } from '../models/permission.model'
import { useAuthStore } from '@/store/use-auth-store'

type EnumObject = { [key: string]: number | string }
type EnumObjectEnum<E extends EnumObject> = E extends {
  [key: string]: infer ET | string
}
  ? ET
  : never

export function getEnumValues<E extends EnumObject>(enumObject: E): EnumObjectEnum<E>[] {
  return Object.keys(enumObject)
    .filter((key) => Number.isNaN(Number(key)))
    .map((key) => enumObject[key] as EnumObjectEnum<E>)
}

const zeroPad = (number: number): string => {
  return ('0' + number).slice(-2)
}

export function formatTime(d: String | Date): string {
  if (d) {
    const date = typeof d === 'string' ? new Date(d) : (d as Date)
    return [zeroPad(date.getHours()), zeroPad(date.getMinutes())].join(':')
  }

  return ''
}

export function formatDate(d: string | Date | Date[], separator = '/'): string {
  if (d) {
    if (typeof d === 'string') {
      const date = new Date(d)
      return formatDateString(date, separator)
    }
    if (Array.isArray(d)) return formatDateString(d[0], separator) + ' - ' + formatDateString(d[1], separator)
    return formatDateString(d, separator)
  }

  return ''
}

export function formatDateString(date: Date, separator = '/'): string {
  return [zeroPad(date.getDate()), zeroPad(date.getMonth() + 1), date.getFullYear()].join(separator)
}

export function formatDateTime(d: String | Date, separator = '/'): string {
  if (d) {
    const date = typeof d === 'string' ? new Date(d) : (d as Date)
    return [formatDate(date, separator), formatTime(date)].join(' ')
  }

  return ''
}

export function getUserName(user?: OrgUser): string {
  if (user) {
    return [user.firstName, user.lastName].join(' ')
  }

  return ''
}

export function external(param: Ref<boolean>) {
  return helpers.withParams({ type: 'external', value: param }, (value) => !helpers.req(value) || param.value)
}

export function toQueryParamsString(queryParams: QueryParams): string {
  const result: string[] = []
  for (const key in queryParams) {
    const param = queryParams[key]
    if (param) {
      if (Array.isArray(param)) {
        if (param.length) result.push(`${key}=${encodeURIComponent(param.toString())}`)
      } else result.push(`${key}=${encodeURIComponent(param.toString())}`)
    }
  }
  return result.join('&')
}

export function hasPermission(permissions: AppPermission[] = []): boolean {
  if (!permissions.length) return true
  const authStore = useAuthStore()
  return permissions.every((p) => authStore.userPermissions.includes(p))
}
export function hasRole(roles: RoleEnum[] = []): boolean {
  if (!roles.length) return true
  const authStore = useAuthStore()
  return roles.includes(authStore.userRole?.name as RoleEnum)
}

export function debounce<T extends Function>(cb: T, wait = 20) {
  let h: NodeJS.Timeout
  const callable = (...args: any) => {
    clearTimeout(h)
    h = setTimeout(() => cb(...args), wait)
  }
  return <T>(<any>callable)
}
