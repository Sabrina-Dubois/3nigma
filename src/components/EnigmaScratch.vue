<template>
  <div
    class="sc"
    ref="containerRef"
    :class="{ 'sc--error': answerError }"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >

    <!-- Fond (image du rebord ou couleur sombre) -->
    <div class="sc__bg" :style="bgStyle"></div>

    <!-- Voile sombre -->
    <div class="sc__veil"></div>

    <!-- Couche révélée : texte gravé -->
    <div class="sc__reveal" :style="revealStyle">
      <p
        v-for="(line, i) in messageLines"
        :key="i"
        class="sc__line"
        :class="{ 'sc__line--symbol': line.startsWith('Δ') }"
      >{{ line }}</p>
    </div>

    <!-- Canvas de poussière (layer du dessus) -->
    <canvas
      class="sc__canvas"
      ref="canvasRef"
      @pointerdown="onDown"
    ></canvas>

    <!-- Instruction (disparaît après le premier grattage) -->
    <p class="sc__hint" :style="{ opacity: hasScratchStarted ? 0 : 1 }">
      ↑ Gratte pour révéler le message
    </p>

    <!-- Barre de progression -->
    <div class="sc__progress-bar">
      <div class="sc__progress-fill" :style="{ width: `${progress}%` }"></div>
    </div>

    <!-- Input + submit (apparaît quand message révélé) -->
    <transition name="sc-slide">
      <div v-if="isComplete && !autoAnswer" class="sc__submit-panel">
        <p class="sc__submit-label">Message révélé — Quelle est la réponse ?</p>
        <form class="sc__submit-form" @submit.prevent="onSubmit">
          <input
            ref="answerInputRef"
            v-model="answer"
            type="text"
            class="sc__input"
            placeholder="Votre réponse..."
            autocomplete="off"
            autocapitalize="characters"
          />
          <button class="sc__button">Valider</button>
        </form>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  enigma: { type: Object, required: true },
  answerError: { type: Boolean, default: false },
})
const emit = defineEmits(['submit'])

// ── CONFIG ──
const imageUrl    = computed(() => props.enigma?.config?.image ? `/enigmas/${props.enigma.config.image}` : null)
const revealColor = computed(() => props.enigma?.config?.reveal_color  ?? '#1a1a2e')
const scratchColor= computed(() => props.enigma?.config?.scratch_color ?? '#8B7355')
const messageLines= computed(() => props.enigma?.config?.message_lines ?? [])
const threshold   = computed(() => props.enigma?.config?.completion_threshold ?? 85)
const autoAnswer  = computed(() => props.enigma?.config?.auto_answer ?? null)

// ── REFS DOM ──
const containerRef  = ref(null)
const canvasRef     = ref(null)
const answerInputRef= ref(null)

// ── STATE ──
const answer          = ref('')
const progress        = ref(0)
const isComplete      = ref(false)
const hasScratchStarted = ref(false)
let ctx         = null
let isDrawing   = false
let lastX       = 0
let lastY       = 0
let checkHandle = null

// ── STYLES ──
const bgStyle = computed(() => ({
  backgroundImage: imageUrl.value ? `url(${imageUrl.value})` : 'none',
}))

const revealStyle = computed(() => ({
  backgroundColor: revealColor.value,
}))

// ── CANVAS INIT ──
function initCanvas() {
  const canvas    = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) return

  const rect       = container.getBoundingClientRect()
  canvas.width     = rect.width
  canvas.height    = rect.height

  ctx = canvas.getContext('2d')

  // Couche de poussière principale
  ctx.fillStyle = scratchColor.value
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Texture grain aléatoire
  ctx.globalCompositeOperation = 'source-over'
  for (let i = 0; i < 1800; i++) {
    const alpha = Math.random() * 0.18
    ctx.fillStyle = `rgba(0,0,0,${alpha})`
    ctx.fillRect(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() * 4 + 1,
      Math.random() * 2 + 0.5,
    )
  }
}

// ── GRATTAGE ──
function getPos(e) {
  const rect = canvasRef.value.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function scratch(x, y) {
  if (!ctx) return
  ctx.globalCompositeOperation = 'destination-out'

  // Cercle sous le doigt
  ctx.beginPath()
  ctx.arc(x, y, 30, 0, Math.PI * 2)
  ctx.fill()

  // Ligne entre le point précédent et le courant → trait fluide
  if (isDrawing) {
    ctx.beginPath()
    ctx.lineWidth = 60
    ctx.lineCap   = 'round'
    ctx.lineJoin  = 'round'
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  lastX = x
  lastY = y
}

function checkProgress() {
  if (!ctx || isComplete.value) return
  const { width, height } = canvasRef.value
  const data = ctx.getImageData(0, 0, width, height).data
  let transparent = 0
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 128) transparent++
  }
  progress.value = (transparent / (width * height)) * 100

  if (progress.value >= threshold.value) {
    isComplete.value = true
    progress.value   = 100
    ctx.clearRect(0, 0, width, height)
    // Auto-submit si la réponse est dans la config
    if (autoAnswer.value) {
      nextTick(() => emit('submit', autoAnswer.value))
    } else {
      nextTick(() => answerInputRef.value?.focus())
    }
  }
}

// ── POINTER EVENTS ──
function onDown(e) {
  e.preventDefault()
  isDrawing = true
  hasScratchStarted.value = true
  e.target.setPointerCapture(e.pointerId)
  const { x, y } = getPos(e)
  lastX = x
  lastY = y
  scratch(x, y)
}

function onMove(e) {
  if (!isDrawing) return
  const { x, y } = getPos(e)
  scratch(x, y)
  // Calcul du % limité dans le temps (getImageData est coûteux)
  if (!checkHandle) {
    checkHandle = setTimeout(() => {
      checkProgress()
      checkHandle = null
    }, 250)
  }
}

function onUp() {
  isDrawing = false
}

// ── SUBMIT ──
function onSubmit() {
  if (!answer.value.trim()) return
  emit('submit', answer.value.trim())
}

// ── LIFECYCLE ──
onMounted(() => {
  initCanvas()
  window.addEventListener('resize', initCanvas)
})

onUnmounted(() => {
  window.removeEventListener('resize', initCanvas)
  if (checkHandle) clearTimeout(checkHandle)
})
</script>

<style scoped>
/* ── SCÈNE ── */
.sc {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}

.sc--error {
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
.sc__bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.sc__veil {
  position: absolute;
  inset: 0;
  background: rgba(5, 3, 15, 0.25);
}

/* ── COUCHE RÉVÉLÉE ── */
.sc__reveal {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  padding: 2rem;
}

.sc__line {
  font-family: 'Cinzel', serif;
  font-size: clamp(1rem, 4vw, 1.4rem);
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #c8b89a;
  text-align: center;
  line-height: 1.4;
}

.sc__line--symbol {
  font-size: clamp(1.3rem, 5vw, 2rem);
  color: #ffe890;
  text-shadow: 0 0 12px rgba(255, 220, 100, 0.6);
  margin-top: 0.5rem;
}

/* ── CANVAS ── */
.sc__canvas {
  position: absolute;
  inset: 0;
  touch-action: none;
  cursor: crosshair;
}

/* ── INSTRUCTION ── */
.sc__hint {
  position: absolute;
  bottom: 14%;
  left: 0;
  right: 0;
  text-align: center;
  font-family: 'Cinzel', serif;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #8a7a6a;
  pointer-events: none;
  z-index: 10;
  transition: opacity 0.6s ease;
}

/* ── BARRE DE PROGRESSION ── */
.sc__progress-bar {
  position: absolute;
  bottom: 10%;
  left: 10%;
  right: 10%;
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  z-index: 10;
  overflow: hidden;
}

.sc__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8B7355, #c8a870);
  border-radius: 2px;
  transition: width 0.25s ease;
}

/* ── PANNEAU SUBMIT ── */
.sc__submit-panel {
  position: absolute;
  bottom: 4.5rem;
  left: 0;
  right: 0;
  background: rgba(10, 8, 20, 0.96);
  border-top: 1px solid rgba(200, 184, 154, 0.2);
  padding: 1.5rem 1.5rem 2.5rem;
  z-index: 20;
}

.sc__submit-label {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #8a7060;
  margin-bottom: 1rem;
  text-align: center;
}

.sc__submit-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sc__input {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(200, 184, 154, 0.25);
  background: rgba(255, 255, 255, 0.05);
  font-family: 'Cinzel', serif;
  font-size: 1rem;
  letter-spacing: 0.15em;
  color: #ffe890;
  text-transform: uppercase;
}

.sc__input:focus {
  outline: none;
  border-color: rgba(200, 184, 154, 0.6);
}

.sc__button {
  background: rgba(90, 56, 18, 0.9);
  color: #ffe890;
  border: 1px solid rgba(255, 200, 80, 0.35);
  padding: 0.75rem;
  border-radius: 8px;
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  cursor: pointer;
  transition: opacity 0.2s;
}

.sc__button:hover {
  opacity: 0.85;
}

/* ── TRANSITION ── */
.sc-slide-enter-active { transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
.sc-slide-enter-from   { transform: translateY(100%); }
.sc-slide-enter-to     { transform: translateY(0); }
</style>
