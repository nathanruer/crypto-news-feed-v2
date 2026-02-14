<script setup lang="ts">
import type { NewsItem } from '../../../../shared/types/news'
import { formatRelativeTime } from '../../../utils/format-relative-time'
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ item: NewsItem }>()

const relativeTime = ref(formatRelativeTime(props.item.time))
let interval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  interval = setInterval(() => {
    relativeTime.value = formatRelativeTime(props.item.time)
  }, 30_000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <article class="bg-bg-secondary rounded-lg p-4 border-l-2 border-text-accent">
    <header class="flex items-center justify-between mb-2">
      <span class="text-xs font-medium text-text-accent uppercase tracking-wide">
        {{ item.sourceName }}
      </span>
      <time class="text-xs text-text-secondary font-mono">
        {{ relativeTime }}
      </time>
    </header>

    <h3 class="text-sm font-semibold text-text-primary leading-snug line-clamp-1 mb-1">
      {{ item.title }}
    </h3>

    <p
      v-if="item.body !== item.title"
      class="text-xs text-text-secondary leading-relaxed line-clamp-2 mb-3"
    >
      {{ item.body }}
    </p>

    <footer class="flex items-center gap-2 flex-wrap">
      <span
        v-for="ticker in item.tickers"
        :key="ticker"
        class="px-1.5 py-0.5 text-xs font-mono font-medium bg-bg-tertiary text-text-primary rounded"
      >
        {{ ticker }}
      </span>
      <a
        v-if="item.url"
        :href="item.url"
        target="_blank"
        rel="noopener noreferrer"
        class="ml-auto text-xs text-text-secondary hover:text-text-accent transition-colors"
      >
        ↗
      </a>
    </footer>
  </article>
</template>
