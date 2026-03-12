// src/composables/useEnigma.js
// DEV-18 — EnigmaView — Écran de jeu
// Fonctionnalité métier parente : FM-05

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { supabase } from '@/lib/supabase'

export function useEnigma() {
  const router = useRouter()
  const authStore = useAuthStore()
  const uiStore = useUiStore()

  // ── STATE ──
  const enigma = ref(null) // énigme du jour (sans answer)
  const userAttempt = ref(null) // tentative existante si déjà résolue
  const escape = ref(null) // escape courant (duration_days)
  const previousEnigma = ref(null) // énigme précédente (id, story_before)
  const previousAttempt = ref(null) // tentative liée à l'énigme précédente
  const loading = ref(false)
  const error = ref(null)
  const hintVisible = ref(false) // indice affiché ou non
  const hintUsed = ref(false) // indice utilisé (coût XP)
  const submitting = ref(false) // requête check-answer en cours
  const answerError = ref(false) // mauvaise réponse → animation shake

  // ── GETTERS ──

  // L'énigme est-elle déjà résolue ?
  const isSolved = computed(() => !!userAttempt.value?.solved_at)

  // Quand le prochain jour se déverrouille
  const unlockedNextAt = computed(() => previousAttempt.value?.unlocked_next_at ?? null)

  // L'énigme est-elle disponible maintenant ?
  const isAvailable = computed(() => {
    if (enigma.value?.day_number === 1) return true
    if (!unlockedNextAt.value) return false
    return new Date() >= new Date(unlockedNextAt.value)
  })

  // ── ACTIONS ──

  /**
   * Charge l'énigme du jour depuis Supabase (sans la colonne answer)
   * @param {string} escapeId
   * @param {number} dayNumber
   */
  async function loadEnigma(escapeId, dayNumber) {
    loading.value = true
    error.value = null
    escape.value = null
    userAttempt.value = null
    previousEnigma.value = null
    previousAttempt.value = null

    const { data, error: err } = await supabase
      .from('enigmas')
      .select(
        'id, escape_id, day_number, title, story_before, question, hint, story_after, xp_reward, type, config',
      )
      .eq('escape_id', escapeId)
      .eq('day_number', dayNumber)
      .single()

    if (err) {
      error.value = err.message
      loading.value = false
      return
    }

    // Parser la config si c'est une chaîne JSON
    if (data && typeof data.config === 'string') {
      try { data.config = JSON.parse(data.config) } catch { data.config = {} }
    }
    enigma.value = data

    // Charger la tentative existante si déjà résolue
    await loadAttempt(data.id)
    // Charger l'escape pour récupérer duration_days
    await loadEscape(escapeId)
    // Charger l'énigme précédente + tentative précédente (pour story_before et disponibilité)
    await loadPreviousEnigma(escapeId, dayNumber)

    loading.value = false
  }

  /**
   * Charge la tentative de l'utilisateur pour cette énigme
   * @param {string} enigmaId
   */
  async function loadAttempt(enigmaId) {
    const userId = authStore.user?.id
    if (!userId) return

    const { data } = await supabase
      .from('user_enigma_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('enigma_id', enigmaId)
      .maybeSingle()

    if (data) {
      userAttempt.value = data
      hintUsed.value = data.hint_used
    }
  }

  /**
   * Charge l'escape courant
   * @param {string} escapeId
   */
  async function loadEscape(escapeId) {
    if (!escapeId) return
    const { data, error: err } = await supabase
      .from('escapes')
      .select('id, title, duration_days')
      .eq('id', escapeId)
      .single()
    if (err) return
    escape.value = data
  }

  /**
   * Charge l'énigme précédente + tentative précédente
   * @param {string} escapeId
   * @param {number} dayNumber
   */
  async function loadPreviousEnigma(escapeId, dayNumber) {
    if (!escapeId || !dayNumber || dayNumber <= 1) return

    const { data, error: err } = await supabase
      .from('enigmas')
      .select('id, story_before')
      .eq('escape_id', escapeId)
      .eq('day_number', dayNumber - 1)
      .single()

    if (err) return
    previousEnigma.value = data
    if (data?.id) {
      await loadPreviousAttempt(data.id)
    }
  }

  /**
   * Charge la tentative de l'utilisateur pour l'énigme précédente
   * @param {string} enigmaId
   */
  async function loadPreviousAttempt(enigmaId) {
    const userId = authStore.user?.id
    if (!userId) return

    const { data } = await supabase
      .from('user_enigma_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('enigma_id', enigmaId)
      .maybeSingle()

    if (data) {
      previousAttempt.value = data
    }
  }

  /**
   * Affiche l'indice — marque hint_used localement
   */
  function toggleHint() {
    if (hintUsed.value) {
      hintVisible.value = !hintVisible.value
      return
    }
    // Premier affichage → coût XP
    hintVisible.value = true
    hintUsed.value = true
  }

  /**
   * Soumet la réponse à l'Edge Function check-answer
   * @param {string} answer - réponse saisie par l'utilisateur
   * @returns {{ correct: boolean, xp_earned?: number, next_unlocked_at?: string }}
   */
  async function submitAnswer(answer, isReplay = false) {
    if (!enigma.value || submitting.value) return
    submitting.value = true
    answerError.value = false

    try {
      let { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        const refreshed = await supabase.auth.refreshSession()
        session = refreshed.data?.session ?? null
      }
      if (!session?.access_token) {
        uiStore.showToast('Session expirée. Reconnecte-toi.', 'error')
        await supabase.auth.signOut()
        router.push('/login')
        return { correct: false }
      }

      // Vérifie que le JWT est réellement valide
      let { error: userError } = await supabase.auth.getUser()
      if (userError) {
        const refreshed = await supabase.auth.refreshSession()
        session = refreshed.data?.session ?? null
        userError = (await supabase.auth.getUser()).error
      }
      if (userError) {
        uiStore.showToast('Session invalide. Reconnecte-toi.', 'error')
        await supabase.auth.signOut()
        router.push('/login')
        return { correct: false }
      }

      const { data, error } = await supabase.functions.invoke('check-answer', {
        body: {
          enigma_id: enigma.value.id,
          answer,
          hint_used: hintUsed.value,
          is_replay: isReplay,
          access_token: session.access_token,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      })

      if (error) {
        uiStore.showToast('Erreur de vérification. Réessaie.', 'error')
        console.error('[useEnigma] submitAnswer error:', error.message || error)
        return { correct: false }
      }

      if (!data.correct) {
        answerError.value = true
        setTimeout(() => (answerError.value = false), 600)
        return { correct: false }
      }
      router.push(`/escape/${enigma.value.escape_id}/day/${enigma.value.day_number}/success`)
      return { correct: true, xp_earned: data.xp_earned }

    } catch (e) {
      console.error('[submitAnswer] exception:', e)
      uiStore.showToast('Erreur inattendue. Réessaie.', 'error')
      return { correct: false }
    } finally {
      submitting.value = false
    }
  }

  return {
    // state
    enigma,
    userAttempt,
    escape,
    previousEnigma,
    previousAttempt,
    loading,
    error,
    hintVisible,
    hintUsed,
    submitting,
    answerError,
    // getters
    isSolved,
    unlockedNextAt,
    isAvailable,
    // actions
    loadEnigma,
    toggleHint,
    submitAnswer,
  }
}
