import { RegisterLegalPayload, UpdateRegisterLegalPayload } from './../models/legislation.model'
import { apiUrl } from './../configs/api-config'
import axios from 'axios'
import { QueryParams } from '../models/query-param.model'
import { toQueryParamsString } from '../helpers/common'

export function getAtcs(queryParams: QueryParams) {
  const query = toQueryParamsString(queryParams)
  return axios.get(`${apiUrl}/legislation/acts?${query}`)
}
export function getDivisions(queryParams: QueryParams) {
  const query = toQueryParamsString(queryParams)
  return axios.get(`${apiUrl}/legislation/divisions?${query}`)
}
export function getLegislation(queryParams: QueryParams) {
  const query = toQueryParamsString(queryParams)
  return axios.get(`${apiUrl}/legislation?${query}`)
}
export function getLegalRegister(queryParams: QueryParams) {
  const query = toQueryParamsString(queryParams)
  return axios.get(`${apiUrl}/legislation/register?${query}`)
}
export function getSubItems(queryParams: QueryParams) {
  const query = toQueryParamsString(queryParams)
  return axios.get(`${apiUrl}/legislation/organization?${query}`)
}
export function subscribeItem(id: string) {
  return axios.post(`${apiUrl}/legislation/organization`, { legId: id })
}
export function updateSubscribeItem(orgLegId: string, legId: string) {
  return axios.patch(`${apiUrl}/legislation/organization/${orgLegId}`, { legId })
}
export function unSubscribeItem(id: string) {
  return axios.delete(`${apiUrl}/legislation/organization/${id}`)
}
export function registerLegal(payload: RegisterLegalPayload) {
  return axios.post(`${apiUrl}/legislation/register`, payload)
}
export function updateRegisterLegal(id: string, payload: UpdateRegisterLegalPayload) {
  return axios.patch(`${apiUrl}/legislation/register/${id}`, payload)
}
export function deleteRegisterLegal(id: string) {
  return axios.delete(`${apiUrl}/legislation/register/${id}`)
}
