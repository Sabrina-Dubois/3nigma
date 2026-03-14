<template>
  <div class="xp-bar-wrap">
    <div class="xp-bar-header">
      <span class="xp-bar-level">Niveau {{ level }}</span>
      <span class="xp-bar-values">{{ totalXp }} / {{ xpNext }} XP</span>
    </div>
    <div class="xp-bar">
      <div class="xp-bar__fill" :style="{ width: progress + '%' }"></div>
    </div>
    <div class="xp-bar-remaining">{{ remaining }} XP pour le niveau {{ level + 1 }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalXp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  xpNext: { type: Number, default: 500 },
  xpCurrent: { type: Number, default: 0 },
})

const progress = computed(() => {
  const range = props.xpNext - props.xpCurrent
  if (range <= 0) return 100
  return Math.min(100, Math.round(((props.totalXp - props.xpCurrent) / range) * 100))
})

const remaining = computed(() => Math.max(0, props.xpNext - props.totalXp))
</script>

<style scoped>
.xp-bar-wrap {
  width: 100%;
}

.xp-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.xp-bar-level {
  font-family: 'Cinzel', serif;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
}

.xp-bar-values {
  font-weight: 700;
  font-size: 13px;
  color: var(--gold);
}

.xp-bar {
  width: 100%;
  height: 12px;
  background: rgba(30, 14, 4, 0.1);
  border-radius: 999px;
  overflow: hidden;
}

.xp-bar__fill {
  height: 100%;
  background: var(--gold);
  border-radius: 999px;
  transition: width 0.6s ease;
}

.xp-bar-remaining {
  font-size: 11px;
  color: var(--sepia);
  margin-top: 6px;
}
</style>
