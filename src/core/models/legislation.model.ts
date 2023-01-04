import { OrgLocation } from './org-location.model'
import { IsoStandard } from './risk.model'

export interface LegislationAct {
  legActId: string
  key: string
  name: string
  state: string
  source: string
  canShow: boolean
  effectiveDate: string
  isLatest: boolean
}

export interface LegislationDivision {
  legDivId: string
  name: string
  canShow: boolean
}

export interface LegislationDes {
  legId: string
  name: string
  act: LegislationAct
  division: LegislationDivision
  legActId: string
  legDivId: string
  description: string
  canShow: boolean
}

export interface LegislationSubItem {
  legId: string
  legislation: LegislationDes
  orgId: string
  orgLegId: string
}

export interface LegalRegister {
  legRegId: string
  orgControls: string[]
  state: string
  remarks: string
  compliance: boolean
  iso: IsoStandard
  isoId: string
  location: OrgLocation
  locId: string
  referenceNumber: string
  orgLegId: string
  orgLegislation: LegislationSubItem
}

export interface RegisterLegalPayload {
  orgLegId: string
  isoId: string
  locId: string
  orgControls: string[]
  state: string
  referenceNumber: string
  remarks: string
  compliance: boolean
}
export interface UpdateRegisterLegalPayload {
  orgLegId?: string
  isoId?: string
  locId?: string
  orgControls?: string[]
  state?: string
  remarks?: string
  referenceNumber?: string
  compliance?: boolean
}
