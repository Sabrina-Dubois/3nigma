<template>
  <div class="vinyl">

    <p class="vinyl__question">{{ enigma.question }}</p>

    <!-- Platine -->
    <div class="vinyl__deck">

      <!-- Disque -->
      <div class="vinyl__disc" :class="{ 'vinyl__disc--spin': isPlaying, 'vinyl__disc--scratch': scratching }">
        <!-- Sillons -->
        <div v-for="i in 7" :key="i" class="vinyl__groove" :style="grooveStyle(i)" />
        <!-- Label central -->
        <div class="vinyl__label">
          <p class="vinyl__label-artist">{{ config.artist }}</p>
          <div class="vinyl__label-dot" />
        </div>
        <!-- Indicateur de position aiguille -->
        <div class="vinyl__needle-line" :style="needleLineStyle" />
      </div>

      <!-- Bras tourne-disque -->
      <div class="vinyl__arm-wrap" :style="armStyle">
        <div class="vinyl__arm" />
        <div class="vinyl__arm-head" />
      </div>

    </div>

    <!-- Slider aiguille -->
    <div class="vinyl__slider-wrap">
      <span class="vinyl__slider-label">⟵ extérieur</span>
      <input
        type="range"
        class="vinyl__slider"
        min="0"
        max="100"
        step="1"
        v-model.number="sliderVal"
        @input="onSliderChange"
      />
      <span class="vinyl__slider-label">intérieur ⟶</span>
    </div>

    <!-- Fragment audio -->
    <Transition name="fragment">
      <div v-if="currentFragment" class="vinyl__fragment" :key="currentFragment">
        <span class="vinyl__fragment-icon">♪</span>
        <span class="vinyl__fragment-text">{{ currentFragment }}</span>
        <span class="vinyl__fragment-icon">♪</span>
      </div>
    </Transition>

    <!-- Zones trouvées -->
    <div class="vinyl__dots">
      <div
        v-for="(zone, i) in playableZones"
        :key="i"
        class="vinyl__dot"
        :class="{ 'vinyl__dot--found': foundZones.has(i) }"
      />
    </div>

    <!-- Révélation du titre -->
    <Transition name="reveal">
      <div v-if="allFound" class="vinyl__reveal">
        <p class="vinyl__reveal-label">Titre identifié</p>
        <p class="vinyl__reveal-title">{{ config.song_title }}</p>
      </div>
    </Transition>

    <p class="vinyl__hint" :class="{ 'vinyl__hint--scratch': scratching }">
      {{ scratching ? 'Sillon rayé…' : (enigma.hint ?? 'Déplace l\'aiguille') }}
    </p>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  enigma: { type: Object, required: true },
  answerError: { type: Boolean, default: false },
})
const emit = defineEmits(['submit'])

const config = computed(() => {
  if (!props.enigma?.config) return {}
  if (typeof props.enigma.config === 'string') {
    try { return JSON.parse(props.enigma.config) } catch { return {} }
  }
  return props.enigma.config
})

const playableZones = computed(() => config.value.playable_zones ?? [0.2, 0.5, 0.8])
const scratchedZones = computed(() => config.value.scratched_zones ?? [])

// Fragments affichés quand on trouve une zone (si fournis, sinon notes)
const FRAGMENTS = ['…des yeux qui font baisser les miens…', '…il me dit des mots d\'amour…', '…la vie en rose…']

const sliderVal = ref(0)
const foundZones = ref(new Set())
const isPlaying = ref(false)
const scratching = ref(false)
const currentFragment = ref(null)
const allFound = ref(false)

let playTimeout = null
let fragmentTimeout = null

// Ligne de position de l'aiguille (angle radial sur le disque)
const needleLineStyle = computed(() => {
  const angle = sliderVal.value * 2.7 // 0 → 270° (de l'extérieur vers l'intérieur)
  return { transform: `rotate(${angle}deg)` }
})

// Style du bras tourne-disque (pivote en haut à droite)
const armStyle = computed(() => {
  const angle = -20 + sliderVal.value * 0.35 // pivote de -20° à +15°
  return { transform: `rotate(${angle}deg)` }
})

function grooveStyle(i) {
  const pct = 20 + i * 8
  return {
    width: pct + '%',
    height: pct + '%',
    top: (50 - pct / 2) + '%',
    left: (50 - pct / 2) + '%',
  }
}

function onSliderChange() {
  const pos = sliderVal.value / 100

  // Vérif zone rayée
  const nearScratched = scratchedZones.value.some(z => Math.abs(pos - z) < 0.04)
  if (nearScratched) {
    triggerScratch()
    return
  }

  // Vérif zone lisible
  playableZones.value.forEach((z, i) => {
    if (!foundZones.value.has(i) && Math.abs(pos - z) < 0.05) {
      foundZones.value = new Set([...foundZones.value, i])
      triggerPlay(i)
    }
  })
}

function triggerPlay(zoneIndex) {
  clearTimeout(playTimeout)
  clearTimeout(fragmentTimeout)

  isPlaying.value = true
  const frags = config.value.fragments ?? FRAGMENTS
  currentFragment.value = frags[zoneIndex] ?? '♪ …'

  playTimeout = setTimeout(() => { isPlaying.value = false }, 2000)
  fragmentTimeout = setTimeout(() => { currentFragment.value = null }, 3000)

  if (foundZones.value.size === playableZones.value.length) {
    allFound.value = true
    setTimeout(() => emit('submit', config.value.song_title ?? ''), 2500)
  }
}

function triggerScratch() {
  scratching.value = true
  setTimeout(() => { scratching.value = false }, 500)
}
</script>

<style scoped>
.vinyl {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem 0;
}

.vinyl__question {
  font-family: 'IM Fell English', serif;
  font-size: 1.05rem;
  color: #f2e8d0;
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

/* Platine */
.vinyl__deck {
  position: relative;
  width: 100%;
  max-width: 260px;
  aspect-ratio: 1;
}

/* Disque */
.vinyl__disc {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at center, #1a1a1a 0%, #0d0d0d 100%);
  box-shadow:
    0 0 0 2px rgba(201, 169, 110, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

.vinyl__disc--spin {
  animation: spin 3s linear infinite;
}

.vinyl__disc--scratch {
  animation: scratch 0.15s steps(3) 3;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes scratch {
  0%   { transform: rotate(-3deg); }
  50%  { transform: rotate(3deg); }
  100% { transform: rotate(0deg); }
}

/* Sillons */
.vinyl__groove {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.04);
  pointer-events: none;
}

/* Label central */
.vinyl__label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32%;
  height: 32%;
  border-radius: 50%;
  background: radial-gradient(circle, #8B1a1a 0%, #5a0e0e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.3);
}

.vinyl__label-artist {
  font-family: 'Cinzel', serif;
  font-size: 0.32rem;
  letter-spacing: 0.1em;
  color: rgba(242, 232, 208, 0.8);
  text-align: center;
  margin: 0;
  text-transform: uppercase;
}

.vinyl__label-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0d0d0d;
}

/* Ligne de position */
.vinyl__needle-line {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50%;
  height: 1px;
  background: rgba(201, 169, 110, 0.3);
  transform-origin: left center;
  pointer-events: none;
}

/* Bras tourne-disque */
.vinyl__arm-wrap {
  position: absolute;
  top: -8%;
  right: -4%;
  width: 18%;
  transform-origin: top right;
  z-index: 2;
}

.vinyl__arm {
  width: 4px;
  height: 130%;
  background: linear-gradient(to bottom, #888 0%, #555 100%);
  border-radius: 2px;
  margin-left: auto;
}

.vinyl__arm-head {
  width: 10px;
  height: 6px;
  background: #444;
  border-radius: 2px;
  margin-left: auto;
  margin-top: -1px;
}

/* Slider */
.vinyl__slider-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.vinyl__slider-label {
  font-family: 'Cinzel', serif;
  font-size: 0.45rem;
  letter-spacing: 0.1em;
  color: rgba(201, 169, 110, 0.4);
  white-space: nowrap;
}

.vinyl__slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  outline: none;
}

.vinyl__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(201, 169, 110, 0.9);
  cursor: pointer;
  box-shadow: 0 0 6px rgba(201, 169, 110, 0.4);
}

/* Fragment audio */
.vinyl__fragment {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'IM Fell English', serif;
  font-style: italic;
  font-size: 0.85rem;
  color: rgba(201, 169, 110, 0.85);
  text-align: center;
  min-height: 1.5rem;
}

.vinyl__fragment-icon {
  font-style: normal;
  opacity: 0.6;
}

.fragment-enter-active { transition: all 0.4s ease; }
.fragment-leave-active { transition: all 0.4s ease; }
.fragment-enter-from, .fragment-leave-to { opacity: 0; transform: translateY(-6px); }

/* Points de progression */
.vinyl__dots {
  display: flex;
  gap: 0.5rem;
}

.vinyl__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(201, 169, 110, 0.2);
  transition: background 0.3s, box-shadow 0.3s;
}

.vinyl__dot--found {
  background: rgba(201, 169, 110, 0.8);
  box-shadow: 0 0 6px rgba(201, 169, 110, 0.4);
}

/* Révélation titre */
.vinyl__reveal {
  text-align: center;
}

.vinyl__reveal-label {
  font-family: 'Cinzel', serif;
  font-size: 0.55rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(201, 169, 110, 0.5);
  margin: 0 0 0.3rem;
}

.vinyl__reveal-title {
  font-family: 'IM Fell English', serif;
  font-size: 1.3rem;
  font-style: italic;
  color: #c9a96e;
  margin: 0;
}

.reveal-enter-active { transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
.reveal-enter-from   { opacity: 0; transform: scale(0.9); }

/* Hint */
.vinyl__hint {
  font-family: 'Cinzel', serif;
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(242, 232, 208, 0.35);
  text-align: center;
  transition: color 0.2s;
}

.vinyl__hint--scratch {
  color: rgba(220, 80, 60, 0.75);
}
</style>
