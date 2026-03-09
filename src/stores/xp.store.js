import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useXpStore = defineStore(
  'xp',
  () => {
    // ── STATE ──
    const totalXp = ref(0) // XP total accumulé
    const currentStreak = ref(0) // jours consécutifs actuels
    const longestStreak = ref(0) // meilleur streak historique

    // ── GETTERS ──

    // Calcule le niveau depuis les XP
    // Formule : Niv N = 500 × N × (N-1) / 2
    // Niv 2 = 500 XP, Niv 3 = 1500 XP, Niv 5 = 5000 XP...
    const level = computed(() => {
      let n = 1
      while (xpRequiredForLevel(n + 1) <= totalXp.value) {
        n++
      }
      return n
    })

    // XP requis pour atteindre un niveau donné
    function xpRequiredForLevel(n) {
      return (500 * n * (n - 1)) / 2
    }

    // XP requis pour le niveau suivant
    const xpForNextLevel = computed(() => xpRequiredForLevel(level.value + 1))

    // XP requis pour le niveau actuel
    const xpForCurrentLevel = computed(() => xpRequiredForLevel(level.value))

    // Pourcentage de progression vers le niveau suivant (pour la barre XP)
    const progressPercent = computed(() => {
      const xpDiff = xpForNextLevel.value - xpForCurrentLevel.value
      const xpProgress = totalXp.value - xpForCurrentLevel.value
      return Math.round((xpProgress / xpDiff) * 100)
    })

    return {
      totalXp,
      currentStreak,
      longestStreak,
      level,
      xpForNextLevel,
      progressPercent,
      xpRequiredForLevel,
    }
  },
  {
    persist: true, // on persiste les XP et streak
  },
)
