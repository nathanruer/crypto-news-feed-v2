<script setup lang="ts">
import { ref, computed } from 'vue'
import FilterChips from './FilterChips.vue'

const props = defineProps<{
  sources: string[]
  tickers: string[]
  selectedSources: Set<string>
  selectedTickers: Set<string>
  searchQuery: string
}>()

const emit = defineEmits<{
  'toggle-source': [source: string]
  'toggle-ticker': [ticker: string]
  'update:searchQuery': [query: string]
  'clear-filters': []
}>()

const isFilterOpen = ref(false)

const activeFilterCount = computed(
  () => props.selectedSources.size + props.selectedTickers.size,
)
</script>

<template>
  <div class="bg-bg-secondary border-b border-bg-tertiary px-4 sm:px-6 py-3 space-y-2">
    <input
      data-testid="search-input"
      type="text"
      placeholder="Search news..."
      :value="searchQuery"
      class="w-full bg-bg-tertiary text-text-primary text-sm rounded-lg
        px-3 py-1.5 placeholder-text-secondary outline-none
        focus:ring-1 focus:ring-text-accent"
      @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
    >

    <!-- Mobile toggle button -->
    <button
      data-testid="filter-toggle"
      class="sm:hidden flex items-center gap-2 text-xs text-text-secondary
        hover:text-text-primary transition-colors cursor-pointer"
      @click="isFilterOpen = !isFilterOpen"
    >
      Filters
      <span
        v-if="activeFilterCount > 0"
        data-testid="filter-badge"
        class="min-w-4 h-4 flex items-center justify-center rounded-full
          bg-text-accent/20 text-text-accent text-[10px] font-bold px-1"
      >
        {{ activeFilterCount }}
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-3 h-3 transition-transform"
        :class="{ 'rotate-180': isFilterOpen }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <!-- Chips: toggled on mobile, always visible on sm+ -->
    <div
      v-if="isFilterOpen"
      data-testid="filter-chips"
      class="space-y-2 sm:hidden"
    >
      <FilterChips
        :sources="sources"
        :tickers="tickers"
        :selected-sources="selectedSources"
        :selected-tickers="selectedTickers"
        :search-query="searchQuery"
        @toggle-source="emit('toggle-source', $event)"
        @toggle-ticker="emit('toggle-ticker', $event)"
        @clear-filters="emit('clear-filters')"
      />
    </div>

    <!-- Desktop: always visible -->
    <div class="hidden sm:block space-y-2">
      <FilterChips
        :sources="sources"
        :tickers="tickers"
        :selected-sources="selectedSources"
        :selected-tickers="selectedTickers"
        :search-query="searchQuery"
        @toggle-source="emit('toggle-source', $event)"
        @toggle-ticker="emit('toggle-ticker', $event)"
        @clear-filters="emit('clear-filters')"
      />
    </div>
  </div>
</template>
