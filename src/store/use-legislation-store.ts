import { PaginatedResponse, Status } from '@/core/models/common.model'
import { LegislationAct, LegislationDes, LegislationDivision } from '@/core/models/legislation.model'
import { QueryParams } from '@/core/models/query-param.model'
import {
  getAtcs,
  getDivisions,
  getLegislation,
  subscribeItem,
  updateSubscribeItem
} from '@/core/services/legislation.service'
import { defineStore } from 'pinia'

interface State {
  status: Status
  acts: LegislationAct[]
  atcCount: number
  divisions: LegislationDivision[]
  divisionCount: number
  legisItems: LegislationDes[]
  legisItemsUpdated: LegislationDes[]
  legisItemCount: number
}

export const useLegislationLibrary = defineStore('legislationLibrary', {
  state() {
    return {
      status: 'idle',
      acts: [],
      atcCount: 0,
      divisions: [],
      divisionCount: 0,
      legisItems: [],
      legisItemCount: 0,
      legisItemsUpdated: []
    } as State
  },
  actions: {
    getActs(query: QueryParams = {}) {
      return getAtcs(query).then((res) => {
        const paginatedResponse = res as unknown as PaginatedResponse<LegislationAct>
        this.acts = paginatedResponse.records.map((item) => {
          item.name = `${item.state} - ${item.name}`
          return item
        })
        this.atcCount = paginatedResponse.total
      })
    },
    getDivisions(query: QueryParams = {}) {
      return getDivisions(query).then((res) => {
        const paginatedResponse = res as unknown as PaginatedResponse<LegislationDivision>
        this.divisions = paginatedResponse.records
        this.divisionCount = paginatedResponse.total
      })
    },
    getLegisItems(query: QueryParams = {}, inUpdate = false) {
      this.status = 'loading'
      return getLegislation(query)
        .then((res) => {
          const paginatedResponse = res as unknown as PaginatedResponse<LegislationDes>
          if (inUpdate) this.legisItemsUpdated = paginatedResponse.records
          else {
            this.legisItems = paginatedResponse.records
            this.legisItemCount = paginatedResponse.total
          }

          this.status = 'idle'
        })
        .catch(() => {
          this.status = 'error'
        })
    },
    subscribeItem(id: string) {
      return subscribeItem(id)
    },
    updateSubscribeItem(orgLegId: string, legId: string) {
      return updateSubscribeItem(orgLegId, legId)
    }
  }
})
