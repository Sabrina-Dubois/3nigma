<template>
  <AppLoader v-if="uiStore.isLoading" />

  <div v-else class="app-wrapper" :class="isEscapeRoute ? 'escape-bg' : 'parch-bg'">

    <!-- Fond étoilé persistant sur toutes les pages d'une escape -->
    <template v-if="isEscapeRoute">
      <div class="escape-base-bg"></div>
      <div class="escape-stars-wrapper">
        <StarField :count="130" />
      </div>
      <div class="escape-overlay"></div>
    </template>

    <div class="app-container">
      <AppToast />
      <RouterView />
    </div>

    <BottomNav />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { useEscapesStore } from '@/stores/escapes.store'
import AppLoader from '@/components/AppLoader.vue'
import AppToast from '@/components/AppToast.vue'
import BottomNav from '@/components/BottomNav.vue'
import StarField from '@/components/StarField.vue'

const authStore = useAuthStore()
const uiStore = useUiStore()
const escapesStore = useEscapesStore()

// Fond étoilé = uniquement pour les escapes de type "stars" (ex: eclipse)
const STAR_ESCAPES = ['eclipse']
const isEscapeRoute = computed(() => STAR_ESCAPES.includes(escapesStore.currentEscapeId))

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
</style>
