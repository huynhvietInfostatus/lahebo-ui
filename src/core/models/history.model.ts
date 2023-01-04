import { OrgUser } from './user.model'

export interface History {
  hstId: string
  changes: HistoryChange[]
  type: string
  createdAt: string
  updatedAt: string
  userId: string
  user: OrgUser
}

export enum HistoryType {
  'CREATE' = 'CREATE',
  'UPDATE' = 'UPDATE'
}

export interface HistoryChange {
  fieldName: string
  oldValue: string
  newValue: string
}

export const FieldHistoryName: { [key: string]: string } = {
  owner: 'Owner',
  riskSource: 'Risk Source',
  beforeRml: 'Before Likelihood',
  beforeRms: 'Before Consequence',
  afterRml: 'After Likelihood',
  afterRms: 'After Consequence',
  description: 'Description',
  dueDate: 'Due Date',
  remarks: 'Remarks',
  isoStandard: 'ISO Standard',
  location: 'Location',
  department: 'Department',
  reasonForRejection: 'Reason for rejection',
  mitigations: 'Mitigations'
}
