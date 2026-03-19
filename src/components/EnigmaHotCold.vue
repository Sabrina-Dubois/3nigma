<template>
  <div class="hc">

    <p class="hc__question">{{ enigma.question }}</p>

    <!-- Image cliquable -->
    <div class="hc__img-wrap" @click="onTap">
      <Transition name="hc-swap" mode="out-in">
        <img
          v-if="!found"
          :key="'search'"
          :src="storageUrl(config.image)"
          class="hc__img"
          draggable="false"
        />
        <img
          v-else
          :key="'reveal'"
          :src="storageUrl(config.object_image)"
          class="hc__img"
          draggable="false"
        />
      </Transition>

      <!-- Ripple de température (avant découverte) -->
      <div
        v-if="lastTap && !found"
        class="hc__temp-ripple"
        :class="`hc__temp-ripple--${tempLevel}`"
        :style="{ left: lastTap.x + '%', top: lastTap.y + '%' }"
        :key="tapKey"
      />
    </div>

    <!-- Indicateur température -->
    <div class="hc__gauge">
      <div class="hc__gauge-bar">
        <div class="hc__gauge-fill" :style="{ width: gaugeWidth + '%', background: gaugeColor }" />
      </div>
      <p class="hc__temp-label" :class="`hc__temp-label--${tempLevel}`">
        {{ tempText }}
      </p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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

function storageUrl(path) {
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/enigmas/${path}`
}

const found = ref(false)
const lastTap = ref(null)
const tapKey = ref(0)
const lastDist = ref(100)

const FOUND_RADIUS = 9

const tempLevel = computed(() => {
  const d = lastDist.value
  if (d <= FOUND_RADIUS) return 'found'
  if (d <= 15) return 'hot'
  if (d <= 28) return 'warm'
  if (d <= 45) return 'cool'
  return 'cold'
})

const tempText = computed(() => {
  if (!lastTap.value) return ''
  switch (tempLevel.value) {
    case 'found': return 'Trouvé !'
    case 'hot':   return 'Brûlant !'
    case 'warm':  return 'Chaud…'
    case 'cool':  return 'Tiède…'
    default:      return 'Froid…'
  }
})

const gaugeWidth = computed(() => {
  if (!lastTap.value) return 0
  return Math.max(5, Math.min(100, 100 - lastDist.value * 1.6))
})

const gaugeColor = computed(() => {
  switch (tempLevel.value) {
    case 'found': return '#60d860'
    case 'hot':   return '#e84040'
    case 'warm':  return '#e87020'
    case 'cool':  return '#e8c840'
    default:      return '#4080c8'
  }
})

function onTap(event) {
  if (found.value) return
  const rect = event.currentTarget.getBoundingClientRect()
  const xPct = ((event.clientX - rect.left) / rect.width) * 100
  const yPct = ((event.clientY - rect.top) / rect.height) * 100

  const { x, y } = config.value.hidden_position ?? { x: 50, y: 50 }
  const dist = Math.sqrt((xPct - x) ** 2 + (yPct - y) ** 2)

  lastTap.value = { x: xPct, y: yPct }
  lastDist.value = dist
  tapKey.value++

  if (dist <= FOUND_RADIUS) {
    found.value = true
    setTimeout(() => emit('submit', config.value.label ?? ''), 1500)
  }
}
</script>

<style scoped>
.hc {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem 0;
}

.hc__question {
  font-family: 'IM Fell English', serif;
  font-size: 1.05rem;
  color: #f2e8d0;
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

/* Image */
.hc__img-wrap {
  position: relative;
  width: 100%;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(201, 169, 110, 0.2);
  cursor: crosshair;
  user-select: none;
}

.hc__img-wrap--shake {
  animation: shake 0.35s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-5px); }
  75%       { transform: translateX(5px); }
}

.hc__img {
  width: 100%;
  display: block;
  pointer-events: none;
}

/* Ripple température */
.hc__temp-ripple {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2.5px solid currentColor;
  animation: tempRipple 0.7s ease-out forwards;
  pointer-events: none;
}

.hc__temp-ripple--cold  { color: rgba(60, 120, 220, 0.8); }
.hc__temp-ripple--cool  { color: rgba(200, 180, 40, 0.8); }
.hc__temp-ripple--warm  { color: rgba(230, 110, 30, 0.8); }
.hc__temp-ripple--hot   { color: rgba(230, 50, 40, 0.9); }
.hc__temp-ripple--found { color: rgba(80, 220, 80, 0.9); }

@keyframes tempRipple {
  0%   { transform: translate(-50%, -50%) scale(0.4); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2.8); opacity: 0; }
}

/* Objet révélé */
.hc__object {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.hc__object-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  filter: drop-shadow(0 0 8px rgba(201, 169, 110, 0.8));
}

.hc__object-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(201, 169, 110, 0.9);
  box-shadow: 0 0 12px rgba(201, 169, 110, 0.6);
}

.hc-swap-enter-active { transition: opacity 0.6s ease; }
.hc-swap-leave-active { transition: opacity 0.3s ease; }
.hc-swap-enter-from   { opacity: 0; }
.hc-swap-leave-to     { opacity: 0; }

/* Jauge */
.hc__gauge {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  align-items: center;
}

.hc__gauge-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
}

.hc__gauge-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease, background 0.4s ease;
}

.hc__temp-label {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  transition: color 0.3s;
}

.hc__temp-label--cold  { color: rgba(80, 140, 230, 0.8); }
.hc__temp-label--cool  { color: rgba(220, 200, 60, 0.8); }
.hc__temp-label--warm  { color: rgba(230, 120, 40, 0.9); }
.hc__temp-label--hot   { color: rgba(230, 60, 40, 1); }
.hc__temp-label--found { color: rgba(80, 220, 80, 1); }

/* Hint */
.hc__hint {
  font-family: 'Cinzel', serif;
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(242, 232, 208, 0.35);
  text-align: center;
}
</style>
