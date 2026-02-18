<script setup lang="ts">
import { useNewsStore } from '../../stores/news'
import ConnectionStatus from '../domain/news/ConnectionStatus.vue'
import AlertBell from '../domain/alerts/AlertBell.vue'

const newsStore = useNewsStore()
</script>

<template>
  <header class="flex items-center justify-between px-4 sm:px-6 py-3 bg-bg-secondary border-b border-bg-tertiary">
    <div class="flex items-center gap-3 sm:gap-4">
      <NuxtLink
        to="/"
        class="text-lg font-bold text-text-primary tracking-tight hover:text-text-accent transition-colors"
      >
        CryptoFeed
      </NuxtLink>
      <span class="hidden sm:inline text-xs text-text-secondary font-mono">
        {{
          newsStore.hasActiveFilters
            ? `${newsStore.filteredCount}/${newsStore.newsCount}`
            : newsStore.newsCount
        }} news
      </span>
      <NuxtLink
        to="/alerts"
        class="hidden sm:inline text-sm text-text-secondary hover:text-text-accent transition-colors"
      >
        Alerts
      </NuxtLink>
    </div>
    <div class="flex items-center gap-2 sm:gap-3">
      <AlertBell />
      <ConnectionStatus :status="newsStore.connectionStatus" />
    </div>
  </header>
</template>
