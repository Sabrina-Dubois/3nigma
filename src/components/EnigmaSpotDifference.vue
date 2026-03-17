<template>
  <div class="spd">

    <p class="spd__question">{{ enigma.question }}</p>

    <div class="spd__img-wrap" @click="onClickImg($event)" :class="{ 'spd__img-wrap--shake': shaking }">
      <img :src="imgUrl" class="spd__img" draggable="false" />
      <div v-if="wrongSpot" class="spd__ripple" :style="rippleStyle"></div>
    </div>

    <p class="spd__hint-text" :class="{ 'spd__hint-text--error': shaking }">
      {{ shaking ? 'Ce n\'est pas là...' : config.hint ?? 'Trouve l\'élément caché' }}
    </p>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  enigma: { type: Object, required: true },
  answerError: { type: Boolean, default: false },
})
const emit = defineEmits(['submit'])

const shaking = ref(false)
const wrongSpot = ref(false)
const rippleStyle = ref({})

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

const imgUrl = computed(() => storageUrl(config.value.image))

function onClickImg(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const xPct = ((event.clientX - rect.left) / rect.width) * 100
  const yPct = ((event.clientY - rect.top) / rect.height) * 100

  const { x, y, radius } = config.value.hotspot ?? { x: 78, y: 18, radius: 12 }
  const dist = Math.sqrt((xPct - x) ** 2 + (yPct - y) ** 2)

  if (dist <= radius) {
    emit('submit', config.value.label ?? props.enigma.answer)
  } else {
    // Feedback raté
    rippleStyle.value = { left: `${xPct}%`, top: `${yPct}%` }
    wrongSpot.value = true
    shaking.value = true
    setTimeout(() => { shaking.value = false; wrongSpot.value = false }, 600)
  }
}
</script>

<style scoped>
.spd {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
  padding: 1rem 0;
}

.spd__question {
  font-family: 'IM Fell English', serif;
  font-size: 1.1rem;
  color: #f2e8d0;
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

.spd__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  width: 100%;
}

.spd__panel {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.spd__tag {
  font-family: 'Cinzel', serif;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(201, 169, 110, 0.6);
  text-align: center;
}

.spd__img-wrap {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  cursor: crosshair;
  border: 1px solid rgba(201, 169, 110, 0.2);
  user-select: none;
}

.spd__img-wrap--single {
  width: 100%;
  max-width: 400px;
}

.spd__img-wrap--shake {
  animation: shake 0.35s;
}

@keyframes shake {
  0%,100% { transform: translateX(0); }
  25%      { transform: translateX(-5px); }
  75%      { transform: translateX(5px); }
}

.spd__img {
  width: 100%;
  display: block;
  pointer-events: none;
}

.spd__ripple {
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

.spd__hint-text {
  font-family: 'Cinzel', serif;
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(242, 232, 208, 0.35);
  text-align: center;
  transition: color 0.2s;
}

.spd__hint-text--error {
  color: rgba(220, 80, 60, 0.7);
}
</style>
