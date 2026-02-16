<script setup lang="ts">
import { onMounted } from 'vue'
import { useAlertsStore } from '../stores/alerts'
import AlertRuleForm from '../components/domain/alerts/AlertRuleForm.vue'
import AlertRuleList from '../components/domain/alerts/AlertRuleList.vue'

useHead({ title: 'CryptoFeed — Alerts' })

const store = useAlertsStore()

onMounted(async () => {
  await store.fetchRules()
})

async function handleCreate(data: { name: string, type: 'ticker' | 'source', value: string }) {
  await store.createRule(data)
}

async function handleToggle(id: string) {
  const rule = store.rules.find(r => r.id === id)
  if (rule) await store.updateRule(id, { enabled: !rule.enabled })
}

async function handleDelete(id: string) {
  await store.deleteRule(id)
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-text-primary mb-1">
          Alert Rules
        </h2>
        <p class="text-sm text-text-secondary">
          Get notified when incoming news matches your criteria.
        </p>
      </div>
      <button
        data-testid="sound-toggle"
        :class="[
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors',
          store.soundEnabled
            ? 'bg-text-accent/20 text-text-accent'
            : 'bg-bg-tertiary text-text-secondary',
        ]"
        @click="store.toggleSound()"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            v-if="store.soundEnabled"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0
              010 11.9M6.228 7.228L11 2v20l-4.772-5.228H4a1 1
              0 01-1-1v-7.544a1 1 0 011-1h2.228z"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707
              -4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586
              15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
          />
        </svg>
        {{ store.soundEnabled ? 'Sound on' : 'Sound off' }}
      </button>
    </div>

    <AlertRuleForm @create="handleCreate" />

    <div class="border-t border-bg-tertiary pt-4">
      <AlertRuleList
        :rules="store.rules"
        @toggle-enabled="handleToggle"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>
