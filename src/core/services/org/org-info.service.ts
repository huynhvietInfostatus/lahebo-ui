import axios from 'axios'
import { apiUrl } from '@/core/configs/api-config'
import { OrgInfoPayload } from '@/core/models/org.model'

function fetchOrg(orgId: string) {
  return axios.get(`${apiUrl}/organizations/${orgId}`)
}

function updateOrg(orgId: string, payload: OrgInfoPayload) {
  return axios.patch(`${apiUrl}/organizations/${orgId}`, payload)
}

export { fetchOrg, updateOrg }
