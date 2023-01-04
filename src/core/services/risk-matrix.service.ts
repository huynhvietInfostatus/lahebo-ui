import {
  AddRiskMatrixExposureLevel,
  AddRiskMatrixPayload,
  UpdateRiskMatrixPayload
} from './../models/risk-matrix.model'
import { apiUrl } from './../configs/api-config'
import axios from 'axios'

export function getRiskMatrix(orgId: string) {
  return axios.get(`${apiUrl}/organizations/${orgId}/risk-matrix`)
}
export function getRiskMatrixLikelihood(orgId: string) {
  return axios.get(`${apiUrl}/organizations/${orgId}/risk-matrix-likelihoods`)
}

export function postRiskMatrixLikelihood(payload: AddRiskMatrixPayload, orgId: string) {
  return axios.post(`${apiUrl}/organizations/${orgId}/risk-matrix-likelihoods`, payload)
}

export function updateRiskMatrixLikelihood(payload: UpdateRiskMatrixPayload, id: string, orgId: string) {
  return axios.patch(`${apiUrl}/organizations/${orgId}/risk-matrix-likelihoods/${id}`, payload)
}

export function deleteRiskMatrixLikelihood(id: string, orgId: string) {
  return axios.delete(`${apiUrl}/organizations/${orgId}/risk-matrix-likelihoods/${id}`)
}

export function getRiskMatrixSeverity(orgId: string) {
  return axios.get(`${apiUrl}/organizations/${orgId}/risk-matrix-consequences`)
}

export function postRiskMatrixSeverity(payload: AddRiskMatrixPayload, orgId: string) {
  return axios.post(`${apiUrl}/organizations/${orgId}/risk-matrix-consequences`, payload)
}

export function updateRiskMatrixSeverity(payload: UpdateRiskMatrixPayload, id: string, orgId: string) {
  return axios.patch(`${apiUrl}/organizations/${orgId}/risk-matrix-consequences/${id}`, payload)
}

export function deleteRiskMatrixSeverity(id: string, orgId: string) {
  return axios.delete(`${apiUrl}/organizations/${orgId}/risk-matrix-consequences/${id}`)
}

export function getRiskMatrixExposureLevels(orgId: string) {
  return axios.get(`${apiUrl}/organizations/${orgId}/risk-matrix-exposure-levels`)
}

export function initDefaultRiskMatrix(orgId: string, payload: AddRiskMatrixPayload) {
  return axios.patch(`${apiUrl}/organizations/${orgId}/risk-matrix`, payload)
}
export function postRiskExposureLevel(orgId: string, payload: AddRiskMatrixExposureLevel[]) {
  return axios.patch(`${apiUrl}/organizations/${orgId}/risk-matrix-exposure-levels/replace`, payload)
}
