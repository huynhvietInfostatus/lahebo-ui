import { Status } from '@/core/models/common.model'
import { AddRiskSwotPayload, RiskSwot, RiskSwotType, UpdateRiskSwotPayload } from '@/core/models/risk-swot.model'
import {
  addRiskSwot,
  createRiskFromSwot,
  deleteRisSwot,
  getRiskSwot,
  updateRiskSwot
} from '@/core/services/risk-swot.service'
import { defineStore } from 'pinia'

interface SwotState {
  riskSwot: RiskSwot[]
  status: Status
}

export const useSwotStore = defineStore('swotStore', {
  state: () =>
    ({
      riskSwot: [],
      status: 'idle'
    } as SwotState),
  actions: {
    getRiskSwot() {
      this.status = 'loading'
      return getRiskSwot()
        .then((res) => {
          this.riskSwot = res as unknown as RiskSwot[]
          this.status = 'idle'
          return res
        })
        .catch((e) => {
          this.status = 'error'
          throw e
        })
    },
    addRiskSwot(payload: AddRiskSwotPayload) {
      return addRiskSwot(payload)
        .then((res) => {
          this.riskSwot.push(res as unknown as RiskSwot)
          return res
        })
        .catch((e) => {
          this.status = 'error'
          throw e
        })
    },
    updateRiskSwot(id: string, payload: UpdateRiskSwotPayload) {
      return updateRiskSwot(id, payload)
        .then((res) => {
          return res
        })
        .catch((e) => {
          this.status = 'error'
          throw e
        })
    },
    deleteRiskSwot(id: string) {
      return deleteRisSwot(id)
        .then(() => {
          this.riskSwot = this.riskSwot.filter((r) => r.rssId !== id)
          return id
        })
        .catch((e) => {
          this.status = 'error'
          throw e
        })
    },
    createRiskFromSwot(id: string) {
      return createRiskFromSwot(id)
        .then((res) => {
          return res
        })
        .catch((e) => {
          this.status = 'error'
          throw e
        })
    }
  },
  getters: {
    strengths: (state) => state.riskSwot.filter((r) => r.type === 'STRENGTH'),
    opportunities: (state) => state.riskSwot.filter((r) => r.type === 'OPPORTUNITY'),
    weaknesses: (state) => state.riskSwot.filter((r) => r.type === 'WEAKNESS'),
    threats: (state) => state.riskSwot.filter((r) => r.type === 'THREAT'),
    swotByType: (state) => {
      return (type: RiskSwotType) => state.riskSwot.filter((r) => r.type === type)
    }
  }
})
