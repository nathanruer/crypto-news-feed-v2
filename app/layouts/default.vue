<script setup lang="ts">
import AppHeader from '../components/layout/AppHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-bg-primary text-text-primary">
    <AppHeader />
    <main class="px-6 py-4">
      <slot />
    </main>
  </div>
</template>
