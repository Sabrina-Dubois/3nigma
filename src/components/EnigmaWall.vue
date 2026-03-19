<template>
  <div class="wall">

    <p class="wall__question">{{ enigma.question }}</p>

    <div class="wall__grid">
      <div
        v-for="photo in photos"
        :key="photo.id"
        class="wall__photo"
        :class="{
          'wall__photo--wrong': wrongId === photo.id,
          'wall__photo--found': found && photo.is_answer,
        }"
        @click="onClickPhoto(photo)"
      >
        <!-- Zone image -->
        <div class="wall__img-area">
          <Transition name="reveal">
            <div v-if="found && photo.is_answer" class="wall__woman-wrap">
              <div class="wall__woman-silhouette" />
              <div class="wall__medallion">✦</div>
            </div>
            <div v-else class="wall__noise" />
          </Transition>
        </div>

        <!-- Date -->
        <p class="wall__date">{{ photo.date }}</p>
      </div>
    </div>

    <p class="wall__hint" :class="{ 'wall__hint--error': showError }">
      {{ showError ? 'Pas celle-là…' : (enigma.hint ?? 'Regarde les dates') }}
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

const config = computed(() => {
  if (!props.enigma?.config) return {}
  if (typeof props.enigma.config === 'string') {
    try { return JSON.parse(props.enigma.config) } catch { return {} }
  }
  return props.enigma.config
})

const photos = computed(() => config.value.photos ?? [])

const found = ref(false)
const wrongId = ref(null)
const showError = ref(false)

function onClickPhoto(photo) {
  if (found.value) return

  if (photo.is_answer) {
    found.value = true
    setTimeout(() => emit('submit', config.value.label ?? 'la photo ancienne'), 1800)
  } else {
    wrongId.value = photo.id
    showError.value = true
    setTimeout(() => {
      wrongId.value = null
      showError.value = false
    }, 600)
  }
}
</script>

<style scoped>
.wall {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
  padding: 1rem 0;
}

.wall__question {
  font-family: 'IM Fell English', serif;
  font-size: 1.05rem;
  color: #f2e8d0;
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

/* Grille */
.wall__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  width: 100%;
}

/* Polaroïd */
.wall__photo {
  background: #f5f0e8;
  border-radius: 2px;
  padding: 0.35rem 0.35rem 0.5rem;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transform: rotate(var(--r, 0deg));
  transition: transform 0.2s, box-shadow 0.2s;
  user-select: none;
}

/* rotations légèrement aléatoires via nth-child */
.wall__photo:nth-child(1)  { --r: -2deg; }
.wall__photo:nth-child(2)  { --r:  1.5deg; }
.wall__photo:nth-child(3)  { --r: -1deg; }
.wall__photo:nth-child(4)  { --r:  2.5deg; }
.wall__photo:nth-child(5)  { --r:  1deg; }
.wall__photo:nth-child(6)  { --r: -2.5deg; }
.wall__photo:nth-child(7)  { --r:  0.5deg; }
.wall__photo:nth-child(8)  { --r: -1.5deg; }

.wall__photo:active {
  transform: rotate(var(--r, 0deg)) scale(0.96);
}

.wall__photo--wrong {
  animation: shake 0.4s;
}

.wall__photo--found {
  box-shadow:
    0 4px 16px rgba(201, 169, 110, 0.6),
    0 0 0 2px rgba(201, 169, 110, 0.5);
}

@keyframes shake {
  0%, 100% { transform: rotate(var(--r, 0deg)) translateX(0); }
  25%       { transform: rotate(var(--r, 0deg)) translateX(-4px); }
  75%       { transform: rotate(var(--r, 0deg)) translateX(4px); }
}

/* Zone image du polaroïd */
.wall__img-area {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #2a1e14;
  overflow: hidden;
}

/* Bruit photographique */
.wall__noise {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 40%, rgba(80, 60, 40, 0.4) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 70%, rgba(40, 30, 20, 0.3) 0%, transparent 50%);
}

/* Femme révélée */
.wall__woman-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at center, #3a2810 0%, #1a1008 100%);
}

.wall__woman-silhouette {
  width: 40%;
  aspect-ratio: 0.6;
  background: rgba(201, 169, 110, 0.15);
  border-radius: 50% 50% 10% 10% / 40% 40% 10% 10%;
  border: 1px solid rgba(201, 169, 110, 0.3);
}

.wall__medallion {
  font-size: 0.5rem;
  color: rgba(201, 169, 110, 0.8);
  margin-top: 2px;
  animation: glimmer 1.5s ease-in-out infinite;
}

@keyframes glimmer {
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 1; }
}

/* Date */
.wall__date {
  font-family: 'IM Fell English', serif;
  font-size: 0.5rem;
  color: #3a2810;
  text-align: center;
  margin: 0.3rem 0 0;
  line-height: 1.2;
}

/* Transition révélation */
.reveal-enter-active { transition: opacity 0.6s ease; }
.reveal-enter-from   { opacity: 0; }

/* Hint */
.wall__hint {
  font-family: 'Cinzel', serif;
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(242, 232, 208, 0.35);
  text-align: center;
  transition: color 0.2s;
}

.wall__hint--error {
  color: rgba(220, 80, 60, 0.75);
}
</style>
