<template>
  <div class="ch">

    <!-- ── Overlay d'effet (fade_white ou door_opens) ── -->
    <transition name="ch-fx">
      <div v-if="phase === 'effect' || phase === 'reveal'" class="ch__fx" :class="`ch__fx--${chosen?.effect}`">
        <div v-if="chosen?.effect === 'door_opens'" class="ch__crack"></div>
      </div>
    </transition>

    <!-- ── PHASE CHOOSE ── -->
    <transition name="ch-out">
      <div v-if="phase === 'choose'" class="ch__wrap">
        <p class="ch__question">{{ enigma?.question ?? 'Que choisis-tu ?' }}</p>

        <div class="ch__options">
          <button
            v-for="opt in options"
            :key="opt.id"
            class="ch__option"
            :class="{ 'ch__option--memory': opt.memory }"
            @click="onChoose(opt)"
          >
            <div class="ch__icon-wrap">
              <img
                :src="storageUrl(opt.icon)"
                :alt="opt.label"
                class="ch__icon"
                @error="(e) => e.target.style.display = 'none'"
              />
              <span class="ch__icon-fallback">{{ opt.id === 'soleil' ? '☀' : 'Δ' }}</span>
            </div>
            <span class="ch__label">{{ opt.label }}</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- ── PHASE REVEAL ── -->
    <transition name="ch-reveal">
      <div v-if="phase === 'reveal'" class="ch__reveal" :class="`ch__reveal--${chosen?.effect}`">
        <p class="ch__ending">{{ chosen?.ending_text }}</p>
        <button class="ch__btn" @click="emit('submit', answerToSubmit)">
          Continuer →
        </button>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const STORAGE_BUCKET = 'enigmas'

const props = defineProps({
  enigma:      { type: Object,  required: true },
  answerError: { type: Boolean, default: false },
})
const emit = defineEmits(['submit'])

// ── Config ───────────────────────────────────────────────
const config = computed(() => {
  const raw = props.enigma?.config
  if (!raw) return {}
  return typeof raw === 'string' ? JSON.parse(raw) : raw
})

const options       = computed(() => config.value.options ?? [])
const answerToSubmit = computed(() => config.value.correct_answer ?? '')

// ── État ─────────────────────────────────────────────────
const phase  = ref('choose')   // 'choose' | 'effect' | 'reveal'
const chosen = ref(null)

// ── Helpers ──────────────────────────────────────────────
function storageUrl(path) {
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`
}

// ── Choix ────────────────────────────────────────────────
function onChoose(opt) {
  chosen.value = opt
  phase.value  = 'effect'
  setTimeout(() => { phase.value = 'reveal' }, 1800)
}
</script>

<style scoped>
/* ── Racine ── */
.ch {
  position: relative;
  width: 100%;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f2e8d0;
}

/* ── Overlay effet ── */
.ch__fx {
  position: fixed;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}

/* fade_white : flash lumineux */
.ch__fx--fade_white {
  background: #fff8e8;
  animation: chWhite 1.8s ease-in-out forwards;
}
@keyframes chWhite {
  0%   { opacity: 0 }
  40%  { opacity: 1 }
  100% { opacity: 0.9 }
}

/* door_opens : obscurité avec fissure dorée */
.ch__fx--door_opens {
  background: rgba(4, 2, 0, 0.92);
  animation: chDark 1.8s ease-in forwards;
}
@keyframes chDark {
  0%   { opacity: 0 }
  30%  { opacity: 1 }
  100% { opacity: 0.88 }
}

.ch__crack {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  background: linear-gradient(to bottom, transparent 0%, #c9a96e 20%, #fff4d0 50%, #c9a96e 80%, transparent 100%);
  transform: translateX(-50%) scaleY(0);
  transform-origin: center;
  box-shadow: 0 0 18px 4px rgba(201, 169, 110, 0.6), 0 0 40px 10px rgba(201, 169, 110, 0.2);
  animation: crackGrow 1.8s 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes crackGrow {
  0%   { transform: translateX(-50%) scaleY(0); opacity: 0 }
  20%  { opacity: 1 }
  100% { transform: translateX(-50%) scaleY(1); opacity: 1 }
}

/* ── PHASE CHOOSE ── */
.ch__wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  padding: 1rem;
}

.ch__question {
  font-family: 'Cinzel', serif;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #c9a96e;
  text-align: center;
  text-shadow: 0 0 20px rgba(201, 169, 110, 0.4);
}

.ch__options {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.ch__option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  padding: 1.5rem 1.2rem;
  width: 140px;
  background: rgba(8, 5, 2, 0.7);
  border: 1px solid rgba(201, 169, 110, 0.2);
  border-radius: 14px;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  -webkit-tap-highlight-color: transparent;
  color: inherit;
}
.ch__option:hover,
.ch__option:active {
  border-color: rgba(201, 169, 110, 0.6);
  transform: scale(1.04);
  box-shadow: 0 0 24px rgba(201, 169, 110, 0.15);
}
.ch__option--memory {
  border-color: rgba(201, 169, 110, 0.35);
  box-shadow: 0 0 12px rgba(201, 169, 110, 0.08);
}

.ch__icon-wrap {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.ch__icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 8px rgba(201, 169, 110, 0.3));
  position: relative;
  z-index: 1;
}
.ch__icon-fallback {
  position: absolute;
  font-size: 3rem;
  color: #c9a96e;
  text-shadow: 0 0 20px rgba(201, 169, 110, 0.5);
  line-height: 1;
}

.ch__label {
  font-family: 'IM Fell English', serif;
  font-size: 0.85rem;
  font-style: italic;
  color: #c9a96e;
  text-align: center;
  line-height: 1.3;
}

/* ── PHASE REVEAL ── */
.ch__reveal {
  position: relative;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  padding: 2rem;
  text-align: center;
}

.ch__ending {
  font-family: 'IM Fell English', serif;
  font-size: 1.3rem;
  font-style: italic;
  line-height: 1.6;
  max-width: 320px;
}
.ch__reveal--fade_white .ch__ending {
  color: #3a1e0a;
  text-shadow: none;
}
.ch__reveal--door_opens .ch__ending {
  color: #f2e8d0;
  text-shadow: 0 0 20px rgba(201, 169, 110, 0.4);
}

.ch__btn {
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
  box-shadow: 0 4px 20px rgba(201, 169, 110, 0.3);
}
.ch__btn:hover { opacity: 0.85; }

/* ── Transitions ── */
.ch-out-leave-active { transition: opacity 0.5s ease, transform 0.5s ease; }
.ch-out-leave-to     { opacity: 0; transform: scale(0.96); }

.ch-fx-enter-active { transition: opacity 0.3s ease; }
.ch-fx-enter-from   { opacity: 0; }

.ch-reveal-enter-active { transition: opacity 1s ease 0.4s; }
.ch-reveal-enter-from   { opacity: 0; }
</style>
