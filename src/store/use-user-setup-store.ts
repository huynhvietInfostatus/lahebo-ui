import { RoleEnum } from './../core/models/role.model'
import { Status } from '@/core/models/common.model'
import { AddUserPayload, OrgUser, UpdateUserPayload } from '@/core/models/user.model'
import {
  addOrgUser,
  deleteOrgUser,
  getRoles,
  getUserList,
  updateOrgUser
} from '@/core/services/org/org-user-setup.service'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/store/use-auth-store'
import { Role } from '@/core/models/role.model'
import { QueryParams } from '@/core/models/query-param.model'
import { AppPermission } from '@/core/models/permission.model'

interface UserSetupState {
  status: { list: Status; action: Status }
  userList: OrgUser[]
  userDropdownList: OrgUser[]
  roles: Role[]
}

export const useUserSetupStore = defineStore('userSetupStore', {
  state: () => {
    return {
      status: { list: 'idle', action: 'idle' },
      userList: [],
      roles: [],
      userDropdownList: []
    } as UserSetupState
  },
  actions: {
    getUserList(params: QueryParams = {}, isAtDropdown = false) {
      this.status.list = 'loading'
      const _authStore = useAuthStore()
      return getUserList(_authStore.orgId, params)
        .then((res) => {
          if (isAtDropdown) {
            this.userDropdownList = res as unknown as OrgUser[]
          } else {
            this.userList = res as unknown as OrgUser[]
          }
          this.status.list = 'idle'
          return res
        })
        .catch((e) => {
          this.status.list = 'error'
          throw e
        })
    },

    getRoles() {
      return getRoles()
        .then((res) => {
          this.roles = res as unknown as Role[]
        })
        .catch((e) => {
          throw e
        })
    },

    addUser(payload: AddUserPayload) {
      const _authStore = useAuthStore()
      this.status.action = 'loading'
      return addOrgUser(payload, _authStore.orgId)
        .then((res) => {
          this.userList.push(res as unknown as OrgUser)
          this.status.action = 'idle'
          return res
        })
        .catch((e) => {
          this.status.action = 'error'
          throw e
        })
    },
    updateUser(payload: UpdateUserPayload, id: string) {
      const _authStore = useAuthStore()
      this.status.action = 'loading'
      return updateOrgUser(payload, _authStore.orgId, id)
        .then((res) => {
          this.userList = this.userList.map((u) => (u.usrId === id ? { ...u, ...(res as unknown as OrgUser) } : u))
          this.status.action = 'idle'
          return res
        })
        .catch((e) => {
          this.status.action = 'error'
          throw e
        })
    },
    deleteUser(id: string) {
      const _authStore = useAuthStore()
      this.status.action = 'loading'
      return deleteOrgUser(_authStore.orgId, id)
        .then((res) => {
          this.userList = this.userList.filter((u) => u.usrId !== id)
          this.status.action = 'idle'
          return res
        })
        .catch((e) => {
          this.status.action = 'error'
          throw e
        })
    }
  },
  getters: {
    listStatus: (state) => state.status.list,
    actionStatus: (state) => state.status.action,
    users: (state) => {
      const _authStore = useAuthStore()
      return state.userList.map((u) => ({
        ...u,
        departmentString: u.departments.map((d) => d.name),
        locationString: u.locations.map((l) => l.name),
        isCurrentUser: u.usrId === _authStore.userId
      })) as unknown as OrgUser[]
    },
    assignees: (state) => {
      return state.userDropdownList.filter((u) => u.role.permissions.includes(AppPermission.ACTION_ASSIGNEE))
    },
    owners: (state) => {
      return state.userDropdownList.filter((u) => u.role.permissions.includes(AppPermission.RISK_OWNER))
    },
    listSuperAdmin: (state) => {
      return state.userDropdownList.filter((u) => u.role.name === RoleEnum.SUPER_ADMIN)
    },
    listRoles: (state) => state.roles.filter((r) => r.name !== RoleEnum.CONTRIBUTOR && r.name !== RoleEnum.SYSTEM_ADMIN)
  }
})
