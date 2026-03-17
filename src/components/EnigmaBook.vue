<template>
  <div class="book">

    <p class="book__question">{{ enigma.question }}</p>

    <!-- Livre ouvert -->
    <div class="book__open">

      <!-- Page gauche -->
      <div class="book__page book__page--left">
        <div class="book__page-num">12</div>
        <p class="book__text">
          <template v-for="(p, i) in partsLeft" :key="i">
            <span v-if="p.bold" class="book__bold-letter">{{ p.boldChar }}</span><template v-if="p.bold">{{ p.rest }}</template>
            <template v-else>{{ p.text }}</template>
          </template>
        </p>
      </div>

      <!-- Reliure -->
      <div class="book__spine"></div>

      <!-- Page droite -->
      <div class="book__page book__page--right">
        <div class="book__page-num book__page-num--right">13</div>
        <p class="book__text">
          <template v-for="(p, i) in partsRight" :key="i">
            <span v-if="p.bold" class="book__bold-letter">{{ p.boldChar }}</span><template v-if="p.bold">{{ p.rest }}</template>
            <template v-else>{{ p.text }}</template>
          </template>
        </p>
      </div>

    </div>

    <form class="book__form" @submit.prevent="onSubmit">
      <input
        v-model="answer"
        ref="inputRef"
        type="text"
        inputmode="numeric"
        class="book__input"
        :class="{ 'book__input--error': answerError }"
        placeholder="Code à 4 chiffres..."
        autocomplete="off"
        maxlength="4"
      />
      <button class="book__btn" type="submit">Valider →</button>
    </form>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  enigma: { type: Object, required: true },
  answerError: { type: Boolean, default: false },
})
const emit = defineEmits(['submit'])

const answer = ref('')
const inputRef = ref(null)

const config = computed(() => {
  if (!props.enigma?.config) return {}
  if (typeof props.enigma.config === 'string') {
    try { return JSON.parse(props.enigma.config) } catch { return {} }
  }
  return props.enigma.config
})

// Parse le texte : *X* = première lettre en gras
// Ex: "la *C*heminée" → [{ text: 'la ' }, { bold: true, text: 'Cheminée' }]
function parseText(text) {
  const parts = []
  const re = /\*([A-ZÀ-Öa-zà-ö])\*(\S*)/g
  let last = 0
  let m
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ bold: false, text: text.slice(last, m.index) })
    parts.push({ bold: true, boldChar: m[1], rest: m[2] })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ bold: false, text: text.slice(last) })
  return parts
}

const DEFAULT_LEFT = `Il faisait froid ce soir-là. La pluie ne s'était pas arrêtée depuis le matin, battant les vitres avec une régularité presque mécanique. Il avait allumé la *C*heminée comme chaque soir d'hiver, s'installant dans le vieux fauteuil en cuir qui craquait toujours au même endroit. Les flammes dansaient, projetant des ombres mouvantes sur les murs couverts de livres. Il aimait ces moments. Personne ne viendrait le déranger. Il en était certain depuis longtemps déjà.`

const DEFAULT_RIGHT = `Il observait les flammes *A*valer doucement le bois sec, une bûche après l'autre, avec cette patience que seul le feu possède vraiment. L'appartement sentait la cire chaude et le papier ancien. La *G*rille de la fenêtre découpait la nuit en petits carreaux noirs. Au-delà, la rue était vide. Un réverbère se reflétait dans une flaque d'eau. Quelque chose dans l'air *É*tait différent ce soir. Une tension imperceptible, comme avant un orage. Le silence avait changé de texture.`

const partsLeft  = computed(() => parseText(config.value.text_left  ?? DEFAULT_LEFT))
const partsRight = computed(() => parseText(config.value.text_right ?? DEFAULT_RIGHT))

function onSubmit() {
  if (!answer.value.trim()) return
  emit('submit', answer.value.trim())
}

onMounted(() => inputRef.value?.focus())
</script>

<style scoped>
.book {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
  padding: 1rem 0;
}

.book__question {
  font-family: 'Cinzel', serif;
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(201, 169, 110, 0.55);
  text-align: center;
  line-height: 1.7;
  margin: 0;
  max-width: 360px;
}

/* ── LIVRE OUVERT ── */
.book__open {
  display: flex;
  width: 100%;
  max-width: 420px;
  min-height: 280px;
  border-radius: 3px 6px 6px 3px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.75),
    0 4px 12px rgba(0, 0, 0, 0.5);
}

.book__page {
  flex: 1;
  padding: 1.25rem 1rem 1.5rem;
  position: relative;
  background:
    repeating-linear-gradient(
      180deg,
      transparent,
      transparent 23px,
      rgba(80, 40, 5, 0.07) 23px,
      rgba(80, 40, 5, 0.07) 24px
    ),
    linear-gradient(180deg, #fdf8ec 0%, #f8f0d8 100%);
}

.book__page--left {
  border-radius: 3px 0 0 3px;
  background-image:
    repeating-linear-gradient(
      180deg,
      transparent,
      transparent 23px,
      rgba(80, 40, 5, 0.07) 23px,
      rgba(80, 40, 5, 0.07) 24px
    ),
    linear-gradient(180deg, #f8f0d8 0%, #f0e8cc 100%);
  box-shadow: inset -4px 0 8px rgba(0,0,0,0.08);
}

.book__page--right {
  border-radius: 0 6px 6px 0;
}

.book__spine {
  width: 10px;
  background: linear-gradient(180deg,
    #5a3010 0%,
    #3a1e08 20%,
    #5a3010 50%,
    #3a1e08 80%,
    #5a3010 100%
  );
  box-shadow:
    inset -2px 0 4px rgba(0,0,0,0.4),
    inset 2px 0 4px rgba(255,200,100,0.1);
  flex-shrink: 0;
}

.book__page-num {
  font-family: 'IM Fell English', serif;
  font-size: 0.65rem;
  color: rgba(80, 40, 5, 0.3);
  text-align: left;
  margin-bottom: 0.75rem;
}
.book__page-num--right { text-align: right; }

.book__text {
  font-family: 'IM Fell English', serif;
  font-size: 0.85rem;
  line-height: 1.72;
  color: #1a0c06;
  margin: 0;
  text-align: justify;
}

.book__bold-letter {
  font-family: 'Cinzel', serif;
  font-size: 1.05em;
  font-weight: 700;
  color: #5a0a0a;
  letter-spacing: 0.02em;
}

/* ── FORMULAIRE ── */
.book__form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 420px;
}

.book__input {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(242, 232, 208, 0.2);
  background: rgba(242, 232, 208, 0.08);
  color: #f2e8d0;
  font-family: 'Cinzel', serif;
  font-size: 1.3rem;
  letter-spacing: 0.3em;
  text-align: center;
  transition: border-color 0.2s;
}
.book__input::placeholder { color: rgba(242, 232, 208, 0.3); letter-spacing: 0.1em; font-size: 0.9rem; }
.book__input:focus { outline: none; border-color: rgba(201, 169, 110, 0.5); }

.book__input--error {
  border-color: rgba(220, 80, 60, 0.6);
  animation: shake 0.35s;
}

@keyframes shake {
  0%,100% { transform: translateX(0); }
  25%     { transform: translateX(-6px); }
  75%     { transform: translateX(6px); }
}

.book__btn {
  background: rgba(90, 56, 24, 0.85);
  color: #f2e8d0;
  border: 1px solid rgba(201, 169, 110, 0.4);
  padding: 0.85rem;
  border-radius: 8px;
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  cursor: pointer;
  transition: opacity 0.2s;
}
.book__btn:hover { opacity: 0.85; }
</style>
