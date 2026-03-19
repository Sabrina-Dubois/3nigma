<template>
  <div class="med">

    <p class="med__question">{{ enigma.question }}</p>

    <!-- Tableau cliquable -->
    <div class="med__tableau-wrap" ref="tableauRef">
      <img
        :src="storageUrl(config.image_tableau)"
        class="med__tableau-img"
        draggable="false"
      />

      <!-- Hotspot pulsant (avant résolution) -->
      <div
        v-if="!solved"
        class="med__hotspot"
        :style="{ left: hs.x + '%', top: hs.y + '%' }"
      />

      <!-- Médaillon posé (après succès) -->
      <Transition name="med-snap">
        <div
          v-if="solved"
          class="med__placed"
          :style="{ left: hs.x + '%', top: hs.y + '%' }"
        >
          <img :src="storageUrl(config.image_medaillon)" class="med__placed-img" draggable="false" />
        </div>
      </Transition>
    </div>

    <!-- Révélation du mot -->
    <Transition name="med-word">
      <div v-if="solved" class="med__reveal">
        <span class="med__reveal-part med__reveal-part--left">{{ config.mot_medaillon }}</span>
        <span class="med__reveal-part med__reveal-part--right">{{ config.mot_tableau }}</span>
      </div>
    </Transition>

    <!-- Tray médaillon draggable -->
    <div v-if="!solved" class="med__tray">
      <div
        class="med__token"
        :class="{ 'med__token--dragging': dragging }"
        @pointerdown.prevent="startDrag"
      >
        <img :src="storageUrl(config.image_medaillon)" class="med__token-img" draggable="false" />
      </div>
    </div>

    <!-- Ghost (suit le doigt pendant le drag) -->
    <Teleport to="body">
      <div
        v-if="dragging"
        class="med__ghost"
        :style="{ left: ghostX + 'px', top: ghostY + 'px' }"
      >
        <img :src="storageUrl(config.image_medaillon)" class="med__ghost-img" draggable="false" />
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'

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

const hs = computed(() => config.value.hotspot ?? { x: 50, y: 50, radius: 12 })

function storageUrl(path) {
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/enigmas/${path}`
}

const tableauRef = ref(null)
const dragging = ref(false)
const ghostX = ref(0)
const ghostY = ref(0)
const solved = ref(false)
const shaking = ref(false)

function startDrag(e) {
  dragging.value = true
  ghostX.value = e.clientX
  ghostY.value = e.clientY
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onEnd)
}

function onMove(e) {
  ghostX.value = e.clientX
  ghostY.value = e.clientY
}

function onEnd(e) {
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onEnd)
  dragging.value = false

  if (!tableauRef.value) return
  const rect = tableauRef.value.getBoundingClientRect()
  const xPct = ((e.clientX - rect.left) / rect.width) * 100
  const yPct = ((e.clientY - rect.top) / rect.height) * 100
  const { x, y, radius } = hs.value
  const dist = Math.sqrt((xPct - x) ** 2 + (yPct - y) ** 2)

  if (dist <= radius) {
    solved.value = true
    setTimeout(() => emit('submit', (config.value.mot_medaillon ?? '') + (config.value.mot_tableau ?? '')), 1400)
  } else {
    shaking.value = true
    setTimeout(() => { shaking.value = false }, 550)
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onEnd)
})
</script>

<style scoped>
.med {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
  padding: 1rem 0;
}

/* Question */
.med__question {
  font-family: 'IM Fell English', serif;
  font-size: 1.05rem;
  color: #f2e8d0;
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

/* Tableau */
.med__tableau-wrap {
  position: relative;
  width: 100%;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(201, 169, 110, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.55);
}

.med__tableau-img {
  width: 100%;
  display: block;
  pointer-events: none;
  user-select: none;
}

/* Hotspot pulsant */
.med__hotspot {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1.5px dashed rgba(201, 169, 110, 0.4);
  pointer-events: none;
  animation: hotPulse 1.8s ease-in-out infinite;
}

@keyframes hotPulse {
  0%, 100% { opacity: 0.25; transform: translate(-50%, -50%) scale(0.9); }
  50%       { opacity: 0.7;  transform: translate(-50%, -50%) scale(1.1); }
}

/* Médaillon placé */
.med__placed {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 18%;
  pointer-events: none;
}

.med__placed-img {
  width: 100%;
  display: block;
  filter: drop-shadow(0 0 10px rgba(201, 169, 110, 0.7));
}

/* Transition snap */
.med-snap-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.med-snap-enter-from   { opacity: 0; transform: translate(-50%, -80%) scale(0.6); }

/* Révélation du mot */
.med__reveal {
  display: flex;
  gap: 0;
  font-family: 'Cinzel', serif;
  font-size: 2.2rem;
  font-weight: 700;
  color: #e8d48a;
  letter-spacing: 0.12em;
  text-shadow: 0 0 24px rgba(232, 212, 138, 0.5);
}

.med__reveal-part--left {
  animation: mergeLeft 0.7s 0.4s both;
}
.med__reveal-part--right {
  animation: mergeRight 0.7s 0.6s both;
}

@keyframes mergeLeft {
  0%   { opacity: 0; transform: translateX(-18px); }
  100% { opacity: 1; transform: translateX(0); }
}
@keyframes mergeRight {
  0%   { opacity: 0; transform: translateX(18px); }
  100% { opacity: 1; transform: translateX(0); }
}

.med-word-enter-active { transition: opacity 0.5s ease; }
.med-word-enter-from   { opacity: 0; }

/* Tray */
.med__tray {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.med__tray-label {
  font-family: 'Cinzel', serif;
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(242, 232, 208, 0.4);
  text-align: center;
  margin: 0;
}

/* Token draggable */
.med__token {
  width: 80px;
  height: 80px;
  cursor: grab;
  touch-action: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s, filter 0.15s;
}

.med__token:active,
.med__token--dragging {
  cursor: grabbing;
  transform: scale(1.08);
  filter: drop-shadow(0 4px 14px rgba(201, 169, 110, 0.5));
}

.med__token-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  display: block;
}

/* Ghost (fixed, suit le doigt) */
.med__ghost {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  width: 80px;
  height: 80px;
  transform: translate(-50%, -50%);
  opacity: 0.85;
  filter: drop-shadow(0 6px 20px rgba(201, 169, 110, 0.6));
}

.med__ghost-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* Hint */
.med__hint {
  font-family: 'Cinzel', serif;
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(242, 232, 208, 0.35);
  text-align: center;
  transition: color 0.2s;
}

.med__hint--error {
  color: rgba(220, 80, 60, 0.75);
}
</style>
