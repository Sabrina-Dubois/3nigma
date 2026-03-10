<template>
  <AppLoader v-if="uiStore.isLoading" />

  <div v-else class="app-wrapper parch-bg">
    <div class="app-container">
      <AppToast />
      <RouterView />
    </div>

    <BottomNav />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import AppLoader from '@/components/AppLoader.vue'
import AppToast from '@/components/AppToast.vue'
import BottomNav from '@/components/BottomNav.vue'

const authStore = useAuthStore()
const uiStore = useUiStore()

onMounted(async () => {
  uiStore.isLoading = true
  await authStore.init()
  uiStore.isLoading = false
})
</script>
