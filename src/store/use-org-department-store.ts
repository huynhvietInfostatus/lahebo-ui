import { Status } from '@/core/models/common.model'
import { AddOrgDepartmentPayload, OrgDepartment, UpdateOrgDepartmentPayload } from '@/core/models/org-department.model'
import {
  addOrgDepartment,
  deleteOrgDepartment,
  getOrgDepartments,
  updateOrgDepartment
} from '@/core/services/org/org-department.service'
import { defineStore } from 'pinia'
import { useAuthStore } from './use-auth-store'

export interface OrgDepartmentState {
  departments: OrgDepartment[]
  status: { list: Status; item: Status }
}

export const useOrgDepartmentStore = defineStore('orgDepartmentStore', {
  state: () =>
    ({
      status: { list: 'idle', item: 'idle' },
      departments: []
    } as OrgDepartmentState),
  actions: {
    getDepartments() {
      const _authStore = useAuthStore()
      this.status.list = 'loading'
      return getOrgDepartments(_authStore.orgId)
        .then((res) => {
          this.status.list = 'idle'
          this.departments = res as unknown as OrgDepartment[]
          return res
        })
        .catch((err) => {
          this.status.list = 'error'
          throw err
        })
    },
    addDepartment(payload: AddOrgDepartmentPayload) {
      const _authStore = useAuthStore()
      this.status.item = 'loading'
      return addOrgDepartment(_authStore.orgId, payload)
        .then((res) => {
          this.status.item = 'idle'
          return res
        })
        .catch((err) => {
          this.status.item = 'error'
          throw err
        })
    },
    updateDepartment(id: string, payload: UpdateOrgDepartmentPayload) {
      const _authStore = useAuthStore()
      this.status.item = 'loading'
      return updateOrgDepartment(_authStore.orgId, id, payload)
        .then((res) => {
          this.status.item = 'idle'
          return res
        })
        .catch((err) => {
          this.status.item = 'error'
          throw err
        })
    },
    deleteDepartment(id: string) {
      const _authStore = useAuthStore()
      this.status.item = 'loading'
      return deleteOrgDepartment(_authStore.orgId, id)
        .then(() => {
          this.status.item = 'idle'
          this.departments = this.departments.filter((l) => l.depId !== id)
        })
        .catch((err) => {
          this.status.item = 'error'
          throw err
        })
    }
  },
  getters: {
    itemStatus: (state) => state.status.item,
    listStatus: (state) => state.status.list,
    departmentDropdown: (state) => state.departments.map((d) => ({ id: d.depId, name: d.name }))
  }
})
