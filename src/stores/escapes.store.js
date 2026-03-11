import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useEscapesStore = defineStore('escapes', () => {
  // ── STATE ──
  const escapes = ref([]) // toutes les aventures disponibles (depuis Supabase)
  const userEscapes = ref([]) // les aventures en cours de l'utilisateur
  const activeFilter = ref('all') // filtre actif : 'all', '7', '10', '15', '30', '45'

  // ── GETTERS ──
  const filteredEscapes = computed(() => {
    // si pas de filtre, on retourne tout
    if (activeFilter.value === 'all') return escapes.value

    // sinon on filtre par durée
    return escapes.value.filter((e) => e.duration_days === Number(activeFilter.value))
  })

  // Pour chaque escape, on cherche la progression de l'utilisateur
  const escapesWithProgress = computed(() => {
    return filteredEscapes.value.map((escape) => {
      // on cherche si l'utilisateur a commencé cet escape
      const userEscape = userEscapes.value.find((ue) => ue.escape_id === escape.id)
      return {
        ...escape, // toutes les données de l'escape
        userEscape, // sa progression (ou undefined si pas commencé)
      }
    })
  })

  // ID de l'escape en cours de jeu (utilisé par App.vue pour le fond)
  const currentEscapeId = ref(null)

  return {
    escapes,
    userEscapes,
    activeFilter,
    filteredEscapes,
    escapesWithProgress,
    currentEscapeId,
  }
})
