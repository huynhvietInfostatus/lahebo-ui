<script lang="ts" setup>
import MainHeader from '../components/MainHeader.vue'
</script>
<template>
  <div class="flex flex-col h-screen">
    <MainHeader></MainHeader>
    <div class="flex-1 bg-base-background overflow-hidden">
      <router-view></router-view>
    </div>
  </div>
</template>
