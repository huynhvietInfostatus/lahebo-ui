import { apiUrl } from './../configs/api-config'
import axios from 'axios'
import { ReportGeneral, ReportResponse, RiskReportResponse } from '@/core/models/report.model'
import { toQueryParamsString } from '@/core/helpers/common'

export function getGeneralReport(depIds: string[], locIds: string[]): Promise<ReportGeneral> {
  const query = toQueryParamsString({ depIds, locIds })
  return axios.get(`${apiUrl}/report/general?${query}`)
}

export function getActionReport(depIds: string[], locIds: string[]): Promise<ReportResponse[]> {
  const query = toQueryParamsString({ depIds, locIds })
  return axios.get(`${apiUrl}/report/action?${query}`)
}

export function getRiskReport(depIds: string[], locIds: string[]): Promise<RiskReportResponse[]> {
  const query = toQueryParamsString({ depIds, locIds })
  return axios.get(`${apiUrl}/report/risk?${query}`)
}

export function getRiskHeatMap(depIds: string[], locIds: string[]): Promise<ReportResponse[]> {
  const query = toQueryParamsString({ depIds, locIds, groupKey: 'rmeLabel' })
  return axios.get(`${apiUrl}/report/risk?${query}`)
}
