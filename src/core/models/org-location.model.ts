import { OrgUser } from './user.model'

export interface OrgLocation {
  locId: string
  name: string
  usrId: string
  address: string
  phoneNumber: string
  isHeadOffice: boolean
  keyContact: OrgUser
}

export interface AddOrgLocationPayload {
  name: string
  address: string
  keyContact: string | null
  phoneNumber: string
  isHeadOffice: boolean
}
export interface UpdateOrgLocationPayload {
  name?: string
  address?: string
  keyContact?: string | null
  phoneNumber?: string
  isHeadOffice?: boolean
}
