<script setup lang="ts">
import { useToast } from '../../composables/useToast'
import ToastItem from './ToastItem.vue'

const { toasts, removeToast } = useToast()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="toasts.length > 0"
      data-testid="toast-container"
      class="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      <TransitionGroup name="toast">
        <ToastItem
          v-for="toast in toasts"
          :key="toast.id"
          :toast="toast"
          @dismiss="removeToast"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active {
  animation: slide-in 0.3s ease-out;
}
.toast-leave-active {
  animation: slide-out 0.2s ease-in forwards;
}
@keyframes slide-in {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes slide-out {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}
</style>
