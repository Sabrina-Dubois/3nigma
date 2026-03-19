<template>
  <div class="ch">

    <!-- ── Overlay d'effet (fade_white ou door_opens) ── -->
    <transition name="ch-fx">
      <div v-if="phase === 'effect' || phase === 'reveal'" class="ch__fx" :class="`ch__fx--${chosen?.effect}`">
        <div v-if="chosen?.effect === 'door_opens'" class="ch__door-light"></div>
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
                v-if="opt.icon && opt.icon.includes('/')"
                :src="storageUrl(opt.icon)"
                :alt="opt.label"
                class="ch__icon"
                @error="(e) => e.target.style.display = 'none'"
              />
              <span class="ch__icon-fallback">{{ opt.icon && !opt.icon.includes('/') ? opt.icon : 'Δ' }}</span>
            </div>
            <span class="ch__label">{{ opt.label }}</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- ── FIN SOLEIL : écran blanc ── -->
    <transition name="ch-reveal">
      <div v-if="phase === 'reveal' && chosen?.effect === 'fade_white'" class="ch__reveal-white">
        <p class="ch__ending-white">{{ chosen?.ending_text }}</p>
        <button class="ch__btn ch__btn--dark" @click="onContinue">
          Continuer →
        </button>
      </div>
    </transition>

    <!-- ── FIN ÉVEILLÉ : écran sombre, fissure de lumière ── -->
    <transition name="ch-reveal">
      <div v-if="phase === 'reveal' && chosen?.effect === 'door_opens'" class="ch__reveal-dark">
        <p class="ch__ending-dark">{{ chosen?.ending_text }}</p>
        <button class="ch__btn ch__btn--gold" @click="onContinue">
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

function onContinue() {
  sessionStorage.setItem('enigmaChoice', chosen.value?.id ?? '')
  emit('submit', answerToSubmit.value)
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

/* door_opens : obscurité totale */
.ch__fx--door_opens {
  background: #020100;
  animation: chDark 0.6s ease-in forwards;
}
@keyframes chDark {
  0%   { opacity: 0 }
  100% { opacity: 1 }
}

/* ── Explosion de lumière ── */
.ch__door-light {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* rayons (conic-gradient) */
.ch__door-light::before {
  content: '';
  position: absolute;
  width: 300vmax;
  height: 300vmax;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(255, 230, 130, 0.25) 8deg,
    transparent 16deg,
    rgba(255, 240, 160, 0.15) 22deg,
    transparent 30deg,
    rgba(255, 230, 130, 0.3)  38deg,
    transparent 46deg,
    rgba(255, 245, 180, 0.2)  54deg,
    transparent 62deg,
    rgba(255, 230, 130, 0.25) 70deg,
    transparent 80deg,
    rgba(255, 240, 160, 0.2)  88deg,
    transparent 96deg,
    rgba(255, 230, 130, 0.3)  106deg,
    transparent 116deg,
    rgba(255, 245, 180, 0.15) 124deg,
    transparent 132deg,
    rgba(255, 230, 130, 0.25) 142deg,
    transparent 152deg,
    rgba(255, 240, 160, 0.2)  160deg,
    transparent 170deg,
    rgba(255, 230, 130, 0.3)  178deg,
    transparent 188deg,
    rgba(255, 245, 180, 0.2)  196deg,
    transparent 206deg,
    rgba(255, 230, 130, 0.25) 216deg,
    transparent 226deg,
    rgba(255, 240, 160, 0.15) 234deg,
    transparent 244deg,
    rgba(255, 230, 130, 0.3)  254deg,
    transparent 264deg,
    rgba(255, 245, 180, 0.2)  272deg,
    transparent 282deg,
    rgba(255, 230, 130, 0.25) 292deg,
    transparent 302deg,
    rgba(255, 240, 160, 0.2)  310deg,
    transparent 320deg,
    rgba(255, 230, 130, 0.3)  330deg,
    transparent 340deg,
    rgba(255, 245, 180, 0.15) 350deg,
    transparent 360deg
  );
  transform: scale(0) rotate(0deg);
  animation: raysExplode 1.2s 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards,
             raysSpin 8s 1.5s linear infinite;
}
@keyframes raysExplode {
  0%   { transform: scale(0) rotate(-20deg); opacity: 0 }
  30%  { opacity: 1 }
  100% { transform: scale(1) rotate(0deg); opacity: 1 }
}
@keyframes raysSpin {
  to { transform: scale(1) rotate(360deg) }
}

/* noyau central brillant */
.ch__door-light::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 240, 160, 0.7)  8%,
    rgba(255, 220, 100, 0.4)  20%,
    rgba(201, 169, 110, 0.15) 40%,
    transparent 65%
  );
  transform: scale(0);
  animation: coreExplode 1s 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes coreExplode {
  0%   { transform: scale(0); opacity: 0 }
  20%  { opacity: 1 }
  100% { transform: scale(1); opacity: 1 }
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
  width: 130px;
  height: 130px;
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
  font-size: 5rem;
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

/* ── FIN SOLEIL ── */
.ch__reveal-white {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: #f5eed8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  padding: 2rem;
  text-align: center;
}
.ch__ending-white {
  font-family: 'IM Fell English', serif;
  font-size: 1.4rem;
  font-style: italic;
  line-height: 1.7;
  color: #3a1e0a;
  max-width: 300px;
}

/* ── FIN ÉVEILLÉ ── */
.ch__reveal-dark {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: #050301;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  padding: 2rem;
  text-align: center;
}
.ch__ending-dark {
  font-family: 'IM Fell English', serif;
  font-size: 1.4rem;
  font-style: italic;
  line-height: 1.7;
  color: #c9a96e;
  text-shadow: 0 0 30px rgba(201, 169, 110, 0.5);
  max-width: 300px;
}

/* ── Boutons ── */
.ch__btn {
  padding: 0.9rem 2.5rem;
  border: none;
  border-radius: 10px;
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  cursor: pointer;
  transition: opacity 0.2s;
}
.ch__btn--dark {
  background: #3a1e0a;
  color: #f5eed8;
  box-shadow: 0 4px 20px rgba(58, 30, 10, 0.3);
}
.ch__btn--gold {
  background: #c9a96e;
  color: #050301;
  box-shadow: 0 4px 30px rgba(201, 169, 110, 0.4);
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
