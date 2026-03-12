<template>
  <div class="enigma-view">

    <!-- ── LOADING ── -->
    <div v-if="loading" class="enigma-view__center">
      <p class="enigma-view__label">Chargement...</p>
    </div>

    <!-- ── ERREUR ── -->
    <div v-else-if="error" class="enigma-view__center enigma-view__center--col gap-6 px-6">
      <p class="enigma-view__label">Énigme introuvable.</p>
      <button class="enigma-view__btn" @click="router.back()">← Retour</button>
    </div>

    <!-- ── PAS ENCORE DISPONIBLE (première partie) ── -->
    <div v-else-if="!isAvailable && !isReplay" class="enigma-view__center enigma-view__center--col gap-6 px-6 text-center">
      <p class="enigma-view__heading">Jour {{ enigma?.day_number }}</p>
      <p class="enigma-view__label">Disponible dans</p>
      <CountdownTimer :target="unlockedNextAt" class="enigma-view__countdown" @expired="router.go(0)" />
      <button class="enigma-view__btn" @click="router.push(`/escape/${route.params.id}`)">
        ← Retour à l'enquête
      </button>
    </div>

    <!-- ── PAS ENCORE DISPONIBLE (mode replay) ── -->
    <div v-else-if="!isAvailable && isReplay" class="enigma-view__center enigma-view__center--col gap-6 px-6 text-center">
      <p class="enigma-view__heading">Jour {{ enigma?.day_number }}</p>
      <button class="enigma-view__btn"
        @click="router.push(`/escape/${route.params.id}/day/${Number(route.params.n) + 1}`)">
        Jour {{ Number(route.params.n) + 1 }} →
      </button>
    </div>

    <!-- ── PHASE NARRATIVE ── -->
    <div v-else-if="showStory" class="enigma-view__story">
      <div class="enigma-view__story-content">

        <!-- Header -->
        <div class="enigma-view__story-header">
          <button class="enigma-view__icon-btn" @click="router.push(`/escape/${route.params.id}`)">
            <i class="mdi mdi-arrow-left"></i>
          </button>
          <span class="enigma-view__day-badge">Jour {{ enigma.day_number }}</span>
        </div>

        <!-- Texte narratif -->
        <div class="enigma-view__story-body">
          <p class="enigma-view__story-label">— Récit —</p>
          <div v-for="(p, i) in storyParagraphs" :key="i">
            <p class="enigma-view__story-para">{{ p }}</p>
          </div>
        </div>

        <!-- Continuer -->
        <button class="enigma-view__story-cta" @click="showStory = false">
          Continuer l'enquête →
        </button>

      </div>
    </div>

    <!-- ── PHASE ÉNIGME ── -->
    <div v-else class="enigma-view__game">

      <!-- EnigmaRenderer (full screen) — toujours jouable, même si déjà résolue -->
      <EnigmaRenderer
        :enigma="enigma"
        :answer-error="answerError"
        :use-star-bg="isEclipse"
        @submit="(answer) => submitAnswer(answer, isReplay)"
      />

      <!-- Overlay header (au-dessus du renderer) -->
      <div class="enigma-view__overlay-header">
        <button class="enigma-view__icon-btn" @click="handleBack">
          <i class="mdi mdi-arrow-left"></i>
        </button>
        <span class="enigma-view__day-badge">
          Jour {{ enigma.day_number }} / {{ escape?.duration_days }}
        </span>
        <button v-if="enigma.hint" class="enigma-view__hint-btn" @click="onHintClick"
          :class="{ 'enigma-view__hint-btn--used': hintUsed }">
          <i class="mdi mdi-lightbulb-outline"></i>
          <span>Indice</span>
        </button>
        <div v-else style="width: 36px;"></div>
      </div>

      <!-- Confirmation avant premier usage -->
      <div v-if="confirmingHint" class="enigma-view__confirm-backdrop" @click.self="confirmingHint = false">
        <div class="enigma-view__confirm">
          <p class="enigma-view__confirm-title">Utiliser l'indice ?</p>
          <p class="enigma-view__confirm-body">
            Révéler l'indice réduit les XP gagnés pour cette énigme.
          </p>
          <div class="enigma-view__confirm-actions">
            <button class="enigma-view__confirm-cancel" @click="confirmingHint = false">Annuler</button>
            <button class="enigma-view__confirm-ok" @click="confirmHint">Révéler</button>
          </div>
        </div>
      </div>

      <!-- Overlay indice -->
      <div v-if="hintVisible" class="enigma-view__hint">
        <p class="enigma-view__hint-label">Indice</p>
        <p class="enigma-view__hint-text">{{ enigma.hint }}</p>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEnigma } from '@/composables/useEnigma'
import { useEscapesStore } from '@/stores/escapes.store'
import EnigmaRenderer from '@/components/EnigmaRenderer.vue'
import CountdownTimer from '@/components/CountdownTimer.vue'

const router = useRouter()
const route = useRoute()
const escapesStore = useEscapesStore()

const {
  enigma, escape, loading, error,
  hintVisible, hintUsed, answerError,
  isAvailable, unlockedNextAt, isSolved,
  loadEnigma, toggleHint, submitAnswer,
} = useEnigma()

const showStory = ref(false)
const confirmingHint = ref(false)
const isReplay = ref(false)
const isEclipse = computed(() => (escape.value?.id ?? escapesStore.currentEscapeId) === 'eclipse')

function onHintClick() {
  if (hintUsed.value) {
    toggleHint() // déjà utilisé → juste afficher/masquer
  } else {
    confirmingHint.value = true // premier clic → confirmation
  }
}

function confirmHint() {
  confirmingHint.value = false
  toggleHint()
}

const storyParagraphs = computed(() => {
  if (!enigma.value?.story_before) return []

  return enigma.value.story_before
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 0)
})

onMounted(async () => {
  escapesStore.currentEscapeId = route.params.id
  await loadEnigma(route.params.id, Number(route.params.n))

  // Détecter le mode replay via sessionStorage (posé au clic "Rejouer depuis le début")
  isReplay.value = sessionStorage.getItem('replayEscape') === route.params.id

  if (enigma.value?.story_before) {
    showStory.value = true
  }
})

onUnmounted(() => {
  escapesStore.currentEscapeId = null
})

function handleBack() {
  if (enigma.value?.story_before) {
    showStory.value = true
  } else {
    router.push(`/escape/${route.params.id}`)
  }
}
</script>

<style scoped>
/* ── BASE ── */
.enigma-view {
  position: relative;
  min-height: 100vh;
  background: transparent;
  color: #f2e8d0;
}

/* Les éléments centrés passent au-dessus du fond */
.enigma-view__center,
.enigma-view__story,
.enigma-view__game {
  position: relative;
  z-index: 1;
}

/* ── CENTRAGE ── */
.enigma-view__center {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.enigma-view__center--col {
  flex-direction: column;
}

/* ── TYPOGRAPHIE ── */
.enigma-view__heading {
  font-family: 'Cinzel', serif;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #f2e8d0;
}

.enigma-view__label {
  font-family: 'Cinzel', serif;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #8a6030;
}

.enigma-view__day-badge {
  font-family: 'Cinzel', serif;
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #c9a96e;
}

.enigma-view__countdown {
  color: #f2e8d0;
}

/* ── BOUTONS ── */
.enigma-view__btn {
  background: #5a3818;
  color: #f2e8d0;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  letter-spacing: 0.15em;
  cursor: pointer;
  transition: opacity 0.2s;
}

.enigma-view__btn:hover {
  opacity: 0.85;
}

.enigma-view__btn--ghost {
  background: transparent;
  border: 1px solid rgba(242, 232, 208, 0.25);
}

.enigma-view__icon-btn {
  background: rgba(242, 232, 208, 0.08);
  border: 1px solid rgba(242, 232, 208, 0.15);
  color: #f2e8d0;
  width: 45px;
  height: 45px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  backdrop-filter: blur(4px);
}

/* ── BOUTON INDICE ── */
.enigma-view__hint-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #c9a96e;
  border: none;
  color: #1a0d02;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-family: 'Cinzel', serif;
  font-size: 0.60rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(201, 169, 110, 0.5);
  transition: all 0.2s;
}

.enigma-view__hint-btn i {
  font-size: 1rem;
}

.enigma-view__hint-btn:active {
  transform: scale(0.96);
}

.enigma-view__hint-btn--used {
  background: rgba(201, 169, 110, 0.25);
  color: #c9a96e;
  box-shadow: none;
}

/* ── PHASE NARRATIVE ── */
.enigma-view__story {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: stretch;
  overflow: hidden;
}

.enigma-view__story-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 40%, #1a0d08 0%, #04020a 60%, #000 100%);
  animation: storyBgDrift 50s ease-in-out infinite;
  will-change: transform;
}

@keyframes storyBgDrift {
  0%   { transform: translate(0,    0)    scale(1.04); }
  33%  { transform: translate(-1%,  1%)   scale(1.06); }
  66%  { transform: translate(1%,  -0.5%) scale(1.05); }
  100% { transform: translate(0,    0)    scale(1.04); }
}

.enigma-view__story-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%);
}

.enigma-view__story-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 1.25rem 1.5rem 6rem;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.enigma-view__story-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1rem;
}

.enigma-view__story-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 0.5rem 0 1rem;
}

.enigma-view__story-label {
  font-family: 'Cinzel', serif;
  font-size: 0.85rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #8a6030;
  margin-bottom: 1.5rem;
  text-align: center;
}

.enigma-view__story-para {
  font-family: 'IM Fell English', serif;
  font-size: 1.1rem;
  line-height: 1.4;
  color: #e8d8b8;
  margin-bottom: 0.7rem;
}

.enigma-view__story-cta {
  background: rgba(90, 56, 24, 0.85);
  color: #f2e8d0;
  border: 1px solid rgba(201, 169, 110, 0.4);
  padding: 1rem;
  border-radius: 8px;
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  cursor: pointer;
  width: 100%;
  backdrop-filter: blur(4px);
  transition: opacity 0.2s;
  margin-top: 0.75rem;
}

.enigma-view__story-cta:hover {
  opacity: 0.85;
}

/* ── PHASE ÉNIGME ── */
.enigma-view__game {
  position: relative;
}

.enigma-view__overlay-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%);
}

/* ── CONFIRMATION INDICE ── */
.enigma-view__confirm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
}

.enigma-view__confirm {
  width: 100%;
  background: #100a04;
  border-top: 1px solid rgba(201, 169, 110, 0.4);
  border-radius: 20px 20px 0 0;
  padding: 1.5rem 1.5rem 2.5rem;
  animation: slideFromBottom 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  margin-bottom: 4.5rem; /* évite la BottomNav */
}

@keyframes slideFromBottom {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

.enigma-view__confirm-title {
  font-family: 'Cinzel', serif;
  font-size: 1rem;
  font-weight: 700;
  color: #f2e8d0;
  margin-bottom: 0.5rem;
  letter-spacing: 0.05em;
}

.enigma-view__confirm-body {
  font-family: 'Crimson Pro', serif;
  font-size: 1rem;
  color: #a08060;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.enigma-view__confirm-actions {
  display: flex;
  gap: 0.75rem;
}

.enigma-view__confirm-cancel {
  flex: 1;
  padding: 0.85rem;
  border-radius: 10px;
  border: 1px solid rgba(242, 232, 208, 0.2);
  background: transparent;
  color: #a08060;
  font-family: 'Cinzel', serif;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  cursor: pointer;
}

.enigma-view__confirm-ok {
  flex: 1;
  padding: 0.85rem;
  border-radius: 10px;
  border: none;
  background: #c9a96e;
  color: #1a0d02;
  font-family: 'Cinzel', serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  cursor: pointer;
}

/* ── INDICE ── */
.enigma-view__hint {
  position: fixed;
  bottom: 7rem;
  left: 1rem;
  right: 1rem;
  z-index: 50;
  background: rgba(10, 6, 2, 0.96);
  border: 1px solid rgba(201, 169, 110, 0.6);
  border-radius: 14px;
  padding: 1.1rem 1.4rem;
  backdrop-filter: blur(12px);
  box-shadow:
    0 0 0 1px rgba(201, 169, 110, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.6),
    0 0 20px rgba(201, 169, 110, 0.08);
  animation: hintSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes hintSlideUp {
  from { transform: translateY(12px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.enigma-view__hint-label {
  font-family: 'Cinzel', serif;
  font-size: 0.6rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #c9a96e;
  margin-bottom: 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.enigma-view__hint-label::before {
  content: '💡';
  font-size: 0.75rem;
}

.enigma-view__hint-text {
  font-family: 'IM Fell English', serif;
  font-size: 1.1rem;
  color: #f0e0c0;
  line-height: 1.6;
  font-style: italic;
}

.enigma-view__hint-cost {
  font-family: 'Cinzel', serif;
  font-size: 0.58rem;
  letter-spacing: 0.15em;
  color: #6a4820;
  margin-top: 0.75rem;
  padding-top: 0.6rem;
  border-top: 1px solid rgba(201, 169, 110, 0.15);
}

/* ── RÉSOLUE ── */
.enigma-view__solved-icon {
  font-family: 'Cinzel', serif;
  font-size: 3rem;
  color: #c9a96e;
}
</style>
