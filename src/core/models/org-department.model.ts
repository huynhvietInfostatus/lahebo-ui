import { OrgUser } from './user.model'

export interface OrgDepartment {
  depId: string
  usrId: string
  name: string
  manager: OrgUser
}

export interface AddOrgDepartmentPayload {
  name: string
  manager: string | null
}
export interface UpdateOrgDepartmentPayload {
  name?: string
  manager: string | null
}
