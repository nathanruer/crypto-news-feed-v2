import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AlertRule, AlertEvent } from '../../shared/types/alert'

const SOUND_KEY = 'cryptofeed:alert-sound'

export const useAlertsStore = defineStore('alerts', () => {
  const rules = ref<AlertRule[]>([])
  const unreadEvents = ref<AlertEvent[]>([])
  const soundEnabled = ref(loadSoundPref())

  // --- Getters ---
  const unreadCount = computed(() => unreadEvents.value.length)

  // --- Actions ---
  async function fetchRules() {
    const res = await $fetch<{ data: AlertRule[] }>('/api/alerts')
    rules.value = res.data
  }

  async function createRule(data: { name: string, type: 'ticker' | 'source', value: string }) {
    const res = await $fetch<{ data: AlertRule }>('/api/alerts', { method: 'POST', body: data })
    rules.value.push(res.data)
  }

  async function updateRule(id: string, data: Partial<Pick<AlertRule, 'name' | 'type' | 'value' | 'enabled'>>) {
    const res = await $fetch<{ data: AlertRule }>(`/api/alerts/${id}`, { method: 'PATCH', body: data })
    const idx = rules.value.findIndex(r => r.id === id)
    if (idx !== -1) rules.value[idx] = res.data
  }

  async function deleteRule(id: string) {
    await $fetch(`/api/alerts/${id}`, { method: 'DELETE' })
    rules.value = rules.value.filter(r => r.id !== id)
  }

  async function fetchUnreadEvents() {
    const res = await $fetch<{ data: AlertEvent[] }>('/api/alerts/events')
    unreadEvents.value = res.data
  }

  async function markAsRead() {
    await $fetch('/api/alerts/events/read', { method: 'POST' })
    unreadEvents.value = []
  }

  function addAlertEvent(event: AlertEvent) {
    unreadEvents.value.push(event)
  }

  function toggleSound() {
    soundEnabled.value = !soundEnabled.value
    try {
      localStorage.setItem(SOUND_KEY, String(soundEnabled.value))
    }
    catch {
      // localStorage unavailable (SSR)
    }
  }

  return {
    rules, unreadEvents, soundEnabled,
    unreadCount,
    fetchRules, createRule, updateRule, deleteRule,
    fetchUnreadEvents, markAsRead, addAlertEvent, toggleSound,
  }
})

function loadSoundPref(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) === 'true'
  }
  catch {
    return false
  }
}
