// src/composables/useEscape.js
// DEV-16 — Action démarrer un escape
// Fonctionnalité métier parente : FM-04

import { useRouter } from 'vue-router'
import { useEscapesStore } from '@/stores/escapes.store'
import { useAuthStore } from '@/stores/auth.store'
import { supabase } from '@/lib/supabase'

export function useEscape() {
  const router = useRouter()
  const escapesStore = useEscapesStore()
  const authStore = useAuthStore()

  /**
   * Démarre un escape ou reprend là où l'utilisateur en était.
   * @param {string} escapeId - le slug de l'escape (ex: 'couteau')
   */
  async function startEscape(escapeId) {
    const userId = authStore.user?.id
    if (!userId) return

    // ── Vérif locale : escape déjà commencé dans le store ?
    const alreadyStarted = escapesStore.userEscapes.find((ue) => ue.escape_id === escapeId)

    if (alreadyStarted) {
      // On le renvoie directement au jour où il en était
      router.push(`/escape/${escapeId}/day/${alreadyStarted.current_day}`)
      return
    }

    // ── INSERT dans user_escapes
    const { data, error } = await supabase
      .from('user_escapes')
      .insert({
        user_id: userId,
        escape_id: escapeId,
        current_day: 1,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      // Code 23505 = violation contrainte UNIQUE (race condition rare)
      // L'escape a déjà été créé entre-temps → on navigue quand même
      if (error.code === '23505') {
        router.push(`/escape/${escapeId}/day/1`)
        return
      }
      console.error('[useEscape] startEscape error:', error.message)
      return
    }

    // ── Mise à jour du store LOCAL sans re-fetch Supabase
    escapesStore.userEscapes.push(data)

    // ── Navigation vers le jour 1
    router.push(`/escape/${escapeId}/day/1`)
  }

  return {
    startEscape,
  }
}
