import { AddUserPayload, UpdateUserPayload } from '../../models/user.model'
import { apiUrl } from '../../configs/api-config'
import axios from 'axios'
import { toQueryParamsString } from '@/core/helpers/common'
import { QueryParams } from '@/core/models/query-param.model'

export function getUserList(orgId: string, queryParams: QueryParams) {
  const query = toQueryParamsString(queryParams)
  return axios.get(`${apiUrl}/organizations/${orgId}/users?${query}`)
}
export function addOrgUser(payload: AddUserPayload, orgId: string) {
  return axios.post(`${apiUrl}/organizations/${orgId}/users`, payload)
}
export function updateOrgUser(payload: UpdateUserPayload, orgId: string, id: string) {
  return axios.patch(`${apiUrl}/organizations/${orgId}/users/${id}`, payload)
}
export function deleteOrgUser(orgId: string, id: string) {
  return axios.delete(`${apiUrl}/organizations/${orgId}/users/${id}`)
}
export function getRoles() {
  return axios.get(`${apiUrl}/roles`)
}
