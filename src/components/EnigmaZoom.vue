<template>
  <div class="zoom">

    <p class="zoom__question">{{ enigma.question }}</p>

    <!-- Carte retournable -->
    <div class="zoom__scene" @click="onFlip">
      <div class="zoom__card" :class="{ 'zoom__card--flipped': flipped }">

        <!-- Recto -->
        <div class="zoom__face zoom__face--front">
          <img
            v-if="config.image_front"
            :src="storageUrl(config.image_front)"
            class="zoom__img"
            draggable="false"
          />
          <div v-else class="zoom__placeholder" />
          <p class="zoom__tap-hint">{{ enigma.hint ?? 'Retourne la photo' }}</p>
        </div>

        <!-- Verso -->
        <div class="zoom__face zoom__face--back">
          <img
            v-if="config.image_back"
            :src="storageUrl(config.image_back)"
            class="zoom__img"
            draggable="false"
          />
          <div v-else class="zoom__paper" />

          <!-- Dédicace -->
          <div class="zoom__dedication-wrap">
            <p class="zoom__dedication">{{ config.dedication }}</p>
          </div>

          <!-- Cercle sur la lettre réponse (optionnel) -->
          <Transition name="circle">
            <div
              v-if="flipped && showCircle && config.answer_highlight"
              class="zoom__circle"
              :style="circleStyle"
            />
          </Transition>
        </div>

      </div>
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

const flipped = ref(false)
const showCircle = ref(false)

const circleStyle = computed(() => {
  const { x, y } = config.value.answer_highlight ?? { x: 80, y: 70 }
  return { left: x + '%', top: y + '%' }
})

function onFlip() {
  if (flipped.value) return
  flipped.value = true

  // Après le flip, faire apparaître le cercle puis soumettre
  setTimeout(() => { showCircle.value = true }, 700)
  setTimeout(() => emit('submit', config.value.label ?? ''), 2500)
}
</script>

<style scoped>
.zoom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  padding: 1rem 0;
}

.zoom__question {
  font-family: 'IM Fell English', serif;
  font-size: 1.05rem;
  color: #f2e8d0;
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

/* Scène 3D */
.zoom__scene {
  width: 100%;
  perspective: 900px;
  cursor: pointer;
  user-select: none;
}

.zoom__card {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.zoom__card--flipped {
  transform: rotateY(180deg);
}

/* Faces */
.zoom__face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.6);
}

.zoom__face--back {
  transform: rotateY(180deg);
}

/* Image */
.zoom__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

/* Placeholder recto (si pas d'image) */
.zoom__placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2a1e14 0%, #1a1008 100%);
}

/* Papier verso (si pas d'image) */
.zoom__paper {
  width: 100%;
  height: 100%;
  background: #f5f0e0;
}

/* Hint recto */
.zoom__tap-hint {
  position: absolute;
  bottom: 0.6rem;
  left: 0;
  right: 0;
  text-align: center;
  font-family: 'Cinzel', serif;
  font-size: 0.55rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(242, 232, 208, 0.5);
  pointer-events: none;
}

/* Dédicace verso */
.zoom__dedication-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.zoom__dedication {
  font-family: 'IM Fell English', serif;
  font-size: 1rem;
  font-style: italic;
  color: #2a1808;
  text-align: center;
  line-height: 1.6;
  margin: 0;
}

/* Cercle sur la lettre */
.zoom__circle {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(180, 60, 40, 0.85);
  transform: translate(-50%, -50%);
  pointer-events: none;
  box-shadow: 0 0 8px rgba(180, 60, 40, 0.4);
}

.circle-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.circle-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(2);
}
</style>
