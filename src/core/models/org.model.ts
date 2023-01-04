import { OrgUser } from '@/core/models/user.model'

export enum OrgSize {
  MICRO = 'MICRO',
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  ENTERPRISE = 'ENTERPRISE'
}

export const orgSizes = [
  { value: OrgSize.MICRO, text: '0-9' },
  { value: OrgSize.SMALL, text: '10-49' },
  { value: OrgSize.MEDIUM, text: '50-249' },
  { value: OrgSize.ENTERPRISE, text: '250+' }
]

export interface OrgPayload {
  orgId?: string
  info?: OrgInfoPayload
}

export interface OrgInfoPayload {
  name: string
  code: string
  timeZone: string
  usrId?: string // Account Holder
  admin?: OrgUser
  size?: OrgSize
  contactUserId: string | null
}
