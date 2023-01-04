import { apiUrl } from '../../configs/api-config'
import axios from 'axios'
import {
  AddOrgLocationPayload,
  UpdateOrgLocationPayload
} from '../../models/org-location.model'

export function getOrgLocations(orgId: string) {
  return axios.get(`${apiUrl}/organizations/${orgId}/locations`)
}

export function addOrgLocation(orgId: string, payload: AddOrgLocationPayload) {
  return axios.post(`${apiUrl}/organizations/${orgId}/locations`, payload)
}
export function updateOrgLocation(
  orgId: string,
  id: string,
  payload: UpdateOrgLocationPayload
) {
  return axios.patch(`${apiUrl}/organizations/${orgId}/locations/${id}`, payload)
}
export function deleteOrgLocation(orgId: string, id: string) {
  return axios.delete(`${apiUrl}/organizations/${orgId}/locations/${id}`)
}
