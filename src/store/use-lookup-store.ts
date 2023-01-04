import { defineStore } from 'pinia'
import { fetchIsoStandards, fetchRiskSources, fetchTimeZones, getActionSources } from '@/core/services/lookup.service'
import { Status } from '@/core/models/common.model'
import { IsoStandard, RiskSource } from '@/core/models/risk.model'
import { ActionSource } from '@/core/models/action.model'

export interface LookupState {
  status: Status
  error: string
  timeZones: string[]
  riskSources: RiskSource[]
  isoStandards: IsoStandard[]
  actionSources: ActionSource[]
}

export const useLookupStore = defineStore('lookupStore', {
  state: () =>
    ({
      status: 'idle',
      error: '',
      timeZones: [],
      riskSources: [],
      isoStandards: [],
      actionSources: []
    } as LookupState),
  actions: {
    fetchTimeZones() {
      this.status = 'loading'
      fetchTimeZones()
        .then((res: any) => {
          this.status = 'idle'
          const { timeZones } = res
          if (Array.isArray(timeZones)) {
            this.timeZones = timeZones
          }
        })
        .catch((err) => {
          this.status = 'error'
          console.log(err)
        })
    },
    fetchRiskSources() {
      this.status = 'loading'
      fetchRiskSources().then(
        (res: any) => {
          if (Array.isArray(res)) {
            this.riskSources = res
              .map((it) => ({
                rscId: it['rscId'],
                name: it['name'],
                displayOrder: it['displayOrder']
              }))
              .sort((a, b) => a.displayOrder - b.displayOrder)
          }
        },
        (err) => {
          console.log(err)
          this.status = 'error'
        }
      )
    },
    fetchIsoStandards() {
      this.status = 'loading'
      fetchIsoStandards().then(
        (res: any) => {
          if (Array.isArray(res)) {
            this.isoStandards = res
              .map((it) => ({
                isoId: it['isoId'],
                name: it['name'],
                displayOrder: it['displayOrder']
              }))
              .sort((a, b) => a.displayOrder - b.displayOrder)
          }
        },
        (err) => {
          console.log(err)
          this.status = 'error'
        }
      )
    },
    getActionSources() {
      return getActionSources().then((res) => {
        this.actionSources = res as unknown as ActionSource[]
      })
    }
  }
})
