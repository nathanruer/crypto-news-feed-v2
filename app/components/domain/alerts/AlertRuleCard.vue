<script setup lang="ts">
import type { AlertRule } from '../../../../shared/types/alert'

defineProps<{
  rule: AlertRule
}>()

defineEmits<{
  'toggle-enabled': [id: string]
  'delete': [id: string]
}>()
</script>

<template>
  <div
    data-testid="rule-card"
    :class="[
      'flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-bg-secondary border border-bg-tertiary',
      rule.enabled ? '' : 'opacity-50',
    ]"
  >
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-text-primary truncate">
        {{ rule.name }}
      </p>
      <p class="text-xs text-text-secondary mt-0.5">
        <span class="uppercase tracking-wide">{{ rule.type }}</span>
        <span class="mx-1">=</span>
        <span class="font-mono">{{ rule.value }}</span>
      </p>
    </div>

    <div class="flex items-center gap-2 shrink-0">
      <button
        data-testid="toggle-enabled"
        :class="[
          'w-8 h-5 rounded-full relative cursor-pointer transition-colors',
          rule.enabled ? 'bg-text-accent' : 'bg-bg-tertiary',
        ]"
        @click="$emit('toggle-enabled', rule.id)"
      >
        <span
          :class="[
            'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
            rule.enabled ? 'left-3.5' : 'left-0.5',
          ]"
        />
      </button>
      <button
        data-testid="delete-rule"
        class="text-text-secondary hover:text-bearish text-sm cursor-pointer transition-colors"
        @click="$emit('delete', rule.id)"
      >
        &times;
      </button>
    </div>
  </div>
</template>
