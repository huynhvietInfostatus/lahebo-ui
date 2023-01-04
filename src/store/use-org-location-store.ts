import { Status } from '@/core/models/common.model'
import { AddOrgLocationPayload, OrgLocation, UpdateOrgLocationPayload } from '@/core/models/org-location.model'
import {
  addOrgLocation,
  deleteOrgLocation,
  getOrgLocations,
  updateOrgLocation
} from '@/core/services/org/org-location.service'
import { defineStore } from 'pinia'
import { useAuthStore } from './use-auth-store'

export interface OrgLocationState {
  locations: OrgLocation[]
  status: { list: Status; item: Status }
}

export const useOrgLocationStore = defineStore('orgLocationStore', {
  state: () =>
    ({
      status: { list: 'idle', item: 'idle' },
      locations: []
    } as OrgLocationState),
  actions: {
    getLocations() {
      const _authStore = useAuthStore()
      this.status.list = 'loading'
      return getOrgLocations(_authStore.orgId)
        .then((res) => {
          this.status.list = 'idle'
          this.locations = res as unknown as OrgLocation[]
          return res
        })
        .catch((err) => {
          this.status.list = 'error'
          throw err
        })
    },
    addLocation(payload: AddOrgLocationPayload) {
      const _authStore = useAuthStore()
      this.status.item = 'loading'
      return addOrgLocation(_authStore.orgId, payload)
        .then((res) => {
          this.status.item = 'idle'
          return res
        })
        .catch((err) => {
          this.status.item = 'error'
          throw err
        })
    },
    updateLocation(id: string, payload: UpdateOrgLocationPayload) {
      const _authStore = useAuthStore()
      this.status.item = 'loading'
      return updateOrgLocation(_authStore.orgId, id, payload)
        .then((res) => {
          this.status.item = 'idle'
          return res
        })
        .catch((err) => {
          this.status.item = 'error'
          throw err
        })
    },
    deleteLocation(id: string) {
      const _authStore = useAuthStore()
      this.status.item = 'loading'
      return deleteOrgLocation(_authStore.orgId, id)
        .then(() => {
          this.status.item = 'idle'
          this.locations = this.locations.filter((l) => l.locId !== id)
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
    locationDropdown: (state) => state.locations.map((l) => ({ id: l.locId, name: l.name }))
  }
})
