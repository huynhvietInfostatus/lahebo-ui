import axios from 'axios'
import { apiUrl } from '@/core/configs/api-config'

function fetchTimeZones() {
  return axios.get(`${apiUrl}/time-zone`)
}

function fetchRiskSources() {
  return axios.get(`${apiUrl}/risk-source`)
}

function fetchIsoStandards() {
  return axios.get(`${apiUrl}/iso-standard`)
}

function getActionSources() {
  return axios.get(`${apiUrl}/action-source`)
}

export { fetchTimeZones, fetchRiskSources, fetchIsoStandards, getActionSources }
