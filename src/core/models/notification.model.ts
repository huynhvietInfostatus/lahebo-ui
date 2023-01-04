import { OrgUser } from './user.model'

export interface AppNotification {
  notId: string
  title: string
  content: string
  fromUsrId: string
  toUsrId: string
  metadata: NotificationMeta
  status: string
  createdAt: string
  updatedAt: string
  fromUser: OrgUser
  toUser: OrgUser
}

export interface NotificationMeta {
  module_name: string
}
