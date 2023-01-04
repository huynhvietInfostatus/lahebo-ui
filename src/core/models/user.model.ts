import { OrgLocation } from '@/core/models/org-location.model'
import { OrgDepartment } from '@/core/models/org-department.model'
import { Role } from './role.model'
export interface OrgUser {
  firstName: string
  lastName: string
  usrId: string
  username: string
  email: string
  phoneNumber: string
  role: Role
  rolId: string
  isActive: boolean
  orgId?: string
  isCurrentUser?: string
  isFirstLogin: boolean
  mfaRegistered: boolean
  departments: OrgDepartment[]
  departmentString?: string[]
  locations: OrgLocation[]
  locationString?: string[]
  organization: any
  stripeLineItem: any
}

export interface AddUserPayload {
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  locIds: string[]
  depIds: string[]
}
export interface UpdateUserPayload {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  depIds?: string[]
  locIds?: string[]
  username?: string
}
