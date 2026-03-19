<template>
  <div class="seq">

    <p class="seq__question">{{ enigma.question }}</p>

    <!-- Phrase révélée progressivement -->
    <div class="seq__phrase">
      <TransitionGroup name="word">
        <span
          v-for="item in revealedWords"
          :key="item.id"
          class="seq__word"
        >{{ item.word }}</span>
      </TransitionGroup>
    </div>

    <!-- Grille de polaroids -->
    <div class="seq__grid">
      <div
        v-for="item in shuffled"
        :key="item.id"
        class="seq__scene"
        @click="onTap(item)"
      >
        <div
          class="seq__polaroid"
          :class="{
            'seq__polaroid--flipped': flippedIds.has(item.id),
            'seq__polaroid--wrong': wrongId === item.id,
          }"
        >
          <!-- Verso : date -->
          <div class="seq__face seq__face--back">
            <p class="seq__back-date">{{ item.date }}</p>
          </div>

          <!-- Recto : image + mot -->
          <div class="seq__face seq__face--front">
            <div class="seq__img-area">
              <img
                v-if="item.image"
                :src="storageUrl(item.image)"
                class="seq__img"
                draggable="false"
              />
              <div v-else class="seq__img-placeholder" />
            </div>
            <p class="seq__front-word">{{ item.word }}</p>
          </div>
        </div>
      </div>
    </div>

    <p class="seq__hint" :class="{ 'seq__hint--error': showError }">
      {{ showError ? 'Pas dans cet ordre…' : (enigma.hint ?? 'Lis les dates') }}
    </p>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

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

const MONTHS = {
  janvier: 0, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, août: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11,
}

function parseFrDate(str) {
  const [day, month, year] = str.split(' ')
  return new Date(parseInt(year), MONTHS[month] ?? 0, parseInt(day))
}

// Items triés chronologiquement = ordre correct
const sortedItems = computed(() =>
  [...(config.value.items ?? [])].sort(
    (a, b) => parseFrDate(a.date) - parseFrDate(b.date)
  )
)

// Items mélangés pour l'affichage
const shuffled = ref([])
onMounted(() => {
  const arr = [...(config.value.items ?? [])]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  shuffled.value = arr
})

const flippedIds = ref(new Set())
const wrongId = ref(null)
const showError = ref(false)
const nextIndex = ref(0)

const revealedWords = computed(() =>
  sortedItems.value.slice(0, nextIndex.value)
)

function onTap(item) {
  if (flippedIds.value.has(item.id)) return

  const expected = sortedItems.value[nextIndex.value]
  if (item.id === expected.id) {
    flippedIds.value = new Set([...flippedIds.value, item.id])
    nextIndex.value++

    if (nextIndex.value === sortedItems.value.length) {
      // Tous retournés → soumettre après délai
      setTimeout(() => emit('submit', config.value.answer_word ?? ''), 1800)
    }
  } else {
    wrongId.value = item.id
    showError.value = true
    setTimeout(() => {
      wrongId.value = null
      showError.value = false
    }, 600)
  }
}
</script>

<style scoped>
.seq {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem 0;
}

.seq__question {
  font-family: 'IM Fell English', serif;
  font-size: 1.05rem;
  color: #f2e8d0;
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

/* Phrase révélée */
.seq__phrase {
  min-height: 1.6rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
  align-items: center;
}

.seq__word {
  font-family: 'IM Fell English', serif;
  font-size: 1.1rem;
  color: #c9a96e;
  font-style: italic;
}

.word-enter-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.word-enter-from   { opacity: 0; transform: translateY(-8px); }

/* Grille 2×2 */
.seq__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  width: 100%;
}

/* Scène 3D */
.seq__scene {
  perspective: 800px;
  cursor: pointer;
  user-select: none;
}

.seq__polaroid {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  transform-style: preserve-3d;
  transition: transform 0.65s cubic-bezier(0.4, 0, 0.2, 1);
}

.seq__polaroid--flipped {
  transform: rotateY(180deg);
}

.seq__polaroid--wrong {
  animation: shake 0.4s;
}

@keyframes shake {
  0%, 100% { transform: rotateY(0deg) translateX(0); }
  25%       { transform: rotateY(0deg) translateX(-5px); }
  75%       { transform: rotateY(0deg) translateX(5px); }
}

/* Faces communes */
.seq__face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 3px;
  overflow: hidden;
}

/* Verso */
.seq__face--back {
  background: #f5f0e8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.5);
}

.seq__back-date {
  font-family: 'IM Fell English', serif;
  font-size: 0.7rem;
  font-style: italic;
  color: #2a1808;
  text-align: center;
  line-height: 1.4;
  margin: 0;
}

/* Recto */
.seq__face--front {
  background: #f5f0e8;
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.5);
}

.seq__img-area {
  flex: 1;
  overflow: hidden;
}

.seq__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

.seq__img-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2a1e14 0%, #1a1008 100%);
}

.seq__front-word {
  font-family: 'IM Fell English', serif;
  font-size: 0.65rem;
  font-style: italic;
  color: #2a1808;
  text-align: center;
  padding: 0.35rem 0.25rem;
  margin: 0;
  background: #f5f0e8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Hint */
.seq__hint {
  font-family: 'Cinzel', serif;
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(242, 232, 208, 0.35);
  text-align: center;
  transition: color 0.2s;
}

.seq__hint--error {
  color: rgba(220, 80, 60, 0.75);
}
</style>
