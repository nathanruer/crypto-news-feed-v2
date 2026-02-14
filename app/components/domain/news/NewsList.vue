<script setup lang="ts">
import type { NewsItem } from '../../../../shared/types/news'
import { ref, watch, nextTick } from 'vue'
import NewsCard from './NewsCard.vue'

const props = defineProps<{ items: NewsItem[] }>()

const scrollContainer = ref<HTMLElement | null>(null)
const userHasScrolled = ref(false)

function handleScroll() {
  if (!scrollContainer.value) return
  userHasScrolled.value = scrollContainer.value.scrollTop > 50
}

watch(() => props.items.length, async () => {
  if (userHasScrolled.value || !scrollContainer.value) return
  await nextTick()
  scrollContainer.value.scrollTop = 0
})
</script>

<template>
  <div
    ref="scrollContainer"
    class="overflow-y-auto max-h-[calc(100vh-5rem)] space-y-3 pb-8"
    @scroll="handleScroll"
  >
    <template v-if="items.length > 0">
      <NewsCard
        v-for="item in items"
        :key="item.id"
        :item="item"
      />
    </template>

    <div
      v-else
      class="flex flex-col items-center justify-center py-24 text-text-secondary"
    >
      <div class="w-2 h-2 bg-text-secondary rounded-full animate-pulse mb-4" />
      <p class="text-sm">
        Waiting for news...
      </p>
    </div>
  </div>
</template>
