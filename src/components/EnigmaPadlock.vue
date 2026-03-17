<template>
  <div class="padlock">

    <p class="padlock__question">{{ enigma.question }}</p>

    <div class="padlock__body">

      <!-- Arceau -->
      <div class="padlock__shackle" :class="{ 'open': opened }"></div>

      <!-- Boîtier -->
      <div class="padlock__case" :class="{
        'error': shaking,
        'open': opened
      }">

        <!-- Roues -->
        <div class="padlock__wheels">
          <div v-for="(digit, i) in digits" :key="i" class="padlock__wheel">
            <button @click="change(i, 1)">▲</button>
            <div class="padlock__digit">{{ digit }}</div>
            <button @click="change(i, -1)">▼</button>
          </div>
        </div>

        <!-- Bouton -->
        <button class="padlock__btn" @click="onSubmit">
          {{ opened ? '✓' : 'Ouvrir' }}
        </button>

      </div>
    </div>

    <p class="padlock__hint" :class="{ error: shaking }">
      {{ shaking ? 'Code incorrect…' : (config.hint ?? enigma.hint ?? 'Entre le code') }}
    </p>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  enigma: Object,
  answerError: Boolean
})

const emit = defineEmits(['submit'])

const config = computed(() => {
  try {
    return typeof props.enigma.config === 'string'
      ? JSON.parse(props.enigma.config)
      : props.enigma.config || {}
  } catch {
    return {}
  }
})

const digits = ref(Array(config.value.digits ?? 4).fill(0))
const shaking = ref(false)
const opened = ref(false)

watch(() => props.answerError, (val) => {
  if (val) {
    shaking.value = true
    setTimeout(() => shaking.value = false, 500)
  }
})

function change(i, dir) {
  if (opened.value) return
  digits.value[i] = (digits.value[i] + dir + 10) % 10
}

function onSubmit() {
  const code = digits.value.join('')
  const good = code === (config.value.code ?? '')

  if (good) {
    opened.value = true
  } else {
    shaking.value = true
    setTimeout(() => shaking.value = false, 500)
  }

  emit('submit', code)
}
</script>

<style scoped>
.padlock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

/* Question */
.padlock__question {
  color: #f2e8d0;
  text-align: center;
}

/* Structure */
.padlock__body {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Arceau */
.padlock__shackle {
  width: 80px;
  height: 50px;
  border: 10px solid #c9a96e;
  border-bottom: none;
  border-radius: 40px 40px 0 0;
  transition: transform 0.4s;
}

.padlock__shackle.open {
  transform: translateY(-12px) rotate(-15deg);
}

/* Boîtier */
.padlock__case {
  position: relative;
  background: linear-gradient(145deg, #7a5a14, #3d2a06);
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.8),
    inset 0 2px 4px rgba(255, 220, 120, 0.25),
    inset 0 -3px 6px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(201, 169, 110, 0.4);
  overflow: hidden;
}

/* Reflet (FIX CLICK) */
.padlock__case::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 40%, rgba(255, 255, 255, 0.08), transparent 60%);
  pointer-events: none;
}

/* États */
.padlock__case.error {
  animation: shake 0.4s;
  box-shadow: 0 0 20px rgba(255, 60, 40, 0.8);
}

.padlock__case.open {
  box-shadow: 0 0 25px rgba(120, 255, 120, 0.6);
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-6px);
  }

  50% {
    transform: translateX(6px);
  }

  75% {
    transform: translateX(-4px);
  }
}

/* Roues */
.padlock__wheels {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1rem;
  position: relative;
  z-index: 2;
}

.padlock__wheel {
  display: flex;
  flex-direction: column;
  align-items: center;
}

button {
  background: none;
  border: none;
  color: #c9a96e;
  font-size: 1.2rem;
  cursor: pointer;
}

.padlock__digit {
  width: 50px;
  height: 60px;
  background: #0d0804;
  border: 1px solid rgba(201, 169, 110, 0.4);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #e8d48a;
}

/* Bouton */
.padlock__btn {
  width: 100%;
  padding: 0.7rem;
  border-radius: 8px;
  border: 1px solid rgba(201, 169, 110, 0.4);
  background: rgba(201, 169, 110, 0.2);
  color: #f2e8d0;
  cursor: pointer;
  position: relative;
  z-index: 2;
}

/* Hint */
.padlock__hint {
  font-size: 0.7rem;
  color: rgba(242, 232, 208, 0.5);
}

.padlock__hint.error {
  color: red;
}
</style>