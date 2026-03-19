<template>
  <div class="padlock">

    <p class="padlock__question">{{ enigma.question }}</p>

    <!-- Cadenas -->
    <div class="padlock__lock" :class="{ 'padlock__lock--shake': shaking }">

      <!-- Arceau -->
      <div class="padlock__shackle-wrap">
        <div class="padlock__shackle" />
      </div>

      <!-- Boîtier -->
      <div class="padlock__case" :class="{ 'padlock__case--open': opened }">

        <!-- Trou de l'arceau -->
        <div class="padlock__hole padlock__hole--left" />
        <div class="padlock__hole padlock__hole--right" />

        <!-- Roues chiffrées -->
        <div class="padlock__wheels">
          <div v-for="(digit, i) in digits" :key="i" class="padlock__wheel">
            <button class="padlock__arrow padlock__arrow--up" @click="change(i, 1)">▲</button>
            <div class="padlock__drum">
              <div class="padlock__drum-inner">
                <span class="padlock__digit">{{ digit }}</span>
              </div>
            </div>
            <button class="padlock__arrow padlock__arrow--down" @click="change(i, -1)">▼</button>
          </div>
        </div>

        <!-- Bouton déverrouillage -->
        <button
          class="padlock__btn"
          :class="{ 'padlock__btn--open': opened }"
          :disabled="opened"
          @click="onSubmit"
        >
          <span v-if="opened">✓ Ouvert</span>
          <span v-else>Ouvrir</span>
        </button>

      </div>
    </div>

    <p class="padlock__hint" :class="{ 'padlock__hint--error': shaking }">
      {{ shaking ? 'Code incorrect…' : (config.hint ?? enigma.hint ?? 'Entre le code à 4 chiffres') }}
    </p>

    <!-- Image révélée -->
    <Transition name="reveal">
      <div v-if="opened && config.reveal_image" class="padlock__reveal">
        <img :src="storageUrl(config.reveal_image)" class="padlock__reveal-img" draggable="false" />
        <div class="padlock__reveal-glow" />
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

function storageUrl(path) {
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/enigmas/${path}`
}

const props = defineProps({
  enigma: Object,
  answerError: Boolean,
  solved: { type: Boolean, default: false },
})
const emit = defineEmits(['submit'])

const config = computed(() => {
  try {
    return typeof props.enigma.config === 'string'
      ? JSON.parse(props.enigma.config)
      : props.enigma.config || {}
  } catch { return {} }
})

const digits = ref(Array(config.value.digits ?? 4).fill(0))
const shaking = ref(false)
const opened = ref(false)

watch(() => props.answerError, (val) => {
  if (val) {
    shaking.value = true
    setTimeout(() => { shaking.value = false }, 500)
  }
})

function change(i, dir) {
  if (opened.value) return
  digits.value[i] = (digits.value[i] + dir + 10) % 10
}

function onSubmit() {
  if (opened.value) return
  const code = digits.value.join('')
  const localCode = config.value.code != null
    ? String(config.value.code)
    : config.value.answer != null
      ? String(config.value.answer)
      : null

  if (localCode !== null && code === localCode) {
    // Bonne réponse vérifiée localement :
    // 1. Ouvrir immédiatement (animation visible avant navigation)
    // 2. Émettre après 2.5s → le serveur valide → navigation vers succès
    opened.value = true
    setTimeout(() => emit('submit', code), 7000)
  } else {
    // Pas de code local ou code inconnu → émettre directement
    // Le serveur retournera answerError si faux
    emit('submit', code)
  }
}
</script>

<style scoped>
.padlock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  padding: 1rem 0;
}

.padlock__question {
  font-family: 'IM Fell English', serif;
  font-size: 1.05rem;
  color: #f2e8d0;
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

/* ── Cadenas global ── */
.padlock__lock {
  display: flex;
  flex-direction: column;
  align-items: center;
  filter: drop-shadow(0 12px 32px rgba(0, 0, 0, 0.7));
}

.padlock__lock--shake {
  animation: shake 0.45s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-8px) rotate(-1deg); }
  40%       { transform: translateX(8px) rotate(1deg); }
  60%       { transform: translateX(-6px); }
  80%       { transform: translateX(6px); }
}

/* ── Arceau ── */
.padlock__shackle-wrap {
  width: 100px;
  height: 60px;
  overflow: visible;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.padlock__shackle {
  width: 70px;
  height: 56px;
  border: 12px solid #b08a40;
  border-bottom: none;
  border-radius: 35px 35px 0 0;
  background: transparent;
  box-shadow:
    inset 0 3px 6px rgba(255, 220, 100, 0.2),
    0 -2px 8px rgba(0, 0, 0, 0.5);
  transform-origin: bottom right;
  transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

/* Reflet métallique sur l'arceau */
.padlock__shackle::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 6px;
  right: 6px;
  height: 40%;
  border-radius: 20px 20px 0 0;
  border-top: 2px solid rgba(255, 240, 160, 0.35);
  border-left: 2px solid rgba(255, 240, 160, 0.2);
  pointer-events: none;
}

.padlock__shackle--open {
  opacity: 0;
  transform: translateY(-20px);
}

/* ── Boîtier ── */
.padlock__case {
  position: relative;
  width: 180px;
  background: linear-gradient(160deg, #8a6420 0%, #5a3e0a 40%, #3d2806 100%);
  border-radius: 20px;
  padding: 1.2rem 1.2rem 1rem;
  border: 1px solid rgba(201, 169, 110, 0.5);
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.8),
    inset 0 2px 6px rgba(255, 220, 100, 0.2),
    inset 0 -4px 8px rgba(0, 0, 0, 0.5);
  transition: box-shadow 0.5s;
}

/* Reflet sur le boîtier */
.padlock__case::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, transparent 50%);
  pointer-events: none;
}

.padlock__case--open {
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.8),
    0 0 30px rgba(100, 220, 100, 0.35),
    inset 0 2px 6px rgba(255, 220, 100, 0.2),
    inset 0 -4px 8px rgba(0, 0, 0, 0.5);
}

/* Trous de l'arceau */
.padlock__hole {
  position: absolute;
  top: -1px;
  width: 14px;
  height: 18px;
  background: #1a0e04;
  border-radius: 0 0 7px 7px;
  box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.8);
}

.padlock__hole--left  { left: 38px; }
.padlock__hole--right { right: 38px; }

/* ── Roues ── */
.padlock__wheels {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.9rem;
}

.padlock__wheel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.padlock__arrow {
  background: none;
  border: none;
  color: rgba(201, 169, 110, 0.7);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;
  line-height: 1;
}

.padlock__arrow:hover {
  color: #c9a96e;
  background: rgba(201, 169, 110, 0.1);
}

/* Tambour */
.padlock__drum {
  width: 36px;
  height: 52px;
  background: linear-gradient(180deg, #0a0602 0%, #120c04 40%, #0a0602 100%);
  border: 1px solid rgba(201, 169, 110, 0.35);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow:
    inset 0 2px 6px rgba(0, 0, 0, 0.7),
    inset 0 -2px 4px rgba(0, 0, 0, 0.5);
}

/* Lignes de séparation des chiffres */
.padlock__drum::before,
.padlock__drum::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(201, 169, 110, 0.15);
}

.padlock__drum::before { top: 33%; }
.padlock__drum::after  { bottom: 33%; }

.padlock__drum-inner {
  position: relative;
  z-index: 1;
}

.padlock__digit {
  font-family: 'Cinzel', serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: #e8d48a;
  text-shadow: 0 0 8px rgba(232, 212, 138, 0.5);
  line-height: 1;
  display: block;
}

/* ── Bouton ── */
.padlock__btn {
  width: 100%;
  padding: 0.6rem;
  border-radius: 10px;
  border: 1px solid rgba(201, 169, 110, 0.4);
  background: linear-gradient(180deg, rgba(201, 169, 110, 0.25) 0%, rgba(201, 169, 110, 0.1) 100%);
  color: #f2e8d0;
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.padlock__btn:hover:not(:disabled) {
  background: linear-gradient(180deg, rgba(201, 169, 110, 0.4) 0%, rgba(201, 169, 110, 0.2) 100%);
  border-color: rgba(201, 169, 110, 0.7);
}

.padlock__btn--open {
  background: linear-gradient(180deg, rgba(80, 200, 80, 0.3) 0%, rgba(60, 160, 60, 0.15) 100%);
  border-color: rgba(100, 220, 100, 0.5);
  color: rgba(180, 255, 180, 0.9);
  cursor: default;
}

/* ── Hint ── */
.padlock__hint {
  font-family: 'Cinzel', serif;
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(242, 232, 208, 0.35);
  text-align: center;
  transition: color 0.2s;
}

.padlock__hint--error {
  color: rgba(220, 80, 60, 0.8);
}

/* ── Image révélée ── */
.padlock__reveal {
  position: relative;
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.padlock__reveal-img {
  width: 100%;
  display: block;
}

.padlock__reveal-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 60%, rgba(0, 0, 0, 0.4) 100%);
  pointer-events: none;
}

.reveal-enter-active {
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
