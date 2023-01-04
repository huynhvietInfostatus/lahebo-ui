import { apiUrl } from './../configs/api-config'
import axios from 'axios'
// import { iot, mqtt } from 'aws-iot-device-sdk-v2'
// import { AppCredential } from '../models/common.model'

export function getCredentials() {
  return axios.get(`${apiUrl}/auth/credentials`)
}

export function getNotification() {
  return axios.get(`${apiUrl}/notifications`)
}
export function updateNotifications(ids: string[]) {
  return axios.patch(`${apiUrl}/notifications/mark-as-read`, ids)
}
export function markAllAsRead() {
  return axios.post(`${apiUrl}/notifications/mark-all-as-read`)
}

// export function initSocket(cred: AppCredential) {
//   const config = iot.AwsIotMqttConnectionConfigBuilder.new_websocket_builder().with_credentials(
//     'ap-southeast-2',
//     cred.AccessKeyId,
//     cred.SecretKey
//   )
// }
