<template>
  <!-- Loader global pendant l'init -->
  <AppLoader v-if="uiStore.isLoading" />

  <!-- App normale une fois chargée -->
  <div v-else class="mx-auto relative min-h-screen" style="max-width: 430px; background: var(--parch);">
    <AppToast />
    <RouterView />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import AppLoader from '@/components/AppLoader.vue'
import AppToast from '@/components/AppToast.vue'

const authStore = useAuthStore()
const uiStore = useUiStore()

onMounted(async () => {
  uiStore.isLoading = true
  await authStore.init()
  uiStore.isLoading = false
})
</script>