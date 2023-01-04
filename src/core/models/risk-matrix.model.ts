export interface RiskMatrixItem {
  rmlId: string
  rmsId: string
  name: string
  description: string
  value: number
  orgId: string
  createdAt: string
  updatedAt: string
}
export interface AddRiskMatrixItemPayload {
  name: string
  description: string
  value: number
}
export interface UpdateRiskMatrixPayload {
  name?: string
  description?: string
  value?: number | null
}

export type RiskTypes = 'likelihood' | 'severity'

export interface RiskMatrixExposureLevel {
  rmeId: string
  orgId: string
  name: string
  color: string
  fromValue: number
  toValue: number
}
export interface AddRiskMatrixExposureLevel {
  name?: string
  color?: string
  fromValue?: number
  toValue?: number
}
export interface RiskMatrixExposureLevelPayload {
  name: string
  color: string
  fromValue: number
  toValue: number
}
export const defaultLikelihoods: AddRiskMatrixItemPayload[] = [
  { name: 'Very Unlikely', description: '', value: 1 },
  { name: 'Unlikely', description: '', value: 2 },
  { name: 'Possible', description: '', value: 3 },
  { name: 'Likely', description: '', value: 4 },
  { name: 'Very likely', description: '', value: 5 }
]
export const defaultConsequences: AddRiskMatrixItemPayload[] = [
  { name: 'Negligible', description: '', value: 1 },
  { name: 'Minor', description: '', value: 2 },
  { name: 'Moderate', description: '', value: 3 },
  { name: 'Major', description: '', value: 4 },
  { name: 'Catastrophic', description: '', value: 5 }
]
export const defaultExposureLevels = [
  { name: 'Low', color: '#A0EC8A', fromValue: 1, toValue: 3 },
  { name: 'Moderate', color: '#FFE86F', fromValue: 4, toValue: 9 },
  { name: 'High', color: '#FFC56F', fromValue: 10, toValue: 15 },
  { name: 'Extreme', color: '#FFA988', fromValue: 16, toValue: 25 }
]

export interface AddRiskMatrixPayload {
  consequences: AddRiskMatrixItemPayload[]
  likelihoods: AddRiskMatrixItemPayload[]
  exposureLevels?: AddRiskMatrixExposureLevel[]
}
export interface RiskMatrix {
  consequences: RiskMatrixItem[]
  likelihoods: RiskMatrixItem[]
  exposureLevels: RiskMatrixExposureLevel[]
}
