import { QueryParams } from './query-param.model'

export interface ReportGeneral {
  risksOverThreshold: number
  risksInProgress: number
  actionsPastDueDate: number
  actionsInProgress: number
  riskScore: number
  managementControlScore: number
}

export interface ReportResponse {
  key: string
  label?: string
  value: number
}

export interface RiskReportResponse {
  key: string
  label: string
  value: ReportResponse[]
}

export interface ReportExport<T> {
  name: T
  query: QueryParams
}
