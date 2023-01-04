import { RiskMatrixExposureLevel } from '@/core/models/risk-matrix.model'
import { Status } from '@/core/models/common.model'
import {
  defaultConsequences,
  defaultLikelihoods,
  defaultExposureLevels,
  AddRiskMatrixExposureLevel,
  RiskMatrix,
  AddRiskMatrixPayload,
  RiskMatrixItem
} from '@/core/models/risk-matrix.model'
import {
  getRiskMatrix,
  getRiskMatrixExposureLevels,
  initDefaultRiskMatrix,
  postRiskExposureLevel
} from '@/core/services/risk-matrix.service'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/store/use-auth-store'

interface RiskMatrixState {
  status: Status
  riskMatrix: RiskMatrix
}

const sortByValue = (items: RiskMatrixItem[]) => {
  return items.sort((a, b) => a.value - b.value)
}

const sortExposureLevel = (items: RiskMatrixExposureLevel[]) => {
  return items.sort((a, b) => a.fromValue - b.fromValue)
}

export const useRiskMatrixStore = defineStore('riskMatrixStore', {
  state: () => {
    return {
      status: 'idle',
      riskMatrix: { likelihoods: [], consequences: [], exposureLevels: [] }
    } as RiskMatrixState
  },
  actions: {
    getRiskMatrix() {
      const _authStore = useAuthStore()
      this.status = 'loading'
      return getRiskMatrix(_authStore.orgId)
        .then((res: any) => {
          this.riskMatrix.exposureLevels = sortExposureLevel(res.exposureLevels)
          this.riskMatrix.consequences = sortByValue(res.consequences)
          this.riskMatrix.likelihoods = sortByValue(res.likelihoods)
          this.status = 'idle'
        })
        .catch(() => (this.status = 'error'))
    },
    getRiskMatrixExposureLevels() {
      const _authStore = useAuthStore()
      this.status = 'loading'
      getRiskMatrixExposureLevels(_authStore.orgId).then(
        (res: any) => {
          this.riskMatrix.exposureLevels = sortExposureLevel(res as unknown as RiskMatrixExposureLevel[])
          this.status = 'idle'
        },
        () => (this.status = 'error')
      )
    },
    postRiskMatrixExposureLevels(payload: AddRiskMatrixExposureLevel[]) {
      const _authStore = useAuthStore()
      return postRiskExposureLevel(_authStore.orgId, payload).then(
        (res: any) => {
          this.riskMatrix.exposureLevels = sortExposureLevel(res as unknown as RiskMatrixExposureLevel[])
          this.status = 'idle'
        },
        () => (this.status = 'error')
      )
    },
    initDefaultRiskMatrix() {
      const _authStore = useAuthStore()
      return initDefaultRiskMatrix(_authStore.orgId, {
        consequences: defaultConsequences,
        likelihoods: defaultLikelihoods,
        exposureLevels: defaultExposureLevels
      }).then((res: any) => {
        this.riskMatrix.exposureLevels = sortExposureLevel(res.exposureLevels)
        this.riskMatrix.consequences = sortByValue(res.consequences)
        this.riskMatrix.likelihoods = sortByValue(res.likelihoods)
      })
    },
    updateRiskMatrix(payload: AddRiskMatrixPayload) {
      const _authStore = useAuthStore()
      return initDefaultRiskMatrix(_authStore.orgId, payload).then((res: any) => {
        this.riskMatrix.exposureLevels = sortExposureLevel(res.exposureLevels)
        this.riskMatrix.consequences = sortByValue(res.consequences)
        this.riskMatrix.likelihoods = sortByValue(res.likelihoods)
      })
    }
  },
  getters: {
    likelihoods: (state) => state.riskMatrix.likelihoods,
    consequences: (state) => state.riskMatrix.consequences,
    exposureLevels: (state) => state.riskMatrix.exposureLevels
  }
})
