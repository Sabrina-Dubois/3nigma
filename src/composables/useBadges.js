// src/composables/useBadges.js
// DEV-24 — Vérification et attribution des succès

import { supabase } from '@/lib/supabase'

// Définition de tous les succès avec leurs conditions
export const BADGES_DEF = [
  {
    id: 'premier_pas',
    label: 'Premier Pas',
    icon: '🔑',
    description: 'Valider 1 énigme',
  },
  {
    id: 'l_eclair',
    label: 'L\'Éclair',
    icon: '⚡',
    description: 'Résoudre sans utiliser l\'indice',
  },
  {
    id: 'sans_faille',
    label: 'Sans Faille',
    icon: '🎯',
    description: 'Résoudre 5 énigmes sans indice',
  },
  {
    id: 'noctambule',
    label: 'Noctambule',
    icon: '🌙',
    description: 'Résoudre une énigme entre 22h et 6h',
  },
  {
    id: 'marathonien',
    label: 'Marathonien',
    icon: '🏃',
    description: '7 jours consécutifs',
  },
  {
    id: 'detecteur',
    label: 'Détective',
    icon: '🕵️',
    description: '10 énigmes validées',
  },
  {
    id: 'archiviste',
    label: 'Archiviste',
    icon: '📚',
    description: 'Terminer 1 escape',
  },
  {
    id: 'veteran',
    label: 'Vétéran',
    icon: '🗂️',
    description: 'Terminer 3 escapes',
  },
  {
    id: 'maitre_enqueteur',
    label: 'Maître Enquêteur',
    icon: '🧠',
    description: '50 énigmes validées',
  },
  {
    id: 'legende',
    label: 'Légende',
    icon: '👑',
    description: 'Passer Premium',
  },
]

export function useBadges() {
  /**
   * Vérifie les conditions, insère les nouveaux succès, retourne les badges nouvellement gagnés.
   * @param {object} ctx
   * @param {string}  ctx.userId
   * @param {boolean} ctx.hintUsed       — indice utilisé sur cette énigme
   * @param {boolean} ctx.isPremium
   * @param {number}  ctx.currentStreak  — streak actuel (jours consécutifs)
   * @returns {Promise<Array>}           — liste des badges nouvellement gagnés
   */
  async function checkAndAward({ userId, hintUsed, isPremium, currentStreak }) {
    if (!userId) return []

    // 1. Récupérer les badges déjà débloqués
    const { data: existing } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId)
    const alreadyEarned = new Set((existing ?? []).map((b) => b.badge_id))

    // 2. Récupérer les stats nécessaires
    const [enigmasRes, escapesRes, noHintRes] = await Promise.all([
      supabase
        .from('user_enigma_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('solved_at', 'is', null),
      supabase
        .from('user_escapes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('completed_at', 'is', null),
      supabase
        .from('user_enigma_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('hint_used', false)
        .not('solved_at', 'is', null),
    ])

    const enigmasCompleted = enigmasRes.count ?? 0
    const escapesCompleted = escapesRes.count ?? 0
    const noHintCount      = noHintRes.count ?? 0
    const hour             = new Date().getHours()
    const isNight          = hour >= 22 || hour < 6

    // 3. Évaluer les conditions
    const conditions = {
      premier_pas:      enigmasCompleted >= 1,
      l_eclair:         !hintUsed,
      sans_faille:      noHintCount >= 5,
      noctambule:       isNight,
      marathonien:      currentStreak >= 7,
      detecteur:        enigmasCompleted >= 10,
      archiviste:       escapesCompleted >= 1,
      veteran:          escapesCompleted >= 3,
      maitre_enqueteur: enigmasCompleted >= 50,
      legende:          isPremium,
    }

    // 4. Filtrer les nouveaux badges à attribuer
    const toAward = Object.entries(conditions)
      .filter(([id, met]) => met && !alreadyEarned.has(id))
      .map(([id]) => ({ user_id: userId, badge_id: id }))

    if (toAward.length === 0) return []

    // 5. Insérer en DB (ignore les doublons)
    await supabase.from('user_badges').insert(toAward)

    // 6. Retourner les définitions des badges gagnés
    return toAward.map(({ badge_id }) => BADGES_DEF.find((b) => b.id === badge_id)).filter(Boolean)
  }

  return { checkAndAward, BADGES_DEF }
}
