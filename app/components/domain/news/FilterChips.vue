<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
  sources: string[]
  tickers: string[]
  selectedSources: Set<string>
  selectedTickers: Set<string>
  searchQuery: string
}>()

const emit = defineEmits<{
  'toggle-source': [source: string]
  'toggle-ticker': [ticker: string]
  'clear-filters': []
}>()

function isSelected(set: Set<string>, value: string): boolean {
  return set.has(value)
}
</script>

<template>
  <div
    v-if="sources.length > 0"
    data-testid="sources-row"
    class="flex items-center gap-2 flex-wrap"
  >
    <span class="text-xs text-text-secondary uppercase tracking-wide w-16 shrink-0">
      Sources
    </span>
    <button
      v-for="source in sources"
      :key="source"
      data-testid="source-chip"
      :class="[
        'px-2.5 py-0.5 text-xs font-medium rounded-full cursor-pointer transition-colors',
        isSelected(selectedSources, source)
          ? 'bg-text-accent/20 text-text-accent border border-text-accent/40'
          : 'bg-bg-tertiary text-text-secondary hover:text-text-primary',
      ]"
      @click="emit('toggle-source', source)"
    >
      {{ source }}
    </button>
  </div>

  <div
    v-if="tickers.length > 0"
    data-testid="tickers-row"
    class="flex items-center gap-2 flex-wrap"
  >
    <span class="text-xs text-text-secondary uppercase tracking-wide w-16 shrink-0">
      Tickers
    </span>
    <button
      v-for="ticker in tickers"
      :key="ticker"
      data-testid="ticker-chip"
      :class="[
        'px-2.5 py-0.5 text-xs font-mono font-medium rounded-full cursor-pointer transition-colors',
        isSelected(selectedTickers, ticker)
          ? 'bg-text-accent/20 text-text-accent border border-text-accent/40'
          : 'bg-bg-tertiary text-text-secondary hover:text-text-primary',
      ]"
      @click="emit('toggle-ticker', ticker)"
    >
      {{ ticker }}
    </button>
  </div>

  <div
    v-if="selectedSources.size > 0 || selectedTickers.size > 0 || searchQuery.length > 0"
    class="flex justify-end"
  >
    <button
      data-testid="clear-filters"
      class="text-xs text-text-secondary hover:text-text-accent transition-colors cursor-pointer"
      @click="emit('clear-filters')"
    >
      Clear filters
    </button>
  </div>
</template>
