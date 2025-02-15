<template>
  <main-layout>
    <router-view />
  </main-layout>
</template>

<script setup lang="ts">
import MainLayout from "./layouts/MainLayout.vue";
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
