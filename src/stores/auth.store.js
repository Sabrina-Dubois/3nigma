import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

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

    // ── ACTIONS ──

    // Initialisation — appelée au démarrage de l'app dans App.vue
    // Récupère la session existante si l'utilisateur était déjà connecté
    async function init() {
      loading.value = true
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        user.value = data.session.user
        await fetchProfile() // on récupère aussi les données du profil
      } else {
        user.value = null
        profile.value = null
      }

      // Écoute les changements de session (login, logout, token refresh)
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') return
        if (session) {
          user.value = session.user
          await fetchProfile()
        } else {
          user.value = null
          profile.value = null
        }
      })

      loading.value = false
    }

    // Connexion avec email + mot de passe
    async function signIn(email, password) {
      loading.value = true
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      loading.value = false
      if (error) throw error
      return data
    }

    // Inscription avec email + mot de passe + pseudo
    async function signUp(email, password, username) {
      loading.value = true
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }, // sera récupéré par le trigger SQL
        },
      })
      loading.value = false
      if (error) throw error
      return data
    }

    // Déconnexion
    async function signOut() {
      await supabase.auth.signOut()
      user.value = null
      profile.value = null
    }

    // Charge le profil depuis la table profiles
    async function fetchProfile() {
      if (!user.value) return
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()
      if (!error) profile.value = data
    }

    // On retourne tout ce que les composants Vue peuvent utiliser
    return {
      user,
      profile,
      loading,
      isLoggedIn,
      isPremium,
      init,
      signIn,
      signUp,
      signOut,
      fetchProfile,
    }
  },
  {
    persist: true, // sauvegarde dans localStorage — survit au refresh de page
  },
)
