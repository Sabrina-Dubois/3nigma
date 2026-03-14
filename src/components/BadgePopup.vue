<template>
  <Teleport to="body">
    <Transition name="badge-pop">
      <div v-if="visible" class="badge-popup" @click="next">
        <div class="badge-popup__card">
          <div class="badge-popup__label">Succès débloqué !</div>
          <div class="badge-popup__icon">{{ current.icon }}</div>
          <div class="badge-popup__name">{{ current.label }}</div>
          <div class="badge-popup__desc">{{ current.description }}</div>
          <div class="badge-popup__tap">Appuyer pour continuer</div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  badges: { type: Array, default: () => [] },
})

const emit = defineEmits(['done'])

const index = ref(0)
const visible = computed(() => index.value < props.badges.length)
const current = computed(() => props.badges[index.value] ?? {})

function next() {
  index.value++
  if (index.value >= props.badges.length) emit('done')
}

// Reset si nouvelles badges arrivées
watch(() => props.badges, () => { index.value = 0 })
</script>

<style scoped>
.badge-popup {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  cursor: pointer;
}

.badge-popup__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: var(--parch);
  border: 1px solid rgba(201, 169, 110, 0.4);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  max-width: 320px;
  width: calc(100% - 48px);
  box-shadow: 0 0 60px rgba(201, 169, 110, 0.2);
  animation: cardPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes cardPop {
  from { transform: scale(0.7); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

.badge-popup__label {
  font-family: 'Cinzel', serif;
  font-size: 0.65rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 0.5rem;
}

.badge-popup__icon {
  font-size: 4rem;
  line-height: 1;
  animation: iconSpin 0.5s ease both 0.2s;
}

@keyframes iconSpin {
  from { transform: rotate(-20deg) scale(0.5); opacity: 0; }
  to   { transform: rotate(0deg) scale(1);    opacity: 1; }
}

.badge-popup__name {
  font-family: 'Cinzel', serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
  margin-top: 0.5rem;
}

.badge-popup__desc {
  font-family: 'IM Fell English', serif;
  font-size: 0.95rem;
  color: var(--sepia);
  text-align: center;
  font-style: italic;
}

.badge-popup__tap {
  margin-top: 1.2rem;
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--sepia);
  opacity: 0.6;
}

/* Transition */
.badge-pop-enter-active,
.badge-pop-leave-active {
  transition: opacity 0.3s ease;
}
.badge-pop-enter-from,
.badge-pop-leave-to {
  opacity: 0;
}
</style>
