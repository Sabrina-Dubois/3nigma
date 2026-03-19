<template>
  <div class="mirror">

    <p class="mirror__question">{{ enigma.question }}</p>

    <!-- Image cliquable : reflet → couloir -->
    <div class="mirror__img-wrap" @click="onClickMirror">
      <Transition name="mirror-swap" mode="out-in">
        <img
          v-if="!revealed"
          :key="'mirror'"
          :src="storageUrl(config.image_mirror)"
          class="mirror__img"
          draggable="false"
        />
        <img
          v-else
          :key="'real'"
          :src="storageUrl(config.image_real)"
          class="mirror__img"
          draggable="false"
        />
      </Transition>

      <!-- Overlay verre (avant révélation) -->
      <div v-if="!revealed" class="mirror__glass-overlay" />
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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

const revealed = ref(false)

function onClickMirror() {
  if (revealed.value) return
  revealed.value = true
  setTimeout(() => emit('submit', config.value.label ?? 'la silhouette'), 1800)
}
</script>

<style scoped>
.mirror {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
  padding: 1rem 0;
}

.mirror__question {
  font-family: 'IM Fell English', serif;
  font-size: 1.05rem;
  color: #f2e8d0;
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

/* Image wrap */
.mirror__img-wrap {
  position: relative;
  width: 100%;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(140, 180, 220, 0.35);
  box-shadow: 0 0 0 1px rgba(140, 180, 220, 0.1), inset 0 0 20px rgba(100, 140, 200, 0.08);
  cursor: crosshair;
}

.mirror__img-wrap--shake {
  animation: shake 0.35s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-5px); }
  75%       { transform: translateX(5px); }
}

.mirror__img {
  width: 100%;
  display: block;
  pointer-events: none;
  user-select: none;
}

/* Overlay verre (léger reflet bleuté) */
.mirror__glass-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(140, 180, 220, 0.06) 0%,
    transparent 50%,
    rgba(100, 140, 200, 0.04) 100%
  );
  pointer-events: none;
}

/* Transition swap */
.mirror-swap-enter-active { transition: opacity 0.6s ease; }
.mirror-swap-leave-active { transition: opacity 0.3s ease; }
.mirror-swap-enter-from   { opacity: 0; }
.mirror-swap-leave-to     { opacity: 0; }

/* Hint */
.mirror__hint {
  font-family: 'Cinzel', serif;
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(242, 232, 208, 0.35);
  text-align: center;
  transition: color 0.2s;
}

.mirror__hint--error {
  color: rgba(220, 80, 60, 0.75);
}
</style>
