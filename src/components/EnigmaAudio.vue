<template>
  <div class="au" :class="{ 'au--shake': shaking, 'au--flicker': flickering }">

    <!-- ── PHASE REORDER ── -->
    <div v-if="phase === 'reorder'" class="au__wrap">

      <div class="au__header">
        <p class="au__title">{{ config.title ?? '23s' }}</p>
        <p class="au__hint">Remets les fragments dans le bon ordre</p>
      </div>

      <!-- liste des blocs -->
      <div class="au__list">
        <div
          v-for="(block, i) in ordered"
          :key="block.id"
          class="au__block"
          :class="{ 'au__block--selected': selectedIdx === i }"
          @click="onTap(i)"
        >
          <span class="au__pos">{{ i + 1 }}</span>
          <span class="au__text">{{ block.text }}</span>
        </div>
      </div>

      <!-- indication de swap en cours -->
      <p v-if="selectedIdx !== null" class="au__swap-hint">
        Tape un autre bloc pour l'échanger
      </p>

      <!-- bouton valider -->
      <button class="au__submit" @click="validate">
        Valider l'ordre
      </button>

    </div>

    <!-- ── PHASE REVEAL ── -->
    <transition name="au-fade">
      <div v-if="phase === 'reveal'" class="au__reveal">
        <div class="au__message">
          <p v-for="(block, i) in sortedBlocks" :key="i" class="au__line">
            {{ block.text }}
          </p>
        </div>
        <button class="au__btn" @click="emit('submit', answer)">
          Continuer →
        </button>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps({
  enigma:      { type: Object,  required: true },
  answerError: { type: Boolean, default: false },
})
const emit = defineEmits(['submit'])

// ── Config ────────────────────────────────────────────────
const config = computed(() => {
  const raw = props.enigma?.config
  if (!raw) return {}
  return typeof raw === 'string' ? JSON.parse(raw) : raw
})

const blocks        = computed(() => config.value.blocks ?? [])
const shuffledOrder = computed(() => config.value.shuffled_order ?? blocks.value.map(b => b.id))
const answer        = computed(() => config.value.answer ?? props.enigma?.answer ?? '')

// ── État ──────────────────────────────────────────────────
const phase       = ref('reorder')
const shaking     = ref(false)
const flickering  = ref(false)
const selectedIdx = ref(null)
const ambientStarted = ref(false)

// ordre initial = shuffled_order → résoudre en objets block
const ordered = ref(
  shuffledOrder.value.map(id => blocks.value.find(b => b.id === id)).filter(Boolean)
)

const sortedBlocks = computed(() =>
  [...blocks.value].sort((a, b) => a.correct_position - b.correct_position)
)

// ── Tap-to-swap ────────────────────────────────────────────
function onTap(i) {
  startAmbient() // premier geste → démarre l'audio (PWA safe)

  if (selectedIdx.value === null) {
    selectedIdx.value = i
  } else if (selectedIdx.value === i) {
    selectedIdx.value = null
  } else {
    const list = [...ordered.value]
    ;[list[selectedIdx.value], list[i]] = [list[i], list[selectedIdx.value]]
    ordered.value = list
    selectedIdx.value = null
  }
}

// ── Ambiance en boucle ────────────────────────────────────
let audioCtx = null
let stopNodes = []

function startAmbient() {
  if (ambientStarted.value) return
  ambientStarted.value = true

  try {
    const AudioCtx = window.AudioContext || window['webkitAudioContext']
    const ctx = new AudioCtx()
    audioCtx = ctx
    const t = ctx.currentTime

    // ── EQ téléphone (coupe graves + aigus → son de messagerie vocale)
    const phoneHp = ctx.createBiquadFilter()
    phoneHp.type = 'highpass'
    phoneHp.frequency.value = 320

    const phoneLp = ctx.createBiquadFilter()
    phoneLp.type = 'lowpass'
    phoneLp.frequency.value = 3200

    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0, t)
    masterGain.gain.linearRampToValueAtTime(0.8, t + 0.5)
    masterGain.connect(ctx.destination)

    phoneHp.connect(phoneLp)
    phoneLp.connect(masterGain)

    // ── source : bruit blanc (base de la "voix" filtrée)
    const nLen = ctx.sampleRate * 3
    const nBuf = ctx.createBuffer(1, nLen, ctx.sampleRate)
    const nd = nBuf.getChannelData(0)
    for (let i = 0; i < nLen; i++) nd[i] = Math.random() * 2 - 1
    const noise = ctx.createBufferSource()
    noise.buffer = nBuf
    noise.loop = true
    noise.connect(phoneHp)
    noise.start()

    // ── formant : filtre passe-bande qui se déplace lentement
    // simule les voyelles d'une voix humaine (300-800 Hz = formants F1/F2)
    const formant = ctx.createBiquadFilter()
    formant.type = 'bandpass'
    formant.Q.value = 6
    formant.frequency.value = 500
    noise.disconnect(phoneHp)
    noise.connect(formant)
    formant.connect(phoneHp)

    // ── modulation d'amplitude rythmique (simule la parole : ~2-4 syllabes/sec)
    let stopped = false
    const ampGain = ctx.createGain()
    ampGain.gain.value = 0
    // réinsérer dans la chaîne
    noise.disconnect(formant)
    noise.connect(ampGain)
    ampGain.connect(formant)

    function speakWord() {
      if (stopped) return
      const now = ctx.currentTime
      const syllables = 1 + Math.floor(Math.random() * 4)  // 1-4 syllabes
      const syllDur = 0.12 + Math.random() * 0.1
      const syllGap = 0.06 + Math.random() * 0.06

      for (let s = 0; s < syllables; s++) {
        const on  = now + s * (syllDur + syllGap)
        const off = on + syllDur
        // change le formant aléatoirement → différentes "voyelles"
        formant.frequency.setValueAtTime(300 + Math.random() * 600, on)
        ampGain.gain.setValueAtTime(0, on)
        ampGain.gain.linearRampToValueAtTime(0.9, on + 0.02)
        ampGain.gain.setValueAtTime(0.9, off - 0.02)
        ampGain.gain.linearRampToValueAtTime(0, off)
      }

      // pause entre mots (silence)
      const wordDur = syllables * (syllDur + syllGap)
      const pause = 0.15 + Math.random() * 0.8
      setTimeout(speakWord, (wordDur + pause) * 1000)
    }

    // petite ambiance statique en fond (comme une mauvaise ligne)
    const staticGain = ctx.createGain()
    staticGain.gain.value = 0.04
    noise.connect(staticGain)
    staticGain.connect(masterGain)

    setTimeout(speakWord, 600)

    stopNodes = [
      () => { stopped = true; try { noise.stop() } catch {} },
    ]
  } catch (e) { /* noop */ }
}

function stopAmbient() {
  stopNodes.forEach(fn => fn())
  stopNodes = []
  audioCtx?.close()
  audioCtx = null
}

onUnmounted(stopAmbient)

// ── Validation ────────────────────────────────────────────
function validate() {
  const correct = ordered.value.every((b, i) => b.correct_position === i + 1)

  if (correct) {
    triggerSuccess()
  } else {
    shaking.value = true
    setTimeout(() => { shaking.value = false }, 500)
    emit('submit', '__wrong__')
  }
}

function triggerSuccess() {
  stopAmbient()

  shaking.value = true
  setTimeout(() => { shaking.value = false }, 600)

  flickering.value = true
  setTimeout(() => { flickering.value = false }, 1200)

  setTimeout(() => { phase.value = 'reveal' }, 900)
}
</script>

<style scoped>
.au {
  width: 100%;
  color: #f2e8d0;
  transition: opacity 0.05s;
}

/* shake */
.au--shake {
  animation: auShake 0.5s ease-in-out;
}
@keyframes auShake {
  0%,100% { transform: translateX(0) }
  15%     { transform: translateX(-6px) }
  30%     { transform: translateX(6px) }
  45%     { transform: translateX(-5px) }
  60%     { transform: translateX(5px) }
  75%     { transform: translateX(-3px) }
  90%     { transform: translateX(3px) }
}

/* flicker */
.au--flicker {
  animation: auFlicker 1.2s steps(1) forwards;
}
@keyframes auFlicker {
  0%   { opacity: 1 }
  10%  { opacity: 0.2 }
  15%  { opacity: 1 }
  30%  { opacity: 0.4 }
  35%  { opacity: 1 }
  55%  { opacity: 0.1 }
  60%  { opacity: 1 }
  80%  { opacity: 0.5 }
  85%  { opacity: 1 }
  100% { opacity: 1 }
}

/* ── WRAP ── */
.au__wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

/* header */
.au__header { text-align: center; }
.au__title {
  font-family: 'Cinzel', serif;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #c9a96e;
  text-shadow: 0 0 20px rgba(201, 169, 110, 0.5);
}
.au__hint {
  font-family: 'IM Fell English', serif;
  font-size: 0.85rem;
  font-style: italic;
  color: #a08060;
  margin-top: 0.2rem;
}

/* liste blocs */
.au__list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
  max-width: 380px;
}
.au__block {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(201, 169, 110, 0.15);
  background: rgba(8, 5, 2, 0.65);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, transform 0.15s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.au__block--selected {
  border-color: rgba(201, 169, 110, 0.7);
  background: rgba(201, 169, 110, 0.12);
  transform: scale(1.02);
}
.au__block--playing {
  border-color: rgba(201, 169, 110, 0.4);
  background: rgba(201, 169, 110, 0.06);
}

.au__pos {
  font-family: 'Cinzel', serif;
  font-size: 0.65rem;
  color: rgba(201, 169, 110, 0.4);
  width: 1rem;
  flex-shrink: 0;
  text-align: center;
}
.au__text {
  font-family: 'IM Fell English', serif;
  font-size: 0.95rem;
  font-style: italic;
  color: #f2e8d0;
  flex: 1;
  line-height: 1.3;
}
/* hint swap */
.au__swap-hint {
  font-family: 'IM Fell English', serif;
  font-size: 0.8rem;
  font-style: italic;
  color: #c9a96e;
  opacity: 0.7;
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 0.7 }
  50%       { opacity: 1 }
}

/* bouton valider */
.au__submit {
  padding: 0.8rem 2.5rem;
  background: rgba(201, 169, 110, 0.15);
  color: #c9a96e;
  border: 1px solid rgba(201, 169, 110, 0.35);
  border-radius: 10px;
  font-family: 'Cinzel', serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.au__submit:hover { background: rgba(201, 169, 110, 0.25); }

/* reveal */
.au__reveal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}
.au__message {
  width: 100%;
  max-width: 380px;
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid rgba(201, 169, 110, 0.2);
  background: rgba(8, 5, 2, 0.7);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.au__line {
  font-family: 'IM Fell English', serif;
  font-size: 1rem;
  font-style: italic;
  color: #c9a96e;
  line-height: 1.5;
  text-align: center;
}
.au__btn {
  padding: 0.9rem 2.5rem;
  background: #c9a96e;
  color: #1a0d02;
  border: none;
  border-radius: 10px;
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  cursor: pointer;
  transition: opacity 0.2s;
  box-shadow: 0 4px 20px rgba(201, 169, 110, 0.3);
}
.au__btn:hover { opacity: 0.85; }

/* transition */
.au-fade-enter-active { transition: opacity 0.8s ease; }
.au-fade-enter-from   { opacity: 0; }
</style>
