<script lang="ts" setup>
import { legisMenu } from '@/core/models/menu.model'
</script>

<template>
  <div class="container-xl h-full px-4 sm:px-8 lg:px-16 xl:px-20 mx-auto pt-5 pb-6 flex flex-col">
    <slot name="header" />
    <div class="flex-1 flex flex-col bg-base-white rounded-lg shadow-md relative min-h-[200px]">
      <ul class="flex items-center divide-x divide-gray-300 px-3 py-8">
        <li v-for="item in legisMenu" :key="item.routeName">
          <router-link v-slot="{ href, navigate, isActive }" custom :to="{ name: item.routeName }">
            <a
              :class="[isActive && ' !text-primary-500 font-semibold']"
              :href="href"
              class="font-medium text-primary-300 px-3"
              @click="navigate"
            >
              {{ item.label }}
            </a>
          </router-link>
        </li>
      </ul>
      <slot />
    </div>
  </div>
</template>
