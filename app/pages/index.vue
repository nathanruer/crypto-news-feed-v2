<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useNewsStore } from '../stores/news'
import { useNewsFeed } from '../composables/useNewsFeed'
import NewsList from '../components/domain/news/NewsList.vue'
import NewsFilter from '../components/domain/news/NewsFilter.vue'

useHead({ title: 'CryptoFeed — Dashboard' })

const store = useNewsStore()
const { connect, disconnect } = useNewsFeed()

async function loadMore() {
  await store.fetchNews(store.currentPage + 1)
}

onMounted(async () => {
  await store.fetchNews(1)
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
      :has-more="store.hasMore"
      :is-loading="store.isLoadingNews"
      class="flex-1 min-h-0"
      @load-more="loadMore"
    />
  </div>
</template>
