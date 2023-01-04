import { OrgLocation } from './org-location.model'
import { OrgDepartment } from '@/core/models/org-department.model'
import { OrgUser } from '@/core/models/user.model'
import { RiskMatrixItem } from '@/core/models/risk-matrix.model'
import { LegalRegister } from './legislation.model'
import { Action, AddActionPayload } from './action.model'

export interface RiskSource {
  rscId: string
  name: string
  displayOrder: number
}

export interface IsoStandard {
  isoId: string
  name: string
  displayOrder: number
}

export interface Risk {
  rskId: string
  ownId: string
  rscId: string
  depId: string
  department: OrgDepartment
  location: OrgLocation
  locId: string
  beforeRmlId: string
  beforeRmsId: string
  afterRmlId: string
  afterRmsId: string
  name: string
  description: string
  isoId: string
  dueDate: string | Date
  createdAt: string | Date
  remarks: string
  status: RiskStatus
  legRegId: string
  legalRegsiter: LegalRegister
  mitigations: RiskMitigation[]
  actions: Action[]

  riskSource?: RiskSource
  owner?: OrgUser
  beforeRml?: RiskMatrixItem
  beforeRms?: RiskMatrixItem
  afterRml?: RiskMatrixItem
  afterRms?: RiskMatrixItem
  isoStandard?: IsoStandard
}

export interface RiskMitigation {
  rstId: string
  rskId: string
  content: string
  isActionItem: boolean
  assigneeId: string | null
  assignee: OrgUser
}

export enum RiskStatus {
  DRAFT = 'DRAFT',
  ACCEPTED = 'ACCEPTED',
  NOT_ACCEPTED = 'NOT_ACCEPTED',
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  AWAITING_REVIEW = 'AWAITING_REVIEW',
  CLOSED = 'CLOSED'
}
export type RiskStatusStrings = keyof typeof RiskStatus

export const RiskStatusText = {
  [RiskStatus.OPEN]: 'Open',
  [RiskStatus.CLOSED]: 'Closed',
  [RiskStatus.ACCEPTED]: 'Accepted',
  [RiskStatus.NOT_ACCEPTED]: 'Not Accepted',
  [RiskStatus.IN_PROGRESS]: 'In Progress',
  [RiskStatus.AWAITING_REVIEW]: 'Awaiting Review',
  [RiskStatus.DRAFT]: 'Draft'
}

export const RiskStatusColor = {
  [RiskStatus.OPEN]: '#3AA0FF',
  [RiskStatus.CLOSED]: '#717d8a',
  [RiskStatus.ACCEPTED]: '#44c13c',
  [RiskStatus.NOT_ACCEPTED]: '#ff513a',
  [RiskStatus.IN_PROGRESS]: '#3AA0FF',
  [RiskStatus.AWAITING_REVIEW]: '#ffcf0f',
  [RiskStatus.DRAFT]: '#717d8a'
}

export interface RiskMitigationPayload {
  rskId?: string
  rstId?: string
  isActionItem: boolean
  content: string
  assigneeId: string | null
  actId?: string | null
  action?: AddActionPayload
}

export interface BaseRiskPayload {
  rskId?: string
  description: string
  isoId?: string | null
  rscId: string | null
  mitigations: RiskMitigationPayload[]
  ownId: string | null
  locId: string | null
  depId: string | null
  remarks: string
  status: RiskStatus
  legRegId: string | null
}

export interface RiskPayload extends BaseRiskPayload {
  dueDate: Date
  beforeRmlId: string | null
  beforeRmsId: string | null
  afterRmlId: string | null
  afterRmsId: string | null
}

export interface RaiseRiskPayload extends BaseRiskPayload {
  dueDate?: Date
}

export interface UploadRiskPayload {
  name?: string
  description?: string
  rscId?: string | null
  mitigations?: Array<RiskMitigationPayload>
  ownId?: string | null
  remarks?: string
  status?: RiskStatus
  isoId?: string | null
  dueDate?: Date | null
  beforeRmlId?: string | null
  beforeRmsId?: string | null
  afterRmlId?: string | null
  afterRmsId?: string | null
  depId?: string | null
  locId?: string | null
  legRegId?: string | null
}

export interface RiskMitigationUpdatePayload {
  mitigations: RiskMitigationPayload[]
}

export const riskExposureColors = [
  { name: 'Low', color: '#a0ec8a' },
  { name: 'Moderate', color: '#ffe86f' },
  { name: 'High', color: '#FFC56F' },
  { name: 'Catastrophic', color: '#ffa988' }
]

export interface UpdateRiskStatus {
  reasonForRejection?: string
  status: RiskStatus
}

export type ActionType = 'Reject' | 'Accept' | 'Unaccept' | 'Approve'

export interface RiskReport {
  risk: string
  source: string
  owner: string
  department: string
  location: string
  il: string | number
  ic: string | number
  ire: string | number
  rl: string | number
  rc: string | number
  rre: string | number
  dueDate: string
  status: string
}
