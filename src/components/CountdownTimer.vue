<template>
  <div class="countdown">
    <span class="countdown__time">{{ formatted }}</span>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  target: {
    type: [String, Date],
    default: null,
  },
})

const emit = defineEmits(['expired'])

const formatted = ref('--:--:--')
let timerId = null
let emitted = false

function formatMs(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hours = String(Math.floor(total / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const seconds = String(total % 60).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

function update() {
  if (!props.target) { formatted.value = '--:--:--'; return }
  const diff = new Date(props.target).getTime() - Date.now()
  if (diff <= 0) {
    formatted.value = '00:00:00'
    if (!emitted) { emitted = true; emit('expired') }
    return
  }
  formatted.value = formatMs(diff)
}

onMounted(() => {
  update()
  timerId = setInterval(update, 1000)
})

onBeforeUnmount(() => {
  if (timerId) clearInterval(timerId)
})

watch(
  () => props.target,
  () => {
    update()
  },
)
</script>

<style scoped>
.countdown {
  font-family: 'Cinzel', serif;
  font-size: 1.4rem;
  letter-spacing: 0.1em;
}
</style>
