<script setup lang="ts">
import type { Toast } from '../../composables/useToast'

defineProps<{
  toast: Toast
}>()

defineEmits<{
  dismiss: [id: string]
}>()

const colorMap: Record<Toast['type'], string> = {
  info: 'border-info',
  success: 'border-bullish',
  warning: 'border-warning',
  alert: 'border-bearish',
}
</script>

<template>
  <div
    data-testid="toast-item"
    :class="[
      'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4',
      'bg-bg-secondary text-text-primary text-sm max-w-sm',
      'animate-slide-in',
      colorMap[toast.type],
    ]"
  >
    <span class="flex-1">{{ toast.message }}</span>
    <button
      data-testid="toast-dismiss"
      class="text-text-secondary hover:text-text-primary text-xs cursor-pointer"
      @click="$emit('dismiss', toast.id)"
    >
      &times;
    </button>
  </div>
</template>
