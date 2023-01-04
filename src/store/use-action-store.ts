import {
  Action,
  ActionSource,
  AddActionPayload,
  Attachment,
  UpdateActionPayload,
  UpdateActionStatus
} from '@/core/models/action.model'
import { PaginatedResponse, Status } from '@/core/models/common.model'
import { QueryParams } from '@/core/models/query-param.model'
import {
  addAction,
  deleteAction,
  downloadAttachment,
  getActions,
  updateAction,
  updateActionStatus,
  uploadAttachment
} from '@/core/services/action.service'
import { defineStore } from 'pinia'

export interface ActionState {
  status: Status
  actions: Action[]
  total: number
  attachments: Attachment[]
  uploading: Status
  actionSources: ActionSource[]
}

export const useActionStore = defineStore('actionStore', {
  state: () =>
    ({ status: 'idle', actions: [], total: 0, attachments: [], uploading: 'idle', actionSources: [] } as ActionState),
  actions: {
    getActions(params: QueryParams = {}) {
      this.status = 'loading'
      return getActions(params)
        .then((res) => {
          this.status = 'idle'
          const result = res as unknown as PaginatedResponse<Action>
          this.actions = result.records
          this.total = result.total
          return res
        })
        .catch((e) => {
          this.status = 'error'
          throw e
        })
    },
    addAction(payload: AddActionPayload) {
      return addAction(payload)
        .then((res) => {
          return res
        })
        .catch((e) => {
          throw e
        })
    },
    updateAction(id: string, payload: UpdateActionPayload) {
      return updateAction(id, payload)
        .then((res) => {
          return res
        })
        .catch((e) => {
          throw e
        })
    },
    updateActionStatus(id: string, payload: UpdateActionStatus) {
      return updateActionStatus(id, payload)
        .then((res) => {
          return res
        })
        .catch((e) => {
          throw e
        })
    },
    deleteAction(id: string) {
      return deleteAction(id)
        .then((res) => {
          return res
        })
        .catch((e) => {
          throw e
        })
    },
    uploadAttachments(payload: FileList) {
      this.uploading = 'loading'
      return uploadAttachment(payload)
        .then((res) => {
          this.attachments = [...(res as unknown as Attachment[]), ...this.attachments]
          this.uploading = 'idle'
        })
        .catch((e) => {
          this.uploading = 'error'
          throw e
        })
    },
    downloadAttachment(id: string, name: string) {
      return downloadAttachment(id, name)
    },
    deleteAttachment(index: number) {
      this.attachments.splice(index, 1)
    }
  }
})
