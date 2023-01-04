import { Action } from '@/core/models/action.model'
import { PaginatedResponse, Status } from '@/core/models/common.model'
import { QueryParams } from '@/core/models/query-param.model'
import { Risk } from '@/core/models/risk.model'
import { getActions } from '@/core/services/action.service'
import { fetchRisks } from '@/core/services/risk.service'
import { defineStore } from 'pinia'

interface ReportState {
  risks: Risk[]
  actions: Action[]
  status: Status
  riskTotal: number
  actionTotal: number
}

export const useReportStore = defineStore('reportStore', {
  state() {
    return {
      risks: [],
      actions: [],
      status: 'idle',
      riskTotal: 0,
      actionTotal: 0
    } as ReportState
  },
  actions: {
    fetchRisks(params: QueryParams = {}) {
      this.status = 'loading'
      return fetchRisks(params).then(
        (res: any) => {
          this.status = 'idle'
          const paginatedResponse = res as unknown as PaginatedResponse<Risk>
          this.risks = paginatedResponse.records
          this.riskTotal = paginatedResponse.total
          return res
        },
        (err) => {
          this.status = 'error'
          console.log(err)
          throw err
        }
      )
    },
    getActions(params: QueryParams = {}) {
      this.status = 'loading'
      return getActions(params)
        .then((res) => {
          this.status = 'idle'
          const result = res as unknown as PaginatedResponse<Action>
          this.actions = result.records
          this.actionTotal = result.total
          return res
        })
        .catch((e) => {
          this.status = 'error'
          throw e
        })
    }
  }
})
