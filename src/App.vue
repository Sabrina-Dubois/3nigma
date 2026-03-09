<template>
  <!-- Loader global pendant l'init -->
  <div v-if="uiStore.isLoading" class="fixed inset-0 flex items-center justify-center" style="background: var(--parch)">
    <p style="font-family: 'Cinzel', serif; color: var(--sepia); letter-spacing: 3px; font-size: 14px;">
      3NIGMA°
    </p>
  </div>

  <!-- App normale une fois chargée -->
  <div v-else class="mx-auto relative min-h-screen" style="max-width: 430px; background: var(--parch);">
    <RouterView />
  </div>

</template>


<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'

const authStore = useAuthStore()
const uiStore = useUiStore()

// Au démarrage de l'app, on initialise la session Supabase
// Si l'utilisateur était déjà connecté, sa session est restaurée
onMounted(async () => {
  uiStore.isLoading = true
  await authStore.init()
  uiStore.isLoading = false
})
</script>

<style scoped></style>
