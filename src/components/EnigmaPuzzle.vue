<template>
  <div class="puz">

    <p class="puz__question">{{ enigma.question }}</p>

    <!-- Zone de reconstruction -->
    <div class="puz__reconstruction" :class="{ 'puz__reconstruction--done': allPlaced }">
      <TransitionGroup name="place" tag="div" class="puz__placed-list">
        <div v-for="p in placedPieces" :key="p.id" class="puz__placed-piece">
          <p class="puz__placed-text">{{ p.text }}</p>
        </div>
      </TransitionGroup>
      <div v-if="!allPlaced && placedPieces.length === 0" class="puz__reconstruction-empty">
        <span>Reconstitue la lettre</span>
      </div>
    </div>

    <!-- Grille des morceaux -->
    <div class="puz__grid">
      <div
        v-for="piece in shuffled"
        :key="piece.id"
        class="puz__piece"
        :class="{
          'puz__piece--placed': placedIds.has(piece.id),
          'puz__piece--wrong': wrongId === piece.id,
          'puz__piece--next': !placedIds.has(piece.id) && isNextPiece(piece),
        }"
        @click="onTap(piece)"
      >
        <p class="puz__piece-text">{{ piece.text }}</p>
        <div class="puz__tear puz__tear--top" />
        <div class="puz__tear puz__tear--bottom" />
      </div>
    </div>

    <!-- Lettre complète révélée -->
    <Transition name="letter">
      <div v-if="allPlaced" class="puz__full-letter">
        <pre class="puz__letter-text">{{ config.letter_text }}</pre>
        <p class="puz__last-word">« {{ config.answer_word }} »</p>
      </div>
    </Transition>

    <p class="puz__hint" :class="{ 'puz__hint--error': showError }">
      {{ showError ? 'Ce n\'est pas le bon morceau…' : (enigma.hint ?? 'Lis les fragments') }}
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

// Découpe le texte en N morceaux à peu près égaux
function splitIntoPieces(text, n) {
  // Séparer d'abord par paragraphes
  const paras = text.split('\n\n').filter(p => p.trim())
  const pieces = []

  if (paras.length >= n) {
    // Assez de paragraphes → on prend les N premiers et regroupe le reste
    for (let i = 0; i < n; i++) {
      pieces.push(paras[i] ?? '')
    }
  } else {
    // Moins de paragraphes que de morceaux → découpe les longs par phrases
    const sentences = []
    paras.forEach(p => {
      const parts = p.split(/(?<=[.!?])\s+/)
      parts.forEach(s => sentences.push(s.trim()))
    })
    const perPiece = Math.ceil(sentences.length / n)
    for (let i = 0; i < n; i++) {
      pieces.push(sentences.slice(i * perPiece, (i + 1) * perPiece).join(' '))
    }
  }

  return pieces.filter(p => p).map((text, i) => ({ id: i + 1, text }))
}

const orderedPieces = computed(() => {
  const text = config.value.letter_text ?? ''
  const n = config.value.pieces ?? 4
  return splitIntoPieces(text, n)
})

const shuffled = ref([])
onMounted(() => {
  const arr = [...orderedPieces.value]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  shuffled.value = arr
})

const placedIds = ref(new Set())
const wrongId = ref(null)
const showError = ref(false)
const nextExpected = ref(1)

const placedPieces = computed(() =>
  orderedPieces.value.filter(p => placedIds.value.has(p.id))
)

const allPlaced = computed(() =>
  placedIds.value.size === orderedPieces.value.length
)

function isNextPiece(piece) {
  return piece.id === nextExpected.value
}

function onTap(piece) {
  if (placedIds.value.has(piece.id)) return

  if (piece.id === nextExpected.value) {
    placedIds.value = new Set([...placedIds.value, piece.id])
    nextExpected.value++

    if (allPlaced.value) {
      setTimeout(() => emit('submit', config.value.answer_word ?? ''), 2200)
    }
  } else {
    wrongId.value = piece.id
    showError.value = true
    setTimeout(() => {
      wrongId.value = null
      showError.value = false
    }, 600)
  }
}
</script>

<style scoped>
.puz {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem 0;
}

.puz__question {
  font-family: 'IM Fell English', serif;
  font-size: 1.05rem;
  color: #f2e8d0;
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

/* Zone reconstruction */
.puz__reconstruction {
  width: 100%;
  min-height: 4rem;
  background: rgba(242, 232, 208, 0.04);
  border: 1px dashed rgba(201, 169, 110, 0.2);
  border-radius: 6px;
  padding: 0.75rem;
  transition: border-color 0.4s, background 0.4s;
}

.puz__reconstruction--done {
  border-color: rgba(201, 169, 110, 0.5);
  background: rgba(242, 232, 208, 0.06);
}

.puz__reconstruction-empty {
  font-family: 'Cinzel', serif;
  font-size: 0.55rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(201, 169, 110, 0.25);
  text-align: center;
  padding: 0.5rem 0;
}

.puz__placed-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.puz__placed-piece {
  border-bottom: 1px solid rgba(201, 169, 110, 0.1);
  padding-bottom: 0.2rem;
}

.puz__placed-text {
  font-family: 'IM Fell English', serif;
  font-size: 0.75rem;
  font-style: italic;
  color: rgba(242, 232, 208, 0.7);
  margin: 0;
  line-height: 1.4;
}

.place-enter-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.place-enter-from   { opacity: 0; transform: translateX(-10px); }

/* Grille des morceaux */
.puz__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
  width: 100%;
}

/* Morceau de papier */
.puz__piece {
  position: relative;
  background: #f2ead8;
  padding: 0.6rem 0.5rem;
  cursor: pointer;
  transition: opacity 0.3s, transform 0.2s;
  user-select: none;
}

/* Bords déchirés via clip-path */
.puz__piece:nth-child(1) { clip-path: polygon(0 3%, 8% 0, 20% 4%, 35% 1%, 50% 5%, 65% 0, 80% 3%, 92% 0, 100% 4%, 100% 96%, 90% 100%, 75% 97%, 60% 100%, 45% 96%, 30% 100%, 15% 97%, 0 100%); }
.puz__piece:nth-child(2) { clip-path: polygon(0 5%, 12% 0, 28% 4%, 42% 0, 58% 3%, 73% 0, 88% 4%, 100% 0, 100% 95%, 85% 100%, 70% 96%, 55% 100%, 40% 97%, 25% 100%, 10% 96%, 0 100%); }
.puz__piece:nth-child(3) { clip-path: polygon(0 2%, 15% 0, 30% 5%, 45% 1%, 60% 4%, 75% 0, 90% 3%, 100% 0, 100% 97%, 88% 100%, 72% 96%, 57% 100%, 42% 97%, 27% 100%, 12% 96%, 0 100%); }
.puz__piece:nth-child(4) { clip-path: polygon(0 4%, 10% 0, 25% 3%, 40% 0, 55% 4%, 70% 1%, 85% 3%, 100% 0, 100% 96%, 92% 100%, 77% 97%, 62% 100%, 47% 96%, 32% 100%, 17% 97%, 0 100%); }
.puz__piece:nth-child(5) { clip-path: polygon(0 3%, 13% 0, 27% 4%, 43% 0, 59% 3%, 74% 0, 89% 4%, 100% 1%, 100% 95%, 86% 100%, 71% 97%, 56% 100%, 41% 96%, 26% 100%, 11% 97%, 0 100%); }
.puz__piece:nth-child(6) { clip-path: polygon(0 5%, 11% 0, 26% 4%, 41% 0, 56% 5%, 71% 1%, 86% 3%, 100% 0, 100% 96%, 89% 100%, 74% 97%, 59% 100%, 44% 96%, 29% 100%, 14% 97%, 0 100%); }

.puz__piece:active {
  transform: scale(0.97);
}

.puz__piece--placed {
  opacity: 0.25;
  cursor: default;
  pointer-events: none;
}

.puz__piece--wrong {
  animation: shake 0.4s;
}

.puz__piece--next {
  box-shadow: 0 0 0 2px rgba(201, 169, 110, 0.4);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-5px); }
  75%       { transform: translateX(5px); }
}

.puz__piece-text {
  font-family: 'IM Fell English', serif;
  font-size: 0.62rem;
  font-style: italic;
  color: #2a1808;
  margin: 0;
  line-height: 1.4;
  text-align: center;
}

.puz__tear { display: none; } /* bords gérés par clip-path */

/* Lettre complète révélée */
.puz__full-letter {
  width: 100%;
  background: #f5f0e8;
  border-radius: 4px;
  padding: 1.25rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  text-align: center;
}

.puz__letter-text {
  font-family: 'IM Fell English', serif;
  font-size: 0.75rem;
  font-style: italic;
  color: #2a1808;
  white-space: pre-wrap;
  line-height: 1.7;
  margin: 0 0 1rem;
  text-align: left;
}

.puz__last-word {
  font-family: 'Cinzel', serif;
  font-size: 1rem;
  letter-spacing: 0.15em;
  color: #5a3818;
  margin: 0;
}

.letter-enter-active { transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1); }
.letter-enter-from   { opacity: 0; transform: translateY(12px); }

/* Hint */
.puz__hint {
  font-family: 'Cinzel', serif;
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(242, 232, 208, 0.35);
  text-align: center;
  transition: color 0.2s;
}

.puz__hint--error {
  color: rgba(220, 80, 60, 0.75);
}
</style>
