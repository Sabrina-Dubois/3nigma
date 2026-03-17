<template>
  <AppLoader v-if="uiStore.isLoading" />

  <div v-else class="app-wrapper" :class="appBgClass">

    <!-- Fond étoilé — eclipse uniquement -->
    <template v-if="isStarEscape">
      <div class="escape-base-bg"></div>
      <div class="escape-stars-wrapper">
        <StarField :count="130" />
      </div>
      <div class="escape-overlay"></div>
    </template>

    <!-- Fond bougie — boucle -->
    <template v-else-if="isCandleEscape">
      <div class="candle-base-bg"></div>
      <div class="candle-flicker"></div>
    </template>

    <div class="app-container">
      <AppToast />
      <RouterView />
    </div>

    <BottomNav />
    <InstallBanner />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { useEscapesStore } from '@/stores/escapes.store'
import { useRoute } from 'vue-router'
import AppLoader from '@/components/AppLoader.vue'
import AppToast from '@/components/AppToast.vue'
import BottomNav from '@/components/BottomNav.vue'
import StarField from '@/components/StarField.vue'
import InstallBanner from '@/components/InstallBanner.vue'

const authStore = useAuthStore()
const uiStore = useUiStore()
const escapesStore = useEscapesStore()
const route = useRoute()

const STAR_ESCAPES   = ['eclipse']
const CANDLE_ESCAPES = ['boucle']

// Synchronise currentEscapeId avec la route courante
watch(() => route.params.id, (id) => {
  escapesStore.currentEscapeId = id ?? null
}, { immediate: true })

const isStarEscape   = computed(() => STAR_ESCAPES.includes(escapesStore.currentEscapeId))
const isCandleEscape = computed(() => CANDLE_ESCAPES.includes(escapesStore.currentEscapeId))

const appBgClass = computed(() => {
  if (isStarEscape.value || isCandleEscape.value) return 'escape-bg'
  return 'parch-bg'
})

onMounted(async () => {
  uiStore.isLoading = true
  await authStore.init()
  uiStore.isLoading = false
})
</script>

<style>
.escape-bg {
  background: #04020a;
  overflow: hidden;
}

.escape-bg .app-container {
  position: relative;
  z-index: 1;
}

.escape-base-bg {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at 50% 35%, #1a0d08 0%, #04020a 60%, #000 100%);
  animation: escapeBgDrift 50s ease-in-out infinite;
  will-change: transform;
  z-index: 0;
}

@keyframes escapeBgDrift {
  0%   { transform: translate(0, 0)      scale(1.04); }
  33%  { transform: translate(-1%, 1%)   scale(1.06); }
  66%  { transform: translate(1%, -0.5%) scale(1.05); }
  100% { transform: translate(0, 0)      scale(1.04); }
}

.escape-stars-wrapper {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.escape-overlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%);
  z-index: 0;
  pointer-events: none;
}

/* ── FOND BOUGIE (boucle) ── */
.candle-base-bg {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at 50% 60%, #3a1a06 0%, #1a1008 45%, #0a0604 100%);
  z-index: 0;
}

.candle-flicker {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at 50% 55%, rgba(240, 160, 40, 0.07) 0%, transparent 60%);
  animation: candleFlicker 4s ease-in-out infinite;
  z-index: 0;
  pointer-events: none;
}

@keyframes candleFlicker {
  0%   { opacity: 1;    transform: scale(1)    translateY(0); }
  25%  { opacity: 0.75; transform: scale(1.03) translateY(-1%); }
  50%  { opacity: 0.9;  transform: scale(0.98) translateY(1%); }
  75%  { opacity: 0.8;  transform: scale(1.02) translateY(-0.5%); }
  100% { opacity: 1;    transform: scale(1)    translateY(0); }
}
</style>
