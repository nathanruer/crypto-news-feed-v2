<script setup lang="ts">
import type { AlertRule } from '../../../../shared/types/alert'
import AlertRuleCard from './AlertRuleCard.vue'

defineProps<{
  rules: AlertRule[]
}>()

defineEmits<{
  'toggle-enabled': [id: string]
  'delete': [id: string]
}>()
</script>

<template>
  <div class="space-y-2">
    <template v-if="rules.length > 0">
      <AlertRuleCard
        v-for="rule in rules"
        :key="rule.id"
        :rule="rule"
        @toggle-enabled="$emit('toggle-enabled', $event)"
        @delete="$emit('delete', $event)"
      />
    </template>
    <div
      v-else
      class="flex flex-col items-center justify-center py-12 text-text-secondary"
    >
      <p class="text-sm">
        No alert rules configured
      </p>
      <p class="text-xs mt-1">
        Create one above to get started
      </p>
    </div>
  </div>
</template>
