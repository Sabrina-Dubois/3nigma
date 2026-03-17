<template>
  <div class="scene">

    <!-- ── ENVELOPPE IMAGE ── -->
    <Transition name="fade">
      <div v-if="!opened" class="env-wrap" @click="opened = true">
        <img :src="envelopeImg" alt="Enveloppe" class="env-img" />
        <p class="tap-hint">Appuyer pour ouvrir</p>
      </div>
    </Transition>

    <!-- ── LETTRE MANUSCRITE ── -->
    <Transition name="letter-appear">
      <div v-if="opened" class="letter-wrap">

        <div class="letter">
          <!-- Lignes réglées -->
          <div class="letter__ruled">
            <div v-for="i in 14" :key="i" class="letter__rule"></div>
          </div>

          <!-- En-tête manuscrit -->
          <div class="letter__header">
            <span class="letter__loc">Paris, </span>
            <span class="letter__date">{{ today }}</span>
          </div>

          <!-- Texte manuscrit -->
          <p class="letter__text">{{ enigma.question }}</p>

          <!-- Heure griffonnée au crayon -->
          <span class="letter__pencil">{{ config.prefilled_hour }}</span>
        </div>

        <!-- Formulaire réponse -->
        <form class="answer-form" @submit.prevent="onSubmit">
          <input
            v-model="answer"
            ref="inputRef"
            type="text"
            class="answer-form__input"
            :class="{ 'answer-form__input--error': answerError }"
            placeholder="Votre réponse..."
            autocomplete="off"
            autocapitalize="characters"
          />
          <button class="answer-form__btn" type="submit">Valider →</button>
        </form>

      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
const props = defineProps({
  enigma: { type: Object, required: true },
  answerError: { type: Boolean, default: false },
})
const emit = defineEmits(['submit'])

const opened  = ref(false)
const answer  = ref('')
const inputRef = ref(null)

const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

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

const envelopeImg = computed(() => storageUrl(config.value.image))

watch(opened, async (val) => {
  if (val) {
    await nextTick()
    inputRef.value?.focus()
  }
})

function onSubmit() {
  if (!answer.value.trim()) return
  emit('submit', answer.value.trim())
}
</script>

<style scoped>
.scene {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 2rem 0.75rem;
  min-height: 60vh;
  justify-content: center;
}

/* ── ENVELOPPE ── */
.env-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  cursor: pointer;
}

.env-img {
  width: 340px;
  max-width: 92vw;
  filter: drop-shadow(0 12px 40px rgba(0,0,0,0.65));
  transition: transform 0.2s;
  user-select: none;
}
.env-img:active { transform: scale(0.96); }

.tap-hint {
  font-family: 'Cinzel', serif;
  font-size: 0.6rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: rgba(242, 232, 208, 0.4);
}

/* ── LETTRE ── */
.letter-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  max-width: min(580px, 96vw);
}

.letter {
  position: relative;
  background:
    repeating-linear-gradient(
      180deg,
      transparent,
      transparent 31px,
      rgba(100, 60, 10, 0.1) 31px,
      rgba(100, 60, 10, 0.1) 32px
    ),
    linear-gradient(135deg, #fdf6dc 0%, #f5e9c0 50%, #f0e4b8 100%);
  width: 100%;
  border-radius: 2px;
  padding: 1.75rem 1.75rem 3.5rem;
  box-shadow:
    0 2px 0 rgba(120,80,20,0.15),
    0 12px 48px rgba(0,0,0,0.6),
    inset 0 0 0 1px rgba(120, 80, 20, 0.08);
  min-height: 280px;
  overflow: visible;
}

/* Lignes réglées — remplacées par le background repeating-linear-gradient */
.letter__ruled { display: none; }
.letter__rule  { display: none; }

/* En-tête */
.letter__header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(100, 60, 10, 0.12);
}
.letter__loc,
.letter__date {
  font-family: 'La Belle Aurore', cursive;
  font-size: 1rem;
  color: rgba(30, 12, 4, 0.55);
  font-style: italic;
}

/* Texte manuscrit */
.letter__text {
  position: relative;
  z-index: 1;
  font-family: 'La Belle Aurore', cursive;
  font-size: 1.15rem;
  line-height: 1.9;
  color: #1a0c06;
  margin: 0;
  white-space: pre-line;
}

/* Heure au crayon */
.letter__pencil {
  position: absolute;
  bottom: 1rem;
  right: 1.25rem;
  font-family: 'La Belle Aurore', cursive;
  font-size: 1rem;
  color: rgba(40, 25, 5, 0.32);
  transform: rotate(-4deg);
  pointer-events: none;
}

/* ── FORMULAIRE ── */
.answer-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.answer-form__input {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(242, 232, 208, 0.2);
  background: rgba(242, 232, 208, 0.08);
  color: #f2e8d0;
  font-family: 'La Belle Aurore', cursive;
  font-size: 1.15rem;
  transition: border-color 0.2s;
}
.answer-form__input::placeholder { color: rgba(242, 232, 208, 0.35); }
.answer-form__input:focus { outline: none; border-color: rgba(201, 169, 110, 0.5); }

.answer-form__input--error {
  border-color: rgba(220, 80, 60, 0.6);
  animation: shake 0.35s;
}

@keyframes shake {
  0%,100% { transform: translateX(0); }
  25%     { transform: translateX(-6px); }
  75%     { transform: translateX(6px); }
}

.answer-form__btn {
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
.answer-form__btn:hover { opacity: 0.85; }

/* ── TRANSITIONS ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.letter-appear-enter-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.letter-appear-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.96);
}
</style>
