import { Status } from '@/core/models/common.model'
import { History } from '@/core/models/history.model'
import { getRiskHistories } from '@/core/services/history.service'
import { defineStore } from 'pinia'

interface HistoryState {
  histories: History[]
  status: Status
}

export const useHistoryStore = defineStore('historyStore', {
  state: () =>
    ({
      histories: [],
      status: 'idle'
    } as HistoryState),
  actions: {
    getRiskHistories(riskId: string) {
      this.status = 'loading'
      return getRiskHistories(riskId)
        .then((res) => {
          this.status = 'idle'
          this.histories = res as unknown as History[]
        })
        .catch((e) => {
          this.status = 'error'
          throw e
        })
    }
  }
})
