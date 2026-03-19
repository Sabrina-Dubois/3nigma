<template>
  <div class="srch">

    <p class="srch__question">{{ enigma.question }}</p>

    <!-- Image du jardin cliquable -->
    <div
      class="srch__img-wrap"
      ref="imgRef"
      @click="onClickImg"
      :class="{ 'srch__img-wrap--shake': shaking }"
    >
      <img :src="storageUrl(config.image)" class="srch__img" draggable="false" />

      <!-- Ripple raté -->
      <div v-if="wrongClick" class="srch__ripple" :style="rippleStyle" />

      <!-- Tombe révélée (seulement si inscription configurée) -->
      <Transition name="grave">
        <div v-if="found && config.inscription" class="srch__grave" :style="graveStyle">
          <div class="srch__stone">
            <div class="srch__cross">✝</div>
            <p class="srch__inscription">{{ resolvedInscription }}</p>
            <p class="srch__date">{{ resolvedDate }}</p>
          </div>
        </div>
      </Transition>

      <!-- Flash succès (si pas de tombe) -->
      <Transition name="grave">
        <div v-if="found && !config.inscription" class="srch__found-flash" :style="graveStyle" />
      </Transition>
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

const resolvedInscription = computed(() => config.value.inscription ?? '')

const resolvedDate = computed(() => config.value.date ?? '')

const imgRef = ref(null)
const found = ref(false)
const shaking = ref(false)
const wrongClick = ref(false)
const rippleStyle = ref({})

const graveStyle = computed(() => {
  const { x, y } = config.value.hotspot ?? { x: 38, y: 78 }
  return { left: x + '%', top: y + '%' }
})

function onClickImg(event) {
  if (found.value) return
  const rect = event.currentTarget.getBoundingClientRect()
  const xPct = ((event.clientX - rect.left) / rect.width) * 100
  const yPct = ((event.clientY - rect.top) / rect.height) * 100
  const { x, y, radius } = config.value.hotspot ?? { x: 38, y: 78, radius: 10 }
  const dist = Math.sqrt((xPct - x) ** 2 + (yPct - y) ** 2)

  if (dist <= radius) {
    found.value = true
    setTimeout(() => emit('submit', config.value.label ?? config.value.inscription ?? ''), 2000)
  } else {
    rippleStyle.value = { left: `${xPct}%`, top: `${yPct}%` }
    wrongClick.value = true
    shaking.value = true
    setTimeout(() => { shaking.value = false; wrongClick.value = false }, 650)
  }
}
</script>

<style scoped>
.srch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
  padding: 1rem 0;
}

.srch__question {
  font-family: 'IM Fell English', serif;
  font-size: 1.05rem;
  color: #f2e8d0;
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

/* Image */
.srch__img-wrap {
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  border-radius: 0;
  overflow: hidden;
  border-top: 1px solid rgba(201, 169, 110, 0.2);
  border-bottom: 1px solid rgba(201, 169, 110, 0.2);
  cursor: crosshair;
  user-select: none;
}

.srch__img-wrap--shake {
  animation: shake 0.35s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-5px); }
  75%       { transform: translateX(5px); }
}

.srch__img {
  width: 100%;
  display: block;
  pointer-events: none;
}

/* Ripple raté */
.srch__ripple {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(220, 80, 60, 0.8);
  animation: ripple 0.5s ease-out forwards;
  pointer-events: none;
}

@keyframes ripple {
  0%   { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
}

/* Flash succès */
.srch__found-flash {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(201, 169, 110, 0.9);
  box-shadow: 0 0 16px rgba(201, 169, 110, 0.6);
  pointer-events: none;
  animation: foundFlash 1s ease-out forwards;
}

@keyframes foundFlash {
  0%   { transform: translate(-50%, -50%) scale(0.3); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
}

/* Tombe */
.srch__grave {
  position: absolute;
  transform: translate(-50%, -100%);
  pointer-events: none;
}

.srch__stone {
  background: linear-gradient(175deg, #3a3530 0%, #1e1a16 100%);
  border: 1px solid rgba(100, 90, 70, 0.5);
  border-radius: 40% 40% 4px 4px / 30% 30% 4px 4px;
  padding: 0.6rem 0.75rem 0.8rem;
  min-width: 80px;
  text-align: center;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(150, 130, 90, 0.15);
}

.srch__cross {
  font-size: 0.9rem;
  color: rgba(180, 160, 110, 0.6);
  margin-bottom: 0.2rem;
  line-height: 1;
}

.srch__inscription {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: rgba(200, 180, 130, 0.85);
  text-transform: uppercase;
  margin: 0 0 0.15rem;
  line-height: 1.2;
}

.srch__date {
  font-family: 'IM Fell English', serif;
  font-size: 0.55rem;
  color: rgba(160, 140, 100, 0.6);
  margin: 0;
  font-style: italic;
}

/* Transition tombe */
.grave-enter-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.grave-enter-from {
  opacity: 0;
  transform: translate(-50%, -80%) scale(0.7);
}

/* Hint */
.srch__hint {
  font-family: 'Cinzel', serif;
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(242, 232, 208, 0.35);
  text-align: center;
  transition: color 0.2s;
}

.srch__hint--error {
  color: rgba(220, 80, 60, 0.75);
}
</style>
