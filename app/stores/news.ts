import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { NewsItem, SerializedNewsItem } from '../../shared/types/news'
import type { ConnectionStatus } from '../../shared/types/ws'
import { deserializeNewsItem } from '../utils/deserialize-news-item'

export const useNewsStore = defineStore('news', () => {
  const items = ref<NewsItem[]>([])
  const connectionStatus = ref<ConnectionStatus>('disconnected')
  const selectedSources = ref<Set<string>>(new Set())
  const selectedTickers = ref<Set<string>>(new Set())
  const searchQuery = ref('')
  const currentPage = ref(0)
  const hasMore = ref(true)
  const isLoadingNews = ref(false)

  // --- Getters ---
  const newsCount = computed(() => items.value.length)
  const isConnected = computed(() => connectionStatus.value === 'connected')

  const availableSources = computed(() =>
    [...new Set(items.value.map(i => i.source))].sort(),
  )

  const availableTickers = computed(() =>
    [...new Set(items.value.flatMap(i => i.tickers))].sort(),
  )

  const filteredItems = computed(() => {
    const sources = selectedSources.value
    const tickers = selectedTickers.value
    const query = searchQuery.value.toLowerCase()
    const hasFilters = sources.size > 0 || tickers.size > 0 || query.length > 0
    if (!hasFilters) return items.value
    return items.value.filter((item) => {
      const matchesSource = sources.size === 0 || sources.has(item.source)
      const matchesTicker = tickers.size === 0 || item.tickers.some(t => tickers.has(t))
      const matchesSearch = query.length === 0
        || item.title.toLowerCase().includes(query)
        || item.body.toLowerCase().includes(query)
      return matchesSource && matchesTicker && matchesSearch
    })
  })

  const hasActiveFilters = computed(() =>
    selectedSources.value.size > 0 || selectedTickers.value.size > 0 || searchQuery.value.length > 0,
  )

  const filteredCount = computed(() => filteredItems.value.length)

  // --- Actions ---
  function addNews(item: NewsItem) {
    if (items.value.some(existing => existing.id === item.id)) return
    items.value.unshift(item)
  }

  async function fetchNews(page: number = 1) {
    if (isLoadingNews.value) return
    isLoadingNews.value = true
    try {
      const res = await $fetch<{
        data: SerializedNewsItem[]
        meta: { total: number, page: number, pageSize: number }
      }>('/api/news', { params: { page, pageSize: 50 } })

      const deserialized = res.data.map(deserializeNewsItem)
      const existingIds = new Set(items.value.map(i => i.id))
      const unique = deserialized.filter(i => !existingIds.has(i.id))
      items.value.push(...unique)

      currentPage.value = res.meta.page
      hasMore.value = res.meta.page * res.meta.pageSize < res.meta.total
    }
    finally {
      isLoadingNews.value = false
    }
  }

  function setConnectionStatus(status: ConnectionStatus) {
    connectionStatus.value = status
  }

  function toggleSource(source: string) {
    const next = new Set(selectedSources.value)
    if (next.has(source)) next.delete(source)
    else next.add(source)
    selectedSources.value = next
  }

  function toggleTicker(ticker: string) {
    const next = new Set(selectedTickers.value)
    if (next.has(ticker)) next.delete(ticker)
    else next.add(ticker)
    selectedTickers.value = next
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function clearFilters() {
    selectedSources.value = new Set()
    selectedTickers.value = new Set()
    searchQuery.value = ''
  }

  // Prune orphaned selections
  watch(availableSources, (sources) => {
    const pruned = new Set([...selectedSources.value].filter(s => sources.includes(s)))
    if (pruned.size !== selectedSources.value.size) selectedSources.value = pruned
  })

  watch(availableTickers, (tickers) => {
    const pruned = new Set([...selectedTickers.value].filter(t => tickers.includes(t)))
    if (pruned.size !== selectedTickers.value.size) selectedTickers.value = pruned
  })

  return {
    items, connectionStatus, selectedSources, selectedTickers, searchQuery,
    currentPage, hasMore, isLoadingNews,
    newsCount, isConnected, availableSources, availableTickers,
    filteredItems, hasActiveFilters, filteredCount,
    addNews, fetchNews, setConnectionStatus,
    toggleSource, toggleTicker, setSearchQuery, clearFilters,
  }
})
