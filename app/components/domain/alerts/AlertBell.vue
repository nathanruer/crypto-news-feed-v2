<script setup lang="ts">
import { ref } from 'vue'
import { useAlertsStore } from '../../../stores/alerts'
import { formatRelativeTime } from '../../../utils/format-relative-time'

const store = useAlertsStore()
const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

async function handleMarkAsRead() {
  await store.markAsRead()
  close()
}
</script>

<template>
  <div class="relative">
    <button
      data-testid="alert-bell"
      class="relative p-1.5 text-text-secondary hover:text-text-accent transition-colors cursor-pointer"
      @click="toggle"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002
            6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388
            6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3
            0 11-6 0v-1m6 0H9"
        />
      </svg>
      <span
        v-if="store.unreadCount > 0"
        data-testid="bell-badge"
        class="absolute -top-0.5 -right-0.5 min-w-4 h-4 flex items-center
          justify-center rounded-full bg-bearish text-white text-[10px] font-bold px-1"
      >
        {{ store.unreadCount > 99 ? '99+' : store.unreadCount }}
      </span>
    </button>

    <div
      v-if="isOpen"
      data-testid="alert-dropdown"
      class="absolute right-0 top-full mt-2 w-80 bg-bg-secondary border
        border-bg-tertiary rounded-lg shadow-xl z-50 overflow-hidden"
    >
      <div class="flex items-center justify-between px-4 py-2.5 border-b border-bg-tertiary">
        <span class="text-sm font-medium text-text-primary">Alerts</span>
        <button
          v-if="store.unreadCount > 0"
          data-testid="mark-read"
          class="text-xs text-text-secondary hover:text-text-accent cursor-pointer transition-colors"
          @click="handleMarkAsRead"
        >
          Mark all read
        </button>
      </div>

      <div class="max-h-64 overflow-y-auto">
        <template v-if="store.unreadEvents.length > 0">
          <div
            v-for="event in store.unreadEvents"
            :key="event.id"
            class="px-4 py-2.5 border-b border-bg-tertiary last:border-0 hover:bg-bg-tertiary/50"
          >
            <p class="text-xs font-medium text-text-accent">
              {{ event.ruleName }}
            </p>
            <p class="text-sm text-text-primary truncate mt-0.5">
              {{ event.newsTitle }}
            </p>
            <p class="text-[10px] text-text-secondary mt-0.5">
              {{ formatRelativeTime(new Date(event.triggeredAt)) }}
            </p>
          </div>
        </template>
        <div
          v-else
          class="px-4 py-6 text-center text-text-secondary text-sm"
        >
          No new alerts
        </div>
      </div>
    </div>

    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="close"
    />
  </div>
</template>
