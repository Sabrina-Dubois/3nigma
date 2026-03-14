<template>
  <Transition name="banner">
    <div v-if="visible" class="install-banner">
      <div class="install-banner__icon">🗝️</div>
      <div class="install-banner__text">
        <p class="install-banner__title">Installer 3NIGMA°</p>
        <p class="install-banner__sub">Accès rapide depuis votre écran d'accueil</p>
      </div>
      <div class="install-banner__actions">
        <button class="install-banner__btn-install" @click="install">Installer</button>
        <button class="install-banner__btn-dismiss" @click="dismiss">✕</button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const DISMISS_KEY = '3nigma.install.dismissed'
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 jours

const visible = ref(false)
let deferredPrompt = null

function isDismissed() {
  const ts = localStorage.getItem(DISMISS_KEY)
  if (!ts) return false
  return Date.now() - Number(ts) < DISMISS_DURATION
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function onBeforeInstallPrompt(e) {
  e.preventDefault()
  deferredPrompt = e
  if (!isStandalone() && !isDismissed()) {
    visible.value = true
  }
}

function onAppInstalled() {
  visible.value = false
  deferredPrompt = null
}

async function install() {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  await deferredPrompt.userChoice
  deferredPrompt = null
  visible.value = false
}

function dismiss() {
  localStorage.setItem(DISMISS_KEY, String(Date.now()))
  visible.value = false
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  window.addEventListener('appinstalled', onAppInstalled)
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  window.removeEventListener('appinstalled', onAppInstalled)
})
</script>

<style scoped>
.install-banner {
  position: fixed;
  bottom: 80px;
  left: 12px;
  right: 12px;
  z-index: 150;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--parch2);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 12px 14px;
  box-shadow: 0 8px 24px rgba(30, 14, 4, 0.2);
}

.install-banner__icon {
  font-size: 24px;
  flex-shrink: 0;
}

.install-banner__text {
  flex: 1;
  min-width: 0;
}

.install-banner__title {
  font-family: 'Cinzel', serif;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
}

.install-banner__sub {
  font-size: 11px;
  color: var(--sepia);
  margin-top: 2px;
}

.install-banner__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.install-banner__btn-install {
  font-family: 'Cinzel', serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--parch);
  background: var(--ink3);
  border: none;
  border-radius: 999px;
  padding: 6px 14px;
  cursor: pointer;
}

.install-banner__btn-dismiss {
  font-size: 14px;
  color: var(--sepia);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}

.banner-enter-active,
.banner-leave-active {
  transition: all 0.3s ease;
}

.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>
