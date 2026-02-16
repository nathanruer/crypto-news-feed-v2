<script setup lang="ts">
import { onMounted } from 'vue'
import { useAlertsStore } from '../stores/alerts'
import AppHeader from '../components/layout/AppHeader.vue'
import ToastContainer from '../components/ui/ToastContainer.vue'

const alertsStore = useAlertsStore()

onMounted(async () => {
  try {
    await alertsStore.fetchUnreadEvents()
  }
  catch {
    // Alerts API may not be available yet
  }
})
</script>

<template>
  <div class="min-h-screen bg-bg-primary text-text-primary">
    <AppHeader />
    <main class="px-6 py-4">
      <slot />
    </main>
    <ToastContainer />
  </div>
</template>
