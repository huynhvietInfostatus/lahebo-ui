import { AppCredential, PaginatedResponse, Status } from '@/core/models/common.model'
import {
  getCredentials,
  getNotification,
  markAllAsRead,
  updateNotifications
} from '@/core/services/notification.service'
import { defineStore } from 'pinia'
import { AppNotification } from './../core/models/notification.model'
export interface NotificationState {
  count: number
  notifications: AppNotification[]
  status: Status
}

export const useNotificationStore = defineStore('notificationStore', {
  state: () =>
    ({
      count: 0,
      notifications: [],
      status: 'idle'
    } as NotificationState),
  actions: {
    async initNotification() {
      const credentials = (await getCredentials()) as unknown as AppCredential
    },
    getNotifications() {
      this.status = 'loading'
      return getNotification()
        .then((res) => {
          const paginatedResponse = res as unknown as PaginatedResponse<AppNotification>
          this.count = paginatedResponse.totalUnread
          this.notifications = paginatedResponse.records
          this.status = 'idle'
        })
        .catch((e) => {
          this.status = 'error'
          throw e
        })
    },
    markNotificationsAsRead(ids: string[]) {
      return updateNotifications(ids).then(() => {
        this.count = this.count - ids.length
        this.notifications = this.notifications.map((n) => {
          if (ids.includes(n.notId)) return { ...n, status: 'READ' }
          return n
        })
      })
    },
    markAllAsRead() {
      return markAllAsRead().then(() => {
        this.count = 0
        this.notifications = this.notifications.map((n) => {
          return { ...n, status: 'READ' }
        })
      })
    }
  }
})
