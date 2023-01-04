<script lang="ts" setup>
import { useNotificationStore } from '@/store/use-notification-store'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { formatDateTime } from '../helpers/common'
import { AppNotification } from '@/core/models/notification.model'
import router from '@/router'
import { RouteNames } from '../models/app-router.model'
import { Switch } from '@headlessui/vue'
import UserAvatar from './UserAvatar.vue'

const notiStore = useNotificationStore()
const { count, notifications } = storeToRefs(notiStore)
const menu = ref(null)

const displayedCount = computed(() => {
  if (count.value < 100) return count
  return count.value + '+'
})

const fetchNoti = () => {
  notiStore.getNotifications()
}

onMounted(() => {
  fetchNoti()
})

const onNavigate = (item: AppNotification) => {
  if (item.status === 'UNREAD') {
    notiStore.markNotificationsAsRead([item.notId])
  }
  const module = item.metadata.module_name
  if (module === 'RISK') router.push({ name: RouteNames.RISK_MANAGEMENT })
  else if (module === 'ACTION') router.push({ name: RouteNames.ACTION_MANAGEMENT })
}

const unread = ref(false)

const filteredNotifications = computed(() => {
  return notifications.value.filter((n) => {
    return unread.value ? n.status === 'UNREAD' : true
  })
})

const toNotificationPage = () => {
  if (menu.value) {
    ;(menu.value as unknown as any).el.click()
  }
  router.push({ name: RouteNames.NOTIFICATION })
}

const markAllAsRead = () => {
  notiStore.markAllAsRead()
}
</script>
<template>
  <Menu as="div" class="inline-block text-left">
    <MenuButton ref="menu">
      <span class="relative inline-block px-2 py-1">
        <font-awesome-icon icon="bell" class="cursor-pointer text-primary-500 hover:text-primary-700 w-5 h-5" />
        <div
          v-if="count > 0"
          class="absolute px-1.5 py-.5 origin-bottom-left rounded-full border-2 border-base-white bg-red-500 bottom-5 left-4 text-base-white text-sm font-bold"
        >
          {{ displayedCount }}
        </div>
      </span>
    </MenuButton>
    <MenuItems
      style="max-height: calc(100vh - 90px)"
      class="fixed flex flex-col right-2 bg-base-white overflow-hidden w-[420px] top-[100px] rounded-md shadow-md focus:outline-none"
    >
      <div class="w-full px-4 py-4 flex items-center justify-between border-b border-gray-100">
        <div class="text-xl font-medium">Notifications</div>
        <div class="flex items-center">
          <span class="mr-2">Unread Only</span>
          <Switch
            v-model="unread"
            :class="!unread ? 'bg-gray-300' : 'bg-primary-500'"
            class="relative inline-flex h-6 w-11 items-center rounded-full"
          >
            <span class="sr-only">Enable notifications</span>
            <span
              :class="unread ? 'translate-x-6' : 'translate-x-1'"
              class="inline-block h-4 w-4 transform rounded-full bg-base-white"
            />
          </Switch>
          <font-awesome-icon
            v-tooltip="'Open In A New Tab'"
            class="cursor-pointer ml-2 w-5 h-5 inline-block text-gray-500 hover:text-gray-700"
            icon="arrow-up-right-from-square"
            @click="toNotificationPage"
          />
        </div>
      </div>
      <div v-if="filteredNotifications.length" class="w-full px-4 py-4 flex items-center justify-between">
        <div class="text-gray-600 uppercase">Today</div>
        <button
          v-if="count > 0"
          class="text-primary-500 hover:text-primary-700 cursor-pointer transition-all duration-200"
          @click="markAllAsRead"
        >
          Mark all as read
        </button>
      </div>
      <div class="flex-1 overflow-auto">
        <template v-if="filteredNotifications.length">
          <MenuItem v-for="item in filteredNotifications" :key="item.notId">
            <div
              class="w-full px-4 py-4 flex cursor-pointer hover:bg-gray-100 items-start space-x-4"
              @click="onNavigate(item)"
            >
              <UserAvatar :user="item.fromUser" />
              <div class="flex-1 space-y-1">
                <div class="flex space-x-2">
                  <span class="font-bold flex-1">{{ item.title }}</span>
                  <span class="text-sm text-gray-600 ml-4">{{ formatDateTime(item.createdAt) }}</span>
                </div>
                <p style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden">
                  {{ item.content }}
                </p>
              </div>
              <span :class="{ 'opacity-0': item.status === 'READ' }" class="w-2 h-2 rounded-full bg-primary-500"></span>
            </div>
          </MenuItem>
        </template>
        <div v-else class="px-4 py-4 h-32 flex items-center justify-center text-gray-500">
          {{ unread ? "You've read all your notifications from the last 30 days." : 'No Notifications' }}
        </div>
      </div>
    </MenuItems>
  </Menu>
</template>
