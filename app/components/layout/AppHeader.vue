<script setup lang="ts">
import { useNewsStore } from '../../stores/news'
import ConnectionStatus from '../domain/news/ConnectionStatus.vue'

const store = useNewsStore()
</script>

<template>
  <header class="flex items-center justify-between px-6 py-3 bg-bg-secondary border-b border-bg-tertiary">
    <div class="flex items-center gap-3">
      <h1 class="text-lg font-bold text-text-primary tracking-tight">
        CryptoFeed
      </h1>
      <span class="text-xs text-text-secondary font-mono">
        {{ store.newsCount }} news
      </span>
    </div>
    <ConnectionStatus :status="store.connectionStatus" />
  </header>
</template>
