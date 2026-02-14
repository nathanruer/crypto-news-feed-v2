<script setup lang="ts">
import type { ConnectionStatus } from '../../../../shared/types/ws'

defineProps<{ status: ConnectionStatus }>()

const statusConfig = {
  connected: { color: 'bg-bullish', label: 'Connected' },
  reconnecting: { color: 'bg-warning', label: 'Reconnecting...' },
  disconnected: { color: 'bg-bearish', label: 'Disconnected' },
} as const
</script>

<template>
  <div class="flex items-center gap-2">
    <span
      :class="[
        'w-2 h-2 rounded-full',
        statusConfig[status].color,
        status === 'reconnecting' ? 'animate-pulse' : '',
      ]"
    />
    <span class="text-xs text-text-secondary">
      {{ statusConfig[status].label }}
    </span>
  </div>
</template>
