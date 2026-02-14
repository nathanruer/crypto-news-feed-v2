import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { NewsItem } from '../../shared/types/news'
import type { ConnectionStatus } from '../../shared/types/ws'

const MAX_ITEMS = 50

export const useNewsStore = defineStore('news', () => {
  const items = ref<NewsItem[]>([])
  const connectionStatus = ref<ConnectionStatus>('disconnected')

  const newsCount = computed(() => items.value.length)
  const isConnected = computed(() => connectionStatus.value === 'connected')

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

  return { items, connectionStatus, newsCount, isConnected, addNews, setConnectionStatus }
})
