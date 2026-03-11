<template>
  <div class="starfield" aria-hidden="true">
    <span
      v-for="s in stars"
      :key="s.id"
      class="starfield__star"
      :class="s.cls"
      :style="s.style"
    ></span>
  </div>
</template>

<script setup>
defineProps({
  count: { type: Number, default: 140 },
})

function rand(min, max) {
  return min + Math.random() * (max - min)
}

// 5 niveaux de luminosité → 5 classes d'animation différentes
const CLASSES = ['sf-t1', 'sf-t2', 'sf-t3', 'sf-t4', 'sf-t5']

const stars = Array.from({ length: 140 }, (_, i) => ({
  id: i,
  cls: CLASSES[Math.floor(Math.random() * CLASSES.length)],
  style: {
    left:              `${rand(0, 100)}%`,
    top:               `${rand(0, 100)}%`,
    width:             `${rand(0.7, 2.8)}px`,
    height:            `${rand(0.7, 2.8)}px`,
    animationDuration: `${rand(1.2, 3.5)}s`,
    animationDelay:    `-${rand(0, 6)}s`,
  },
}))
</script>

<style scoped>
.starfield {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  animation: starDrift 60s ease-in-out infinite;
  will-change: transform;
}

@keyframes starDrift {
  0%   { transform: translate(0,     0) scale(1.04); }
  25%  { transform: translate(1.5%,  1%) scale(1.05); }
  50%  { transform: translate(0,     2%) scale(1.04); }
  75%  { transform: translate(-1.5%, 1%) scale(1.05); }
  100% { transform: translate(0,     0) scale(1.04); }
}

.starfield__star {
  position: absolute;
  border-radius: 50%;
  background: #fff;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  will-change: opacity;
}

/* 5 classes avec des opacités baked-in dans les keyframes */
.sf-t1 { animation-name: twinkle1; }
.sf-t2 { animation-name: twinkle2; }
.sf-t3 { animation-name: twinkle3; }
.sf-t4 { animation-name: twinkle4; }
.sf-t5 { animation-name: twinkle5; }

@keyframes twinkle1 { 0%,100% { opacity: 1   } 50% { opacity: .02 } }
@keyframes twinkle2 { 0%,100% { opacity: .9  } 50% { opacity: .02 } }
@keyframes twinkle3 { 0%,100% { opacity: .7  } 50% { opacity: .02 } }
@keyframes twinkle4 { 0%,100% { opacity: .5  } 50% { opacity: .02 } }
@keyframes twinkle5 { 0%,100% { opacity: .32 } 50% { opacity: .02 } }
</style>
