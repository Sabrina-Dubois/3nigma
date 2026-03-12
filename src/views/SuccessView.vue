<template>
  <div class="sv">

    <!-- Loader -->
    <div v-if="loading" class="sv__center">
      <p class="sv__label">Chargement...</p>
    </div>

    <div v-else class="sv__content">

      <!-- Badge jour résolu -->
      <div class="sv__badge">
        <span class="sv__badge-check">✦</span>
        <span class="sv__badge-label">Jour {{ enigma?.day_number }} résolu</span>
      </div>

      <!-- XP gagné -->
      <div class="sv__xp">
        <span class="sv__xp-value">+{{ xpEarned }}</span>
        <span class="sv__xp-unit">XP</span>
      </div>

      <!-- Divider -->
      <div class="sv__divider"></div>

      <!-- Titre fin (dernier jour) -->
      <div v-if="enigma?.day_number >= escape?.duration_days" class="sv__complete-header">
        <p class="sv__complete-title">Escape terminé !</p>
        <p class="sv__complete-sub">Tu as résolu "{{ escape?.title }}".</p>
      </div>

      <!-- Story after -->
      <div v-if="storyParagraphs.length" class="sv__story">
        <p class="sv__story-label">{{ enigma?.day_number >= escape?.duration_days ? '— Épilogue —' : '— Suite de l\'enquête —' }}</p>
        <div v-for="(p, i) in storyParagraphs" :key="i">
          <p class="sv__story-para">{{ p }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="sv__actions">

        <!-- Jour suivant (si pas le dernier) -->
        <button
          v-if="enigma?.day_number < escape?.duration_days"
          class="sv__btn sv__btn--primary"
          @click="goNextDay"
        >
          Jour {{ enigma.day_number + 1 }} →
        </button>

        <!-- Dernier jour : juste le bouton -->
        <button
          v-else
          class="sv__btn sv__btn--primary"
          @click="router.push('/')"
        >
          Découvrir d'autres escapes
        </button>

        <button
          v-if="enigma?.day_number < escape?.duration_days"
          class="sv__btn sv__btn--ghost"
          @click="router.push(`/escape/${route.params.id}`)"
        >
          ← Retour à l'enquête
        </button>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useXpStore } from '@/stores/xp.store'
import { useEscapesStore } from '@/stores/escapes.store'
import { supabase } from '@/lib/supabase'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()
const xpStore   = useXpStore()
const escapesStore = useEscapesStore()

const enigma  = ref(null)
const escape  = ref(null)
const attempt = ref(null)
const loading = ref(true)

const isReplay = computed(() => route.query.replay === '1')
const xpEarned = computed(() => (isReplay.value ? 0 : (attempt.value?.xp_earned ?? enigma.value?.xp_reward ?? 0)))

const storyParagraphs = computed(() => {
  if (!enigma.value?.story_after) return []
  const lines = enigma.value.story_after.split('\n').filter(p => p.trim() !== '')

  const choice = sessionStorage.getItem('enigmaChoice')
  if (!choice) return lines

  // Détecte les sections "SOLEIL :" / "ÉVEILLÉ :" et filtre selon le choix
  const markers = { soleil: /^SOLEIL\s*:/i, eveille: /^ÉVEILLÉ\s*:|^EVEILLE\s*:/i }
  const activeMarker = markers[choice]
  if (!activeMarker) return lines

  let inSection = false
  const filtered = []
  for (const line of lines) {
    const isSoleil  = /^SOLEIL\s*:/i.test(line)
    const isEveille = /^ÉVEILLÉ\s*:|^EVEILLE\s*:/i.test(line)
    if (isSoleil || isEveille) {
      inSection = activeMarker.test(line)
    } else if (inSection) {
      filtered.push(line)
    }
  }
  return filtered.length > 0 ? filtered : lines
})

onMounted(async () => {
  const escapeId  = route.params.id
  escapesStore.currentEscapeId = escapeId
  const dayNumber = Number(route.params.n)

  try {
    const [{ data: enigmaData }, { data: escapeData }] = await Promise.all([
      supabase
        .from('enigmas')
        .select('id, escape_id, day_number, title, story_after, xp_reward')
        .eq('escape_id', escapeId)
        .eq('day_number', dayNumber)
        .single(),
      supabase
        .from('escapes')
        .select('id, title, duration_days')
        .eq('id', escapeId)
        .single(),
    ])

    enigma.value = enigmaData
    escape.value = escapeData

    if (enigmaData?.id) {
      const { data: attemptData } = await supabase
        .from('user_enigma_attempts')
        .select('xp_earned, hint_used')
        .eq('user_id', authStore.user.id)
        .eq('enigma_id', enigmaData.id)
        .maybeSingle()
      attempt.value = attemptData
    }
  } catch (e) {
    console.error('[SuccessView] load error:', e)
  } finally {
    loading.value = false
  }

  // Rafraîchit le profil et sync le xp.store pour que niveau/barre XP soient à jour
  try {
    await authStore.fetchProfile()
    if (authStore.profile?.total_xp != null) {
      xpStore.totalXp = authStore.profile.total_xp
    }
  } catch { /* non bloquant */ }
})

onUnmounted(() => {
  escapesStore.currentEscapeId = null
})

function goNextDay() {
  router.push(`/escape/${route.params.id}/day/${enigma.value.day_number + 1}`)
}
</script>

<style scoped>
.sv {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  color: #f2e8d0;
}


/* ── LAYOUT ── */
.sv__center {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.sv__label {
  font-family: 'Cinzel', serif;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #8a6030;
}

.sv__content {
  position: relative;
  z-index: 1;
  max-width: 480px;
  margin: 0 auto;
  padding: 3rem 1.5rem 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

/* ── BADGE ── */
.sv__badge {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(201, 169, 110, 0.12);
  border: 1px solid rgba(201, 169, 110, 0.35);
  border-radius: 999px;
  padding: 0.5rem 1.2rem;
}

.sv__badge-check {
  color: #c9a96e;
  font-size: 0.9rem;
}

.sv__badge-label {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #c9a96e;
}

/* ── XP ── */
.sv__xp {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  animation: xpPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes xpPop {
  from { transform: scale(0.6); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

.sv__xp-value {
  font-family: 'Cinzel', serif;
  font-size: 3.5rem;
  font-weight: 900;
  color: #c9a96e;
  letter-spacing: -0.02em;
  text-shadow: 0 0 30px rgba(201, 169, 110, 0.4);
}

.sv__xp-unit {
  font-family: 'Cinzel', serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #8a6030;
  letter-spacing: 0.15em;
}

/* ── DIVIDER ── */
.sv__divider {
  width: 60px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 110, 0.4), transparent);
}

/* ── STORY AFTER ── */
.sv__story {
  width: 100%;
  background: rgba(10, 6, 2, 0.6);
  border: 1px solid rgba(201, 169, 110, 0.15);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(8px);
}

.sv__story-label {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #8a6030;
  margin-bottom: 1.2rem;
  text-align: center;
}

.sv__story-para {
  font-family: 'IM Fell English', serif;
  font-size: 1.05rem;
  line-height: 1.75;
  color: #e8d8b8;
  margin-bottom: 1rem;
}

.sv__story-para:last-child {
  margin-bottom: 0;
}

/* ── ACTIONS ── */
.sv__actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sv__btn {
  width: 100%;
  padding: 1rem;
  border-radius: 10px;
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.2s;
  border: none;
}

.sv__btn:hover { opacity: 0.85; }

.sv__btn--primary {
  background: #c9a96e;
  color: #1a0d02;
  font-weight: 700;
  box-shadow: 0 4px 20px rgba(201, 169, 110, 0.3);
}

.sv__btn--ghost {
  background: transparent;
  border: 1px solid rgba(242, 232, 208, 0.2);
  color: #a08060;
}

/* ── ESCAPE COMPLET ── */
.sv__complete-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.sv__complete {
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.sv__complete-title {
  font-family: 'Cinzel', serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #c9a96e;
  letter-spacing: 0.1em;
}

.sv__complete-sub {
  font-family: 'IM Fell English', serif;
  font-size: 1rem;
  color: #a08060;
  font-style: italic;
  margin-bottom: 1rem;
}
</style>
