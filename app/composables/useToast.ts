import { ref } from 'vue'

export interface Toast {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'alert'
}

const toasts = ref<Toast[]>([])
const AUTO_DISMISS_MS = 5_000

export function useToast() {
  function addToast(message: string, type: Toast['type'] = 'info') {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    toasts.value.push({ id, message, type })
    setTimeout(() => removeToast(id), AUTO_DISMISS_MS)
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, addToast, removeToast }
}
