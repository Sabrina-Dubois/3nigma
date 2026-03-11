<template>
  <div
    class="ms"
    ref="sceneRef"
    :class="{ 'ms--error': answerError }"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >

    <!-- Fond nocturne -->
    <div class="ms__bg" :style="{ backgroundImage: `url(${imageUrl})` }"></div>

    <!-- Voile sombre général -->
    <div class="ms__veil"></div>

    <!-- Ciel étoilé -->
    <StarField :count="120" />

    <!-- Halo de lumière projeté par la lune sur toute la scène -->
    <div class="ms__halo" :style="haloStyle"></div>

    <!-- Lune draggable -->
    <div class="ms__moon" :style="moonStyle" @pointerdown="onDown">
      <div class="ms__moon-face"></div>
      <div class="ms__moon-corona"></div>
    </div>

    <!-- Panneau illuminé -->
    <div class="ms__panel" ref="panelRef" :style="panelStyle">
      <p class="ms__panel-label">— Panneau —</p>
      <p class="ms__secret" :style="secretStyle">{{ hiddenSymbol }}</p>
      <button v-if="isRevealed" class="ms__delta" @click="emit('submit', answer)">
        Soumettre
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import StarField from '@/components/StarField.vue'

const props = defineProps({
  enigma: { type: Object, required: true },
  answerError: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])

// ── REFS DOM ──
const sceneRef = ref(null)
const panelRef = ref(null)

// ── STATE ──
const isDragging = ref(false)
const hasMoved = ref(false)
const moonX = ref(0)   // px dans la scène
const moonY = ref(0)
const panelCX = ref(0) // centre du panneau
const panelCY = ref(0)
const sceneW = ref(0)
const sceneH = ref(0)

const MOON_R = 32 // rayon de la lune en px

// ── ENIGMA DATA ──
const hiddenSymbol = computed(() => props.enigma?.config?.hidden_symbol ?? 'Δ')
const answer      = computed(() => hiddenSymbol.value)
const imageUrl    = computed(() => props.enigma?.config?.image ?? '/enigmas/eclipse/jour1-skyline.jpg')

// ── DISTANCE lune → panneau ──
const dist = computed(() => {
  const dx = moonX.value - panelCX.value
  const dy = moonY.value - panelCY.value
  return Math.sqrt(dx * dx + dy * dy)
})

// ── INTENSITÉ lumineuse (0 → 1) ──
const lightIntensity = computed(() => {
  if (sceneW.value === 0) return 0
  const maxDist = sceneW.value * 0.55
  return Math.max(0, 1 - dist.value / maxDist)
})

// Une fois révélé, ça reste — même si la lune s'éloigne
const isRevealed = ref(false)
watch(lightIntensity, (val) => {
  if (val > 0.74) isRevealed.value = true
})

// ── STYLES CALCULÉS ──

const moonStyle = computed(() => ({
  transform: `translate(calc(${moonX.value}px - 50%), calc(${moonY.value}px - 50%))`,
  cursor: isDragging.value ? 'grabbing' : 'grab',
}))

// Grand halo centré sur la lune, couvre toute la scène
const haloStyle = computed(() => {
  const i = lightIntensity.value
  return {
    background: `radial-gradient(circle at ${moonX.value}px ${moonY.value}px,
      rgba(255, 225, 140, ${0.15 + i * 0.25}) 0%,
      rgba(255, 190, 70,  ${0.06 + i * 0.12}) 18%,
      transparent 52%)`,
  }
})

// Panneau : filtre brightness selon intensité
const panelStyle = computed(() => ({
  filter: `brightness(${0.2 + lightIntensity.value * 0.9})`,
  boxShadow: isRevealed.value
    ? `0 0 40px 12px rgba(255, 200, 80, ${lightIntensity.value * 0.5})`
    : 'none',
}))

// Texte secret : opacité liée à l'intensité
const secretStyle = computed(() => ({
  opacity: Math.max(0, (lightIntensity.value - 0.4) / 0.35),
  textShadow: isRevealed.value ? '0 0 18px rgba(255, 230, 150, 0.9)' : 'none',
}))

// ── INIT positions ──
onMounted(() => {
  const sr = sceneRef.value.getBoundingClientRect()
  const pr = panelRef.value.getBoundingClientRect()

  // Positions D'ABORD — sinon sceneW déclenche lightIntensity avec dist=0 → isRevealed=true
  moonX.value = sr.width * 0.22
  moonY.value = sr.height * 0.18
  panelCX.value = pr.left - sr.left + pr.width / 2
  panelCY.value = pr.top - sr.top + pr.height / 2

  // sceneW EN DERNIER — lightIntensity recalcule avec la bonne distance
  sceneW.value = sr.width
  sceneH.value = sr.height
})

// ── POINTER EVENTS ──
function onDown(e) {
  e.preventDefault()
  isDragging.value = true
  e.target.setPointerCapture(e.pointerId)
}

function onMove(e) {
  if (!isDragging.value) return
  hasMoved.value = true
  const rect = sceneRef.value.getBoundingClientRect()
  moonX.value = Math.max(MOON_R, Math.min(sceneW.value - MOON_R, e.clientX - rect.left))
  moonY.value = Math.max(MOON_R, Math.min(sceneH.value - MOON_R, e.clientY - rect.top))
}

function onUp() {
  isDragging.value = false
}
</script>

<style scoped>
/* ── SCÈNE ── */
.ms {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}

.ms--error {
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%   { transform: translateX(0); }
  20%  { transform: translateX(-7px); }
  40%  { transform: translateX(7px); }
  60%  { transform: translateX(-5px); }
  80%  { transform: translateX(5px); }
  100% { transform: translateX(0); }
}

/* ── FOND ── */
.ms__bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center bottom;
  background-repeat: no-repeat;
  background-color: #050308;
  animation: bgDrift 45s ease-in-out infinite;
  will-change: transform;
}

/* Dérive inverse et légèrement plus rapide → effet parallax avec les étoiles */
@keyframes bgDrift {
  0%   { transform: translate(0,    0) scale(1.04); }
  25%  { transform: translate(-1%, -0.8%) scale(1.05); }
  50%  { transform: translate(0,   -1.5%) scale(1.04); }
  75%  { transform: translate(1%,  -0.8%) scale(1.05); }
  100% { transform: translate(0,    0) scale(1.04); }
}

/* Voile sombre pour assombrir l'image de base */
.ms__veil {
  position: absolute;
  inset: 0;
  background: rgba(2, 1, 8, 0.72);
}

/* ── HALO ── */
.ms__halo {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: background 0.08s linear;
}

/* ── LUNE ── */
.ms__moon {
  position: absolute;
  top: 0;
  left: 0;
  width: 64px;
  height: 64px;
  touch-action: none;
  z-index: 20;
}

.ms__moon-face {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: radial-gradient(circle at 38% 35%,
    #fffde0 0%,
    #f0d880 40%,
    #c8a840 75%,
    #9a7820 100%
  );
  box-shadow:
    inset -4px -4px 10px rgba(0, 0, 0, 0.25),
    0 0 16px 6px rgba(255, 220, 100, 0.35),
    0 0 40px 14px rgba(255, 190, 60, 0.15);
}

.ms__moon-corona {
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  background: radial-gradient(circle,
    transparent 45%,
    rgba(255, 210, 80, 0.12) 60%,
    transparent 75%
  );
  animation: coronaPulse 3s ease-in-out infinite;
}

@keyframes coronaPulse {
  0%, 100% { transform: scale(1);   opacity: 1; }
  50%       { transform: scale(1.1); opacity: 0.7; }
}

/* ── PANNEAU ── */
.ms__panel {
  position: absolute;
  bottom: 18%;
  left: 50%;
  transform: translateX(-50%);
  width: min(82%, 320px);
  background: #1a1008;
  border: 2px solid #4a3010;
  border-radius: 6px;
  padding: 1.25rem 1.5rem;
  text-align: center;
  z-index: 10;
  transition: filter 0.12s linear, box-shadow 0.12s linear;
}

/* Texture légère sur le panneau */
.ms__panel::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 4px;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(255,255,255,0.015) 3px,
    rgba(255,255,255,0.015) 4px
  );
  pointer-events: none;
}

.ms__panel-label {
  font-family: 'Cinzel', serif;
  font-size: 0.85rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #6a5020;
  margin-bottom: 0.75rem;
}

.ms__secret {
  font-family: 'Cinzel', serif;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  color: #ffe890;
  min-height: 2.5rem;
  transition: opacity 0.2s ease, text-shadow 0.2s ease;
}

.ms__delta {
  margin-top: 1rem;
  background: rgba(90, 56, 18, 0.9);
  color: #ffe890;
  border: 1px solid rgba(255, 200, 80, 0.4);
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  cursor: pointer;
  transition: opacity 0.2s;
}

.ms__delta:hover {
  opacity: 0.85;
}

/* ── INSTRUCTION ── */
.ms__instruction {
  position: absolute;
  bottom: 10%;
  left: 0;
  right: 0;
  text-align: center;
  font-family: 'Cinzel', serif;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #8a6830;
  pointer-events: none;
  transition: opacity 0.6s ease;
  z-index: 30;
}
</style>
