<script lang="ts" setup>
import { homeMenu, settingMenu } from '../models/menu.model'
import { Menu, MenuItems, MenuButton, MenuItem } from '@headlessui/vue'
import { RouteNames } from '@/core/models/app-router.model'
import { useAuthStore } from '@/store/use-auth-store'
import { storeToRefs } from 'pinia'
import Notification from './Notification.vue'
import { computed } from 'vue'
import { hasPermission, hasRole } from '../helpers/common'
import { AppPermission } from '../models/permission.model'

const authStore = useAuthStore()

const { hasPayment, avatarName } = storeToRefs(authStore)

const homeMenuWithPermission = computed(() => {
  return [...homeMenu].map((item) => ({
    ...item,
    isShow: hasPermission(item.permissions || []) && hasRole(item.roles ?? [])
  }))
})

const signout = () => authStore.logout()
</script>

<template>
  <header class="z-[100] py-4 h-24 bg-white shadow">
    <div class="flex items-center justify-between h-full px-6 mx-auto text-purple-600 dark:text-purple-300">
      <img class="h-10 w-auto" src="https://labeho-public.s3.ap-southeast-2.amazonaws.com/assets/logo.png" alt="Lahebo Logo" />
      <ul v-if="hasPayment" class="flex items-center flex-shrink-0 mx-auto">
        <li v-for="item in homeMenuWithPermission" v-show="!!item.isShow" :key="item.label">
          <router-link v-slot="{ href, navigate, isExactActive, isActive }" custom :to="{ name: item.routeName }">
            <a
              :href="href"
              class="font-medium px-6 py-2 rounded"
              :class="[
                ((isExactActive || isActive) && 'text-base-white bg-primary-500 font-semibold') || 'text-gray-800 '
              ]"
              @click="navigate"
            >
              {{ item.label }}
            </a>
          </router-link>
        </li>
      </ul>
      <ul class="ml-auto flex items-center flex-shrink-0 space-x-6">
        <template v-if="hasPayment"
          ><li>
            <Notification></Notification>
          </li>
          <!-- Profile menu -->
          <li v-if="hasPermission([AppPermission.ORGANISATION_ADMIN])">
            <Menu as="div" class="relative inline-block text-left">
              <div>
                <MenuButton
                  class="text-primary-500 hover:text-primary-700 transition-colors duration-200 focus:shadow-outline-purple focus:outline-none"
                >
                  <font-awesome-icon icon="gear" class="w-5 h-5" />
                </MenuButton>
              </div>
              <transition
                enter-active-class="transition duration-100 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0"
              >
                <MenuItems
                  class="absolute bg-base-white overflow-hidden right-0 mt-2 py-2 w-56 origin-top-right rounded-md shadow-md focus:outline-none"
                >
                  <MenuItem
                    v-for="item in settingMenu"
                    v-show="hasPermission(item.permissions ?? [])"
                    :key="item.label"
                    v-slot="{ active }"
                  >
                    <router-link
                      :to="{ name: item.routeName }"
                      :class="[
                        active ? 'bg-primary-500 text-base-white' : 'text-gray-700',
                        'group flex w-full items-center px-4 py-3'
                      ]"
                    >
                      {{ item.label }}
                    </router-link>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </li></template
        >

        <li>
          <Menu as="div" class="relative inline-block text-left">
            <div>
              <MenuButton
                class="text-primary-500 hover:text-primary-700 transition-colors duration-200 focus:shadow-outline-purple focus:outline-none"
              >
                <div
                  class="text-base-white w-9 h-9 flex-shrink-0 uppercase flex items-center justify-center font-semibold tracking-widest bg-primary-500 rounded-full"
                >
                  {{ avatarName }}
                </div>
              </MenuButton>
            </div>
            <transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <MenuItems
                class="absolute bg-base-white overflow-hidden right-0 mt-2 py-2 w-56 origin-top-right rounded-md shadow-md focus:outline-none"
              >
                <MenuItem v-slot="{ active }">
                  <router-link
                    :class="[
                      active ? '!bg-primary-500 !text-base-white' : 'text-gray-700',
                      'group flex w-full items-center px-4 py-3'
                    ]"
                    :to="{ name: RouteNames.USER_PROFILE }"
                  >
                    <font-awesome-icon icon="user" class="mr-4"></font-awesome-icon>
                    Profile
                  </router-link>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <button
                    :class="[
                      active ? '!bg-primary-500 !text-base-white' : 'text-gray-700',
                      'group flex w-full items-center px-4 py-3'
                    ]"
                    @click="signout"
                  >
                    <font-awesome-icon icon="right-from-bracket" class="mr-4"></font-awesome-icon>
                    Sign out
                  </button>
                </MenuItem>
              </MenuItems>
            </transition>
          </Menu>
        </li>
      </ul>
    </div>
  </header>
</template>
