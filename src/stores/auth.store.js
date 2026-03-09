import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore(
  'auth',
  () => {
    // ── STATE ──
    // Les données brutes qu'on stocke dans ce store 
    const user = ref(null) // l'objet user de Supabase (email, id...)
    const profile = ref(null) // les données de notre table profiles (username, xp, level...)
    const loading = ref(false) // true pendant qu'une requête est en cours

    // ── GETTERS ──
    // Des valeurs calculées automatiquement depuis le state
    const isLoggedIn = computed(() => !!user.value) // true si user n'est pas null
    const isPremium = computed(() => profile.value?.is_premium ?? false) // true si abonné premium

    // On retourne tout ce que les composants Vue peuvent utiliser
    return {
      user,
      profile,
      loading,
      isLoggedIn,
      isPremium,
    }
  },
  {
    persist: true, // sauvegarde dans localStorage — survit au refresh de page
  },
)
