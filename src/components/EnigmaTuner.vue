<template>
  <div class="rt" :class="{ 'rt--error': answerError }">

    <!-- Corps de la radio -->
    <div class="rt__body" :class="{ 'rt__body--locked': isLocked }">

      <!-- Écran LCD + barres signal -->
      <div class="rt__top">
        <div class="rt__screen">
          <span class="rt__freq-num">{{ displayFreq }}</span>
          <span class="rt__freq-unit">FM</span>
          <div class="rt__scanlines"></div>
        </div>
        <div class="rt__signal-group">
          <div class="rt__bars">
            <div
              v-for="i in 5" :key="i"
              class="rt__bar"
              :class="{ 'rt__bar--on': signalBars >= i }"
              :style="{ height: (i * 5 + 4) + 'px' }"
            ></div>
          </div>
          <div class="rt__led" :class="ledClass"></div>
        </div>
      </div>

      <!-- Antenne -->

      <!-- Grille haut-parleur -->
      <div class="rt__speaker">
        <div class="rt__grille">
          <span v-for="i in 40" :key="i" class="rt__dot"></span>
        </div>
        <div class="rt__waves" :class="{ 'rt__waves--on': isNearTarget && !isLocked }">
          <span v-for="i in 4" :key="i"></span>
        </div>
      </div>

      <!-- Zone tuner (drag) -->
      <div
        class="rt__tuner"
        ref="trackRef"
        @pointerdown="onDown"
        @pointermove="onMove"
        @pointerup="onUp"
        @pointercancel="onUp"
      >
        <div class="rt__rail">
          <!-- Tirets de fréquences -->
          <div
            v-for="f in config.frequencies"
            :key="f"
            class="rt__tick"
            :style="{ left: freqToPercent(f) + '%' }"
          ></div>
          <!-- Aiguille -->
          <div class="rt__needle" :style="{ left: needlePercent + '%' }">
            <div class="rt__needle-stem"></div>
            <div class="rt__needle-cap"></div>
          </div>
        </div>
        <!-- Graduations -->
        <div class="rt__scale">
          <span
            v-for="f in config.frequencies"
            :key="f"
            class="rt__flabel"
            :style="{ left: freqToPercent(f) + '%' }"
          >{{ f }}</span>
        </div>
      </div>

      <div class="rt__brand">CHRONOCAST · 3nigma°</div>
    </div>

    <!-- Instruction -->
    <p class="rt__hint" :style="{ opacity: hasTuned ? 0 : 1 }">
      ↔ Fais glisser le tuner
    </p>

    <!-- Message voix révélé après verrouillage -->
    <transition name="rt-reveal">
      <div v-if="isLocked" class="rt__voice">
        <p class="rt__voice-text">{{ config.voice_message }}</p>
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
const config = computed(() => ({
  frequencies:       [1.2, 2.1, 2.9, 3.4, 3.7, 4.3, 5.0],
  target_frequency:  3.7,
  target_threshold:  0.15,
  audio_tracks:      {},
  voice_message:     '',
  ...props.enigma?.config,
}))

// ── REFS ──
const trackRef = ref(null)

// ── STATE ──
const currentFreq = ref(null) // initialisé dans onMounted
const isLocked    = ref(false)
const hasTuned    = ref(false)
let isDragging    = false
let trackRect     = null

// ── COMPUTED ──
const minFreq = computed(() => config.value.frequencies[0])
const maxFreq = computed(() => config.value.frequencies[config.value.frequencies.length - 1])

const displayFreq    = computed(() => (currentFreq.value ?? minFreq.value).toFixed(1))
const needlePercent  = computed(() => freqToPercent(currentFreq.value ?? minFreq.value))

function freqToPercent(f) {
  return ((f - minFreq.value) / (maxFreq.value - minFreq.value)) * 100
}

const proximity = computed(() => {
  if (currentFreq.value === null) return 0
  const dist   = Math.abs(currentFreq.value - config.value.target_frequency)
  const thresh = config.value.target_threshold ?? 0.15
  return Math.max(0, 1 - dist / thresh)
})

const signalBars  = computed(() => Math.round(proximity.value * 5))
const isNearTarget = computed(() => proximity.value > 0)

const ledClass = computed(() => {
  if (isLocked.value)         return 'rt__led--green'
  if (proximity.value > 0.6)  return 'rt__led--bright'
  if (proximity.value > 0)    return 'rt__led--orange'
  return 'rt__led--dim'
})

// ── AUDIO (Web Audio API — génératif, sans fichiers) ──
let audioCtx     = null
let noiseGain    = null   // gain du bruit statique
let signalGain   = null   // gain de l'oscillateur signal
let noiseSource  = null
let signalOsc    = null
let audioStarted = false
let crackleTimer = null
let lastWordTimeout = null

function buildNoiseBuffer(ctx) {
  const len    = ctx.sampleRate * 3 // buffer de 3s en boucle
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
  const data   = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

function startAudio() {
  if (audioStarted) return
  audioStarted = true

  try {
    const AudioCtx = window.AudioContext || window['webkitAudioContext']
    audioCtx = new AudioCtx()

    const dest = audioCtx.destination

    // ── Bruit statique FM ──
    const noiseBuf  = buildNoiseBuffer(audioCtx)
    noiseSource      = audioCtx.createBufferSource()
    noiseSource.buffer = noiseBuf
    noiseSource.loop   = true

    const bandpass     = audioCtx.createBiquadFilter()
    bandpass.type      = 'bandpass'
    bandpass.frequency.value = 1600
    bandpass.Q.value   = 0.7

    noiseGain = audioCtx.createGain()
    noiseGain.gain.value = 0.55

    noiseSource.connect(bandpass)
    bandpass.connect(noiseGain)
    noiseGain.connect(dest)
    noiseSource.start()

    // ── Oscillateur signal (monte en approchant la cible) ──
    signalOsc           = audioCtx.createOscillator()
    signalOsc.type      = 'sine'
    signalOsc.frequency.value = 880

    const signalFilter  = audioCtx.createBiquadFilter()
    signalFilter.type   = 'bandpass'
    signalFilter.frequency.value = 880
    signalFilter.Q.value = 8

    signalGain = audioCtx.createGain()
    signalGain.gain.value = 0

    signalOsc.connect(signalFilter)
    signalFilter.connect(signalGain)
    signalGain.connect(dest)
    signalOsc.start()

    scheduleCrackle()
  } catch (e) {
    console.warn('[Tuner] Web Audio non disponible', e)
  }
}

function updateAudio() {
  if (!audioCtx || !noiseGain) return
  const p   = proximity.value
  const now = audioCtx.currentTime

  // Statique s'atténue en approchant la cible
  noiseGain.gain.setTargetAtTime(Math.max(0.04, 0.55 * (1 - p)), now, 0.06)
  // Signal pur monte
  signalGain.gain.setTargetAtTime(p * 0.18, now, 0.06)
}

function scheduleCrackle() {
  if (!audioCtx) return
  const delay = 150 + Math.random() * 700
  crackleTimer = setTimeout(() => {
    if (audioCtx && !isLocked.value && proximity.value < 0.95) fireCrackle()
    scheduleCrackle()
  }, delay)
}

function fireCrackle() {
  try {
    const duration = 0.02 + Math.random() * 0.07
    const now      = audioCtx.currentTime
    const amp      = (0.15 + Math.random() * 0.45) * (1 - proximity.value * 0.85)

    const buf  = audioCtx.createBuffer(1, Math.ceil(audioCtx.sampleRate * duration), audioCtx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1

    const src = audioCtx.createBufferSource()
    src.buffer = buf

    const hp  = audioCtx.createBiquadFilter()
    hp.type   = 'highpass'
    hp.frequency.value = 2500 + Math.random() * 3000

    const g = audioCtx.createGain()
    g.gain.setValueAtTime(0, now)
    g.gain.linearRampToValueAtTime(amp, now + 0.004)
    g.gain.linearRampToValueAtTime(0,   now + duration)

    src.connect(hp)
    hp.connect(g)
    g.connect(audioCtx.destination)
    src.start(now)
    src.stop(now + duration + 0.01)
  } catch (e) { /* noop */ }
}

function stopAllAudio() {
  if (crackleTimer) clearTimeout(crackleTimer)
  crackleTimer = null
  try {
    noiseSource?.stop()
    signalOsc?.stop()
    audioCtx?.close()
  } catch (e) { /* noop */ }
  audioCtx   = null
  noiseGain  = null
  signalGain = null
}

// ── DRAG ──
function onDown(e) {
  e.preventDefault()
  if (isLocked.value) return
  isDragging = true
  hasTuned.value = true
  e.target.setPointerCapture(e.pointerId)
  trackRect = trackRef.value.getBoundingClientRect()
  startAudio()
  applyFreq(e.clientX)
}

function onMove(e) {
  if (!isDragging || isLocked.value) return
  applyFreq(e.clientX)
}

function onUp() {
  isDragging = false
}

function applyFreq(clientX) {
  const pct = Math.max(0, Math.min(1, (clientX - trackRect.left) / trackRect.width))
  const raw = minFreq.value + pct * (maxFreq.value - minFreq.value)
  currentFreq.value = Math.round(raw * 10) / 10
  updateAudio()
  checkLock()
}

// ── VERROUILLAGE ──
function checkLock() {
  if (isLocked.value) return
  if (Math.abs(currentFreq.value - config.value.target_frequency) < 0.001) {
    isLocked.value = true
    stopAllAudio()
    playLockSound()
    playLastWord()
  }
}

function playLockSound() {
  try {
    const ctx = new (window.AudioContext || window['webkitAudioContext'])()
    const now = ctx.currentTime

    // Bip de confirmation — deux tons montants
    const tones = [440, 660, 880]
    tones.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, now + i * 0.12)
      gain.gain.linearRampToValueAtTime(0.18, now + i * 0.12 + 0.02)
      gain.gain.linearRampToValueAtTime(0, now + i * 0.12 + 0.18)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + i * 0.12)
      osc.stop(now + i * 0.12 + 0.2)
    })

    // Fond doux — sustain après les bips
    const pad = ctx.createOscillator()
    const padGain = ctx.createGain()
    pad.type = 'sine'
    pad.frequency.value = 220
    padGain.gain.setValueAtTime(0, now + 0.3)
    padGain.gain.linearRampToValueAtTime(0.06, now + 0.6)
    padGain.gain.linearRampToValueAtTime(0, now + 3.5)
    pad.connect(padGain)
    padGain.connect(ctx.destination)
    pad.start(now + 0.3)
    pad.stop(now + 3.6)
  } catch { /* noop */ }
}

function playLastWord() {
  const src = config.value.audio_tracks?.last_word
  let submitted = false

  const doSubmit = () => {
    if (submitted) return
    submitted = true
    nextTick(() => emit('submit', String(config.value.target_frequency)))
  }

  if (!src) {
    lastWordTimeout = setTimeout(doSubmit, 4000) // 4s pour lire le message
    return
  }

  const audio = new Audio(src)
  // Après la fin de l'audio, on attend encore 2s avant de soumettre
  audio.addEventListener('ended', () => { lastWordTimeout = setTimeout(doSubmit, 2000) })
  audio.addEventListener('error', () => { lastWordTimeout = setTimeout(doSubmit, 4000) })
  // Sécurité max
  lastWordTimeout = setTimeout(doSubmit, 15000)
  audio.play().catch(() => { lastWordTimeout = setTimeout(doSubmit, 4000) })
}

// ── LIFECYCLE ──
onMounted(() => {
  currentFreq.value = minFreq.value
})

onUnmounted(() => {
  stopAllAudio()
  if (lastWordTimeout) clearTimeout(lastWordTimeout)
})
</script>

<style scoped>
/* ── SCÈNE ── */
.rt {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1.5rem;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  overflow-x: hidden;
}

/* ── CORPS ── */
.rt__body {
  background: linear-gradient(160deg, #6a432b 0%, #412613 100%);
  border: 1px solid rgba(255, 220, 160, 0.22);
  border-radius: 18px;
  padding: 1.4rem;
  width: min(360px, 100%);
  box-shadow:
    0 28px 70px rgba(0, 0, 0, 0.75),
    inset 0 1px 0 rgba(255, 220, 160, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
}

.rt__body--locked {
  border-color: rgba(57, 224, 122, 0.25);
  box-shadow:
    0 28px 70px rgba(0, 0, 0, 0.75),
    0 0 40px rgba(57, 224, 122, 0.06),
    inset 0 1px 0 rgba(57, 224, 122, 0.08);
}

/* ── TOP ── */
.rt__top {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rt__screen {
  flex: 1;
  background: #060d00;
  border: 1px solid rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  padding: 0.55rem 1rem;
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.7);
}

.rt__freq-num {
  font-family: 'Courier New', monospace;
  font-size: 2.1rem;
  font-weight: 700;
  color: #f5a020;
  letter-spacing: 0.04em;
  text-shadow: 0 0 14px rgba(245, 160, 30, 0.75);
}

.rt__freq-unit {
  font-family: 'Cinzel', serif;
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  color: rgba(245, 160, 30, 0.4);
}

.rt__scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px, transparent 3px,
    rgba(0, 0, 0, 0.1) 3px, rgba(0, 0, 0, 0.1) 4px
  );
  pointer-events: none;
}

/* signal */
.rt__signal-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.rt__bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
}

.rt__bar {
  width: 5px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  transition: background 0.15s ease, box-shadow 0.15s ease;
}

.rt__bar--on {
  background: #f5a020;
  box-shadow: 0 0 6px rgba(245, 160, 30, 0.55);
}

.rt__body--locked .rt__bar--on {
  background: #39e07a;
  box-shadow: 0 0 8px rgba(57, 224, 122, 0.6);
}

/* LED */
.rt__led {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: background 0.2s, box-shadow 0.2s;
}

.rt__led--dim    { background: #1a1000; }
.rt__led--orange { background: #f5a020; box-shadow: 0 0 6px rgba(245,160,30,0.5); }
.rt__led--bright {
  background: #ffd060;
  box-shadow: 0 0 12px rgba(255, 210, 80, 0.9);
  animation: ledPulse 0.35s ease infinite alternate;
}
.rt__led--green  { background: #39e07a; box-shadow: 0 0 14px rgba(57,224,122,0.85); }

@keyframes ledPulse {
  from { opacity: 0.65; }
  to   { opacity: 1; }
}

/* ── HAUT-PARLEUR ── */
.rt__speaker {
  background: #0c0804;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.03);
  padding: 0.8rem;
  position: relative;
  overflow: hidden;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rt__grille {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 5px;
  width: 100%;
}

.rt__dot {
  width: 3px;
  height: 3px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 50%;
}

.rt__waves {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 5px;
}

.rt__waves span {
  display: block;
  width: 3px;
  height: 6px;
  background: rgba(245, 160, 30, 0.35);
  border-radius: 3px;
  transition: height 0.2s;
}

.rt__waves--on span {
  animation: waveBar 0.5s ease-in-out infinite alternate;
}
.rt__waves--on span:nth-child(1) { animation-delay: 0s;    }
.rt__waves--on span:nth-child(2) { animation-delay: 0.12s; }
.rt__waves--on span:nth-child(3) { animation-delay: 0.24s; }
.rt__waves--on span:nth-child(4) { animation-delay: 0.36s; }

@keyframes waveBar {
  from { height: 5px;  opacity: 0.3; transform: scaleY(0.4); }
  to   { height: 22px; opacity: 0.9; transform: scaleY(1); }
}

/* ── TUNER ── */
.rt__tuner {
  padding-bottom: 1.6rem;
  position: relative;
  touch-action: none;
  cursor: ew-resize;
}

.rt__rail {
  height: 4px;
  background: rgba(255, 220, 140, 0.55);
  border-radius: 2px;
  position: relative;
  margin: 0 8px;
}

/* tirets de fréquence */
.rt__tick {
  position: absolute;
  top: -4px;
  transform: translateX(-50%);
  width: 1px;
  height: 12px;
  background: rgba(255, 200, 80, 0.85);
}

/* aiguille */
.rt__needle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  z-index: 2;
}

.rt__needle-stem {
  width: 2px;
  height: 16px;
  background: linear-gradient(to bottom, #ffd060, rgba(255, 208, 96, 0.1));
}

.rt__needle-cap {
  width: 10px;
  height: 10px;
  background: #ffd060;
  border: 2px solid #ffe8a6;
  border-radius: 50%;
  margin-top: -2px;
  box-shadow: 0 0 10px rgba(255, 220, 140, 0.9);
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.rt__body--locked .rt__needle-cap {
  background: #39e07a;
  border-color: #80ffb0;
  box-shadow: 0 0 14px rgba(57, 224, 122, 0.85);
}

/* graduations */
.rt__scale {
  position: relative;
  height: 18px;
  margin: 8px 8px 0;
}

.rt__flabel {
  position: absolute;
  transform: translateX(-50%);
  font-family: 'Courier New', monospace;
  font-size: 0.62rem;
  color: rgba(255, 220, 140, 0.85);
  white-space: nowrap;
}

/* ── MARQUE ── */
.rt__brand {
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  padding-top: 0.6rem;
  font-family: 'Cinzel', serif;
  font-size: 0.48rem;
  letter-spacing: 0.3em;
  color: rgba(200, 184, 154, 0.18);
  text-transform: uppercase;
}


/* ── INSTRUCTION ── */
.rt__hint {
  font-family: 'Cinzel', serif;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #8a7a6a;
  text-align: center;
  pointer-events: none;
  transition: opacity 0.6s ease;
}

/* ── MESSAGE VOIX ── */
.rt__voice {
  background: rgba(8, 6, 18, 0.92);
  border: 1px solid rgba(200, 184, 154, 0.15);
  border-radius: 12px;
  padding: 1.2rem 1.6rem;
  width: min(360px, 100%);
  text-align: center;
}

.rt__voice-text {
  font-family: 'Cinzel', serif;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  color: rgba(200, 184, 154, 0.85);
  line-height: 1.9;
}

/* ── TRANSITIONS ── */
.rt-reveal-enter-active {
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.rt-reveal-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.rt-reveal-enter-to {
  opacity: 1;
  transform: translateY(0);
}

/* ── ERREUR ── */
.rt--error .rt__body {
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
</style>
