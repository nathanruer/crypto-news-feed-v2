<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useNewsStore } from '../stores/news'
import { useNewsFeed } from '../composables/useNewsFeed'
import NewsList from '../components/domain/news/NewsList.vue'
import NewsFilter from '../components/domain/news/NewsFilter.vue'

useHead({ title: 'CryptoFeed — Dashboard' })

const store = useNewsStore()
const { connect, disconnect } = useNewsFeed()

onMounted(() => {
  connect()
})

onUnmounted(() => {
  disconnect()
})
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-3.25rem)]">
    <NewsFilter
      :sources="store.availableSources"
      :tickers="store.availableTickers"
      :selected-sources="store.selectedSources"
      :selected-tickers="store.selectedTickers"
      :search-query="store.searchQuery"
      @toggle-source="store.toggleSource"
      @toggle-ticker="store.toggleTicker"
      @update:search-query="store.setSearchQuery"
      @clear-filters="store.clearFilters"
    />
    <NewsList
      :items="store.filteredItems"
      :has-active-filters="store.hasActiveFilters"
      class="flex-1 min-h-0"
    />
  </div>
</template>
