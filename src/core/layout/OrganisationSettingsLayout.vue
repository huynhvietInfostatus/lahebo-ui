<script lang="ts" setup>
import OrganisationSettingsSideBarVue from '../components/OrganisationSettingsSideBar.vue'
</script>
<template>
  <div class="flex h-full">
    <OrganisationSettingsSideBarVue></OrganisationSettingsSideBarVue>
    <div class="flex-1 px-10 py-10 overflow-auto">
      <router-view></router-view>
    </div>
  </div>
</template>
