<script lang="ts" setup>
import { AppMenuItem, organisationSettingsMenu } from '@/core/models/menu.model'
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const isItemExpanded = (item: AppMenuItem) => {
  if (!item.children) {
    return false
  }
  return !!item.children.find((child) => isRouteActive(child))
}

const menu = ref([...organisationSettingsMenu])

const router = useRouter()
const toggleExpandMenu = (index: number) => {
  menu.value[index].isExpanded = !menu.value[index].isExpanded
}
const isRouteActive = (item: AppMenuItem) => {
  return item.routeName === router.currentRoute.value.name || router.currentRoute.value.path.includes(item.path || '')
}

watch(
  () => router.currentRoute.value,
  () => {
    menu.value.forEach((m) => {
      m.isExpanded = isItemExpanded(m)
    })
  }
)

onMounted(() => {
  menu.value.forEach((m) => {
    m.isExpanded = isItemExpanded(m)
  })
})
</script>
<template>
  <aside class="w-64" aria-label="Sidebar">
    <div class="overflow-y-auto h-full bg-base-white">
      <div class="text-lg font-semibold text-primary-500 pl-8 py-6 border-b border-b-gray-100">
        Organisation Settings
      </div>
      <ul class="mt-6">
        <li v-for="(item, index) in menu" :key="item.label">
          <router-link v-if="!item.children?.length" :to="{ name: item.routeName }">
            {{ item.label }}

            <div class="active-border hidden absolute top-0 left-0 bottom-0 w-1 bg-primary-500"></div>
          </router-link>
          <a v-else class="org-menu-item" @click="toggleExpandMenu(index)">
            <span>{{ item.label }}</span>
            <font-awesome-icon v-if="!!item.isExpanded" icon="angle-down"></font-awesome-icon>
            <font-awesome-icon v-else icon="angle-right"></font-awesome-icon>
          </a>
          <ul v-if="item.isExpanded">
            <li v-for="child in item.children" :key="child.routeName">
              <router-link class="org-menu-item sub-item" :to="{ name: child.routeName }"
                >{{ child.label }}

                <div class="active-border hidden absolute top-0 left-0 bottom-0 w-1 bg-primary-500"></div>
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </aside>
</template>
