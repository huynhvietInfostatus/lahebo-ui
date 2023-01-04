<script lang="ts" setup>
import { useAuthStore } from '@/store/use-auth-store'
import { storeToRefs } from 'pinia'
import { RoleNames } from '@/core/models/role.model'
import PageHeader from '@/core/components/PageHeader.vue'
import { computed } from 'vue'

const authStore = useAuthStore()
const { me, userRole, avatarName } = storeToRefs(authStore)
const departmentString = computed(() => (me.value?.departments ?? []).map((d) => d.name).join(', '))
const locationString = computed(() => (me.value?.locations ?? []).map((d) => d.name).join(', '))
</script>

<template>
  <div class="h-full overflow-auto">
    <div class="container max-w-6xl px-4 sm:px-8 lg:px-16 xl:px-20 mx-auto pt-10 pb-6">
      <div class="flex space-x-20">
        <div class="mt-10">
          <div
            class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-base-white uppercase tracking-widest"
          >
            {{ avatarName }}
          </div>
          <div class="text-xl font-bold mt-4">{{ me?.firstName }} {{ me?.lastName }}</div>
          <div class="mt-1 text-gray-500">{{ RoleNames[userRole?.name ?? ''] }}</div>
        </div>
        <div class="flex-1">
          <PageHeader title="Account Detail"></PageHeader>
          <div class="bg-base-white rounded-lg p-10">
            <div class="space-y-8">
              <div>
                <div class="uppercase font- text-gray-500 mb-6">General Information</div>
                <div class="space-y-4">
                  <div class="flex items-baseline">
                    <span class="min-w-[140px]">First Name:</span>
                    <span class="font-bold">{{ me?.firstName }}</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="min-w-[140px]">Last Name:</span>
                    <span class="font-bold">{{ me?.lastName }}</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="min-w-[140px]">Phone number:</span>
                    <span class="font-bold">{{ me?.phoneNumber }}</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="min-w-[140px]">Email:</span>
                    <span class="font-bold">{{ me?.email }}</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="min-w-[140px]">Username:</span>
                    <span class="font-bold">{{ me?.username }}</span>
                  </div>
                </div>
              </div>
              <div>
                <div class="uppercase font- text-gray-500 mb-6">Organisation</div>
                <div class="space-y-4">
                  <div class="flex items-baseline">
                    <span class="min-w-[140px]">Role:</span>
                    <span class="font-bold">{{ RoleNames[userRole?.name ?? ''] }}</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="min-w-[140px]">Departments:</span>
                    <span class="font-bold">{{ departmentString }}</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="min-w-[140px]">Locations:</span>
                    <span class="font-bold">{{ locationString }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
