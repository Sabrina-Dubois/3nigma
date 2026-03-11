<template>
  <div class="ci">

    <!-- ── PHASE DÉCODAGE ── -->
    <div v-if="phase === 'decode'" class="ci__wrap">

      <div class="ci__header">
        <p class="ci__delta">Δ = 3</p>
      </div>

      <!-- noms chiffrés — cliquer pour sélectionner -->
      <div class="ci__names">
        <div
          v-for="(enc, i) in encodedNames"
          :key="i"
          class="ci__name"
          :class="{
            'ci__name--active':  selected === i,
            'ci__name--decoded': decoded.has(i),
            'ci__name--wrong':   wrong.has(i),
          }"
          @click="select(i)"
        >
          <span class="ci__name-enc">{{ enc }}</span>
          <span v-if="decoded.has(i)" class="ci__name-dec">→ {{ decoded.get(i) }}</span>
        </div>
      </div>

      <!-- zone de décodage du nom sélectionné -->
      <transition name="ci-slide">
        <div v-if="selected !== null" class="ci__decode-zone">
          <form class="ci__form" @submit.prevent="validate">
            <input
              ref="inputEl"
              v-model="answer"
              class="ci__input"
              :class="{ 'ci__input--error': shakeInput }"
              type="text"
              :placeholder="encodedNames[selected]?.toLowerCase() + '…'"
              autocomplete="off"
              autocapitalize="characters"
              spellcheck="false"
              maxlength="12"
            />
            <button class="ci__submit" type="submit" :disabled="!answer.trim()">
              Valider
            </button>
          </form>
        </div>
      </transition>

    </div>

    <!-- ── PHASE REVEAL ── -->
    <transition name="ci-fade">
      <div v-if="phase === 'reveal'" class="ci__reveal">

        <div class="ci__freeze">
          <img
            v-if="!photoError"
            :src="storageUrl(config.reveal_photo || 'eclipse/jour5-silhouette.jpg')"
            class="ci__photo"
            draggable="false"
            @error="photoError = true"
          />
          <div class="ci__photo-vignette"></div>
          <p class="ci__found-name">{{ target }}</p>
        </div>

        <p class="ci__reveal-text">Il est là chaque jour.</p>

        <button class="ci__btn" @click="emit('submit', target)">
          C'est lui →
        </button>

      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'

const props = defineProps({
  enigma:      { type: Object,  required: true },
  answerError: { type: Boolean, default: false },
})
const emit = defineEmits(['submit'])

const config = computed(() => {
  const raw = props.enigma?.config
  if (!raw) return {}
  return typeof raw === 'string' ? JSON.parse(raw) : raw
})

const encodedNames = computed(() => config.value.encoded_names ?? [])
const target       = computed(() => config.value.target_decoded ?? 'FERRAN')

const BUCKET = 'enigmas'
function storageUrl(path) {
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
}

const phase      = ref('decode')
const selected   = ref(null)
const photoError = ref(false)
const answer     = ref('')
const decoded    = ref(new Map())  // index → mot décodé
const wrong      = ref(new Set())
const shakeInput = ref(false)
const inputEl    = ref(null)

function select(i) {
  selected.value = i
  answer.value = ''
  nextTick(() => inputEl.value?.focus())
}

function validate() {
  const word = answer.value.trim().toUpperCase()
  if (!word) return

  if (word === target.value) {
    // trouvé !
    decoded.value = new Map([...decoded.value, [selected.value, word]])
    setTimeout(() => { phase.value = 'reveal' }, 400)
  } else {
    // mauvais nom ou mauvais décodage
    shakeInput.value = true
    wrong.value = new Set([...wrong.value, selected.value])
    decoded.value = new Map([...decoded.value, [selected.value, word]])
    setTimeout(() => { shakeInput.value = false }, 400)
    answer.value = ''
  }
}

// focus auto quand selected change
watch(selected, () => {
  nextTick(() => inputEl.value?.focus())
})
</script>

<style scoped>
.ci {
  width: 100%;
  color: #f2e8d0;
}

.ci__wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

/* header */
.ci__header { text-align: center; }
.ci__delta {
  font-family: 'Cinzel', serif;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #c9a96e;
  text-shadow: 0 0 20px rgba(201, 169, 110, 0.5);
}
.ci__hint {
  font-family: 'IM Fell English', serif;
  font-size: 0.85rem;
  font-style: italic;
  color: #a08060;
  margin-top: 0.2rem;
}

/* noms */
.ci__names {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
  max-width: 360px;
}
.ci__name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(201, 169, 110, 0.12);
  background: rgba(8, 5, 2, 0.6);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  user-select: none;
}
.ci__name--active {
  border-color: rgba(201, 169, 110, 0.55);
  background: rgba(201, 169, 110, 0.07);
}
.ci__name--decoded {
  border-color: rgba(201, 169, 110, 0.2);
}
.ci__name--wrong {
  opacity: 0.55;
}
.ci__name-enc {
  font-family: 'Cinzel', serif;
  font-size: 1rem;
  letter-spacing: 0.18em;
  color: #f2e8d0;
}
.ci__name-dec {
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  color: #c9a96e;
}

/* zone décodage */
.ci__decode-zone {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.ci__decode-label {
  font-family: 'IM Fell English', serif;
  font-size: 0.85rem;
  font-style: italic;
  color: #a08060;
  text-align: center;
}
.ci__decode-label strong {
  font-style: normal;
  color: #c9a96e;
  letter-spacing: 0.15em;
}
.ci__form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ci__input {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(201, 169, 110, 0.25);
  background: rgba(0, 0, 0, 0.5);
  color: #c9a96e;
  font-family: 'Cinzel', serif;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-align: center;
  text-transform: uppercase;
  outline: none;
  transition: border-color 0.2s;
}
.ci__input:focus { border-color: rgba(201, 169, 110, 0.5); }
.ci__input--error {
  border-color: rgba(200, 60, 40, 0.6);
  animation: shake 0.35s;
}
@keyframes shake {
  0%,100% { transform: translateX(0) }
  25%     { transform: translateX(-5px) }
  75%     { transform: translateX(5px) }
}
.ci__submit {
  padding: 0.75rem;
  background: rgba(201, 169, 110, 0.15);
  color: #c9a96e;
  border: 1px solid rgba(201, 169, 110, 0.35);
  border-radius: 10px;
  font-family: 'Cinzel', serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s;
}
.ci__submit:hover:not(:disabled) { background: rgba(201, 169, 110, 0.25); }
.ci__submit:disabled { opacity: 0.3; cursor: default; }

/* reveal */
.ci__reveal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}
.ci__freeze {
  position: relative;
  width: 100%;
  max-width: 400px;
  min-height: 120px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(201, 169, 110, 0.2);
  background: rgba(8, 5, 2, 0.8);
  box-shadow: 0 0 40px rgba(0,0,0,0.8);
}
.ci__photo {
  width: 100%;
  display: block;
  aspect-ratio: 4/3;
  object-fit: cover;
  filter: blur(1.5px);
}
.ci__photo-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%);
}
.ci__found-name {
  position: absolute;
  bottom: 1rem;
  left: 0; right: 0;
  text-align: center;
  font-family: 'Cinzel', serif;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  color: #c9a96e;
  text-shadow: 0 0 20px rgba(201,169,110,0.7), 0 2px 8px rgba(0,0,0,0.8);
}
.ci__reveal-text {
  font-family: 'IM Fell English', serif;
  font-size: 1rem;
  color: #a08060;
  font-style: italic;
}
.ci__btn {
  padding: 0.9rem 2.5rem;
  background: #c9a96e;
  color: #1a0d02;
  border: none;
  border-radius: 10px;
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  cursor: pointer;
  transition: opacity 0.2s;
  box-shadow: 0 4px 20px rgba(201,169,110,0.3);
}
.ci__btn:hover { opacity: 0.85; }

/* transitions */
.ci-fade-enter-active  { transition: opacity 0.8s ease; }
.ci-fade-enter-from    { opacity: 0; }
.ci-slide-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.ci-slide-enter-from   { opacity: 0; transform: translateY(-6px); }
</style>
