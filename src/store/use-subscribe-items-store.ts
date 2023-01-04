import { defineStore } from 'pinia'
import { PaginatedResponse, Status } from '@/core/models/common.model'
import { LegislationSubItem } from '@/core/models/legislation.model'
import { QueryParams } from '@/core/models/query-param.model'
import { getSubItems, unSubscribeItem } from '@/core/services/legislation.service'
interface State {
  status: Status
  legisItems: LegislationSubItem[]
  legisItemsDropdown: LegislationSubItem[]
  count: number
}
export const useSubscribedItemsStore = defineStore('subscribedItemsStore', {
  state() {
    return {
      status: 'idle',
      legisItems: [],
      legisItemsDropdown: [],
      count: 0
    } as State
  },
  actions: {
    getSubItems(query: QueryParams = {}, dropdown = false) {
      this.status = 'loading'
      return getSubItems(query)
        .then((res) => {
          const paginatedResponse = res as unknown as PaginatedResponse<LegislationSubItem>
          if (dropdown) {
            this.legisItemsDropdown = paginatedResponse.records
          } else {
            this.legisItems = paginatedResponse.records
            this.count = paginatedResponse.total
          }

          this.status = 'idle'
        })
        .catch(() => {
          this.status = 'idle'
        })
    },
    unSubscribeItem(id: string) {
      return unSubscribeItem(id)
    }
  }
})
