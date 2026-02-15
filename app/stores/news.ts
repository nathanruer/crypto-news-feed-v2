import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { NewsItem } from '../../shared/types/news'
import type { ConnectionStatus } from '../../shared/types/ws'

const MAX_ITEMS = 50

export const useNewsStore = defineStore('news', () => {
  const items = ref<NewsItem[]>([])
  const connectionStatus = ref<ConnectionStatus>('disconnected')
  const selectedSources = ref<Set<string>>(new Set())
  const selectedTickers = ref<Set<string>>(new Set())

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
    if (sources.size === 0 && tickers.size === 0) return items.value
    return items.value.filter((item) => {
      const matchesSource = sources.size === 0 || sources.has(item.source)
      const matchesTicker = tickers.size === 0 || item.tickers.some(t => tickers.has(t))
      return matchesSource && matchesTicker
    })
  })

  const hasActiveFilters = computed(() =>
    selectedSources.value.size > 0 || selectedTickers.value.size > 0,
  )

  const filteredCount = computed(() => filteredItems.value.length)

  // --- Actions ---
  function addNews(item: NewsItem) {
    if (items.value.some(existing => existing.id === item.id)) return
    items.value.unshift(item)
    if (items.value.length > MAX_ITEMS) {
      items.value = items.value.slice(0, MAX_ITEMS)
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

  function clearFilters() {
    selectedSources.value = new Set()
    selectedTickers.value = new Set()
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
    items, connectionStatus, selectedSources, selectedTickers,
    newsCount, isConnected, availableSources, availableTickers,
    filteredItems, hasActiveFilters, filteredCount,
    addNews, setConnectionStatus, toggleSource, toggleTicker, clearFilters,
  }
})
