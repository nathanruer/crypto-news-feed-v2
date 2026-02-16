<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  create: [data: { name: string, type: 'ticker' | 'source', value: string }]
}>()

const name = ref('')
const type = ref<'ticker' | 'source'>('ticker')
const value = ref('')

function handleSubmit() {
  if (!name.value.trim() || !value.value.trim()) return
  emit('create', {
    name: name.value.trim(),
    type: type.value,
    value: value.value.trim(),
  })
  name.value = ''
  value.value = ''
  type.value = 'ticker'
}
</script>

<template>
  <form
    class="flex flex-col gap-3"
    @submit.prevent="handleSubmit"
  >
    <div class="flex gap-3">
      <input
        v-model="name"
        data-testid="rule-name"
        type="text"
        placeholder="Alert name..."
        class="flex-1 bg-bg-tertiary text-text-primary text-sm rounded-lg
          px-3 py-2 placeholder-text-secondary outline-none
          focus:ring-1 focus:ring-text-accent"
      >
      <select
        v-model="type"
        data-testid="rule-type"
        class="bg-bg-tertiary text-text-primary text-sm rounded-lg
          px-3 py-2 outline-none focus:ring-1 focus:ring-text-accent
          cursor-pointer"
      >
        <option value="ticker">
          Ticker
        </option>
        <option value="source">
          Source
        </option>
      </select>
    </div>
    <div class="flex gap-3">
      <input
        v-model="value"
        data-testid="rule-value"
        type="text"
        :placeholder="type === 'ticker' ? 'e.g. BTC' : 'e.g. Binance'"
        class="flex-1 bg-bg-tertiary text-text-primary text-sm rounded-lg
          px-3 py-2 placeholder-text-secondary outline-none
          focus:ring-1 focus:ring-text-accent"
      >
      <button
        data-testid="submit-rule"
        type="submit"
        class="px-4 py-2 bg-text-accent text-white text-sm font-medium
          rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
      >
        Add rule
      </button>
    </div>
  </form>
</template>
