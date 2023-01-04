import { PaginatedResponse, Status } from '@/core/models/common.model'
import {
  BaseRiskPayload,
  Risk,
  RiskMitigationPayload,
  RiskStatus,
  UpdateRiskStatus,
  UploadRiskPayload
} from '@/core/models/risk.model'
import { defineStore } from 'pinia'
import {
  addMultipleRisks,
  addRisk,
  deleteRisk,
  downloadTemplate,
  editRisk,
  fetchRisks,
  updateRiskMitigations,
  updateRiskStatus,
  updateRiskStatusValue
} from '@/core/services/risk.service'
import { QueryParams } from '@/core/models/query-param.model'

export interface RiskState {
  status: Status
  error: string
  risks: Risk[]
  riskDropdownList: Risk[]
  totalRecords: number
}

export const useRiskStore = defineStore('riskStore', {
  state: () =>
    ({
      status: 'idle',
      error: '',
      risks: [],
      totalRecords: 0,
      riskDropdownList: []
    } as RiskState),
  actions: {
    fetchRisks(params: QueryParams = {}, isDropdown = false) {
      this.status = 'loading'
      return fetchRisks(params).then(
        (res: any) => {
          this.status = 'idle'
          const paginatedResponse = res as unknown as PaginatedResponse<Risk>
          if (isDropdown) this.riskDropdownList = paginatedResponse.records
          else this.risks = paginatedResponse.records
          this.totalRecords = paginatedResponse.total
          return res
        },
        (err) => {
          this.status = 'error'
          console.log(err)
          throw err
        }
      )
    },
    addRisk(payload: BaseRiskPayload) {
      return addRisk(payload).then(
        (res) => {
          return res
        },
        (err) => {
          console.log(err)
          throw err
        }
      )
    },
    addMultipleRisks(payload: UploadRiskPayload[]) {
      this.status = 'loading'
      return addMultipleRisks(payload).then(
        (res) => {
          return res
        },
        (err) => {
          console.log(err)
          throw err
        }
      )
    },
    editRisk(rskId: string, payload: BaseRiskPayload) {
      return editRisk(rskId, payload).then(
        (res) => {
          return res
        },
        (err) => {
          console.log(err)
          throw err
        }
      )
    },
    updateMitigation(rskId: string, payload: Array<RiskMitigationPayload>) {
      return updateRiskMitigations(rskId, payload).then(
        (res) => {
          return res
        },
        (err) => {
          console.log(err)
          throw err
        }
      )
    },
    updateRiskStatus(rskId: string, payload: UpdateRiskStatus) {
      return updateRiskStatus(rskId, payload).then(
        (res) => {
          return res
        },
        (err) => {
          console.log(err)
          throw err
        }
      )
    },
    updateRiskStatusValue(rskId: string, status: RiskStatus) {
      return updateRiskStatusValue(rskId, status).then(
        (res) => {
          this.risks = this.risks.map((r) => (r.rskId === rskId ? { ...r, status } : r))
          return res
        },
        (err) => {
          console.log(err)
          throw err
        }
      )
    },
    deleteRisk(rskId: string) {
      return deleteRisk(rskId).then(
        (res) => {
          return res
        },
        (err) => {
          console.log(err)
          throw err
        }
      )
    },
    downloadTemplate() {
      return downloadTemplate()
    }
  },
  getters: {
    filteredRiskDropdownList: (state) =>
      state.riskDropdownList.filter((r) => r.status === RiskStatus.OPEN || r.status === RiskStatus.IN_PROGRESS)
  }
})
