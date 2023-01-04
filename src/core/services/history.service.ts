import { apiUrl } from './../configs/api-config'
import axios from 'axios'

export function getRiskHistories(riskId: string) {
  return axios.get(`${apiUrl}/risk/${riskId}/histories`)
}
