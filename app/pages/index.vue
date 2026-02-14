<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useNewsStore } from '../stores/news'
import { useNewsFeed } from '../composables/useNewsFeed'
import NewsList from '../components/domain/news/NewsList.vue'

useHead({ title: 'CryptoFeed — Dashboard' })

const store = useNewsStore()
const { connect, disconnect } = useNewsFeed()

onMounted(() => {
  connect()
})

onUnmounted(() => {
  disconnect()
})
</script>

<template>
  <NewsList :items="store.items" />
</template>
