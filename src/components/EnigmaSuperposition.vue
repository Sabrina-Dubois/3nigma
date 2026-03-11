<template>
  <div class="sp">

    <!-- ── PHASE GRILLE : examiner les photos ── -->
    <div v-if="phase === 'grid'" class="sp__grid-wrap">
      <p class="sp__instruction">{{ enigma?.question }}</p>

      <div class="sp__grid">
        <div
          v-for="photo in photos"
          :key="photo.id"
          class="sp__card"
          :class="{ 'sp__card--clear': revealed.has(photo.id) }"
          @click="revealPhoto(photo.id)"
        >
          <div class="sp__card-scene">
            <img
              v-if="photo.image && !imgErrors.has(photo.id)"
              :src="storageUrl(photo.image)"
              class="sp__img"
              :class="{ 'sp__img--clear': revealed.has(photo.id) }"
              @error="onImgError(photo.id)"
            />
            <div v-else class="sp__img-placeholder" :class="{ 'sp__img-placeholder--clear': revealed.has(photo.id) }"></div>
            <span class="sp__card-num" :class="{ 'sp__card-num--off': revealed.has(photo.id) }">{{ photo.id }}</span>
          </div>
          <p v-if="revealed.has(photo.id)" class="sp__card-desc">{{ photo.description }}</p>
          <p v-else class="sp__card-hint">Appuyer pour examiner</p>
        </div>
      </div>

      <button class="sp__btn" @click="phase = 'drag'">
        Superposer les photos →
      </button>
    </div>

    <!-- ── PHASE DRAG : glisser vers le centre ── -->
    <div v-else-if="phase === 'drag'" class="sp__drag-wrap">
      <p class="sp__drag-label">
        <span v-if="stacked.size < photos.length">Glissez chaque photo vers le cercle</span>
        <span v-else>Superposition…</span>
      </p>

      <div class="sp__arena" ref="arenaRef">
        <!-- Zone de dépôt centrale -->
        <div
          class="sp__drop"
          :class="{ 'sp__drop--lit': dragOverDrop }"
        >
          <span class="sp__drop-count">{{ stacked.size }} / {{ photos.length }}</span>
        </div>

        <!-- Cartes draggables -->
        <div
          v-for="photo in photos"
          :key="photo.id"
          class="sp__dc"
          :class="{
            'sp__dc--stacked': stacked.has(photo.id),
            'sp__dc--dragging': dragInfo?.id === photo.id,
          }"
          :style="cardStyle(photo.id)"
          @pointerdown.prevent="startDrag($event, photo.id)"
        >
          <!-- Vraie image depuis Supabase Storage -->
          <img
            v-if="photo.image && !imgErrors.has(photo.id)"
            :src="storageUrl(photo.image)"
            class="sp__dc-img"
            draggable="false"
            @error="onImgError(photo.id)"
          />
          <!-- Fallback placeholder -->
          <div v-else class="sp__dc-placeholder"></div>
          <span class="sp__dc-num">{{ photo.id }}</span>
        </div>
      </div>
    </div>

    <!-- ── PHASE SUPERPOSITION ── -->
    <div v-else-if="phase === 'superpose'" class="sp__super-wrap">

      <div v-if="!merged" class="sp__stack-anim">
        <div
          v-for="(photo, i) in photos"
          :key="photo.id"
          class="sp__stack-card"
          :style="{ '--i': i, '--total': photos.length }"
        >
          <div class="sp__card-scene sp__card-scene--plain"></div>
        </div>
        <p class="sp__stack-label">Superposition en cours…</p>
      </div>

      <transition name="sp-fade">
        <div v-if="merged" class="sp__canvas">

          <!-- ── Image de superposition ── -->
          <div class="sp__blend">
            <img
              v-if="!revealImgError"
              :src="storageUrl('eclipse/jour4-superpose.jpg')"
              class="sp__blend-base"
              draggable="false"
              @error="revealImgError = true"
            />
          </div>

          <!-- ── Horloge cliquable ── -->
          <svg
            class="sp__clock-overlay"
            :class="{ 'sp__clock-overlay--zoom': clockClicked }"
            viewBox="0 0 120 120"
            xmlns="http://www.w3.org/2000/svg"
            @click="onClockClick"
          >
            <rect x="10" y="10" width="100" height="100" rx="8" fill="rgba(8,5,2,0.55)" stroke="#c9a96e" stroke-width="1.5"/>
            <circle cx="60" cy="60" r="42" fill="rgba(6,4,2,0.5)" stroke="#8a6030" stroke-width="1"/>
            <line x1="60" y1="20" x2="60" y2="27" stroke="#8a6030" stroke-width="2"/>
            <line x1="100" y1="60" x2="93" y2="60" stroke="#8a6030" stroke-width="2"/>
            <line x1="60" y1="100" x2="60" y2="93" stroke="#8a6030" stroke-width="2"/>
            <line x1="20" y1="60" x2="27" y2="60" stroke="#8a6030" stroke-width="2"/>
            <text x="60" y="27" text-anchor="middle" fill="#c9a96e" font-size="8" font-family="serif">12</text>
            <text x="96" y="63" text-anchor="middle" fill="#c9a96e" font-size="8" font-family="serif">3</text>
            <text x="60" y="100" text-anchor="middle" fill="#c9a96e" font-size="8" font-family="serif">6</text>
            <text x="24" y="63" text-anchor="middle" fill="#c9a96e" font-size="8" font-family="serif">9</text>
            <line x1="81" y1="22" x2="79" y2="28" stroke="#8a6030" stroke-width="0.8"/>
            <line x1="97" y1="39" x2="92" y2="41" stroke="#8a6030" stroke-width="0.8"/>
            <line x1="97" y1="81" x2="92" y2="79" stroke="#8a6030" stroke-width="0.8"/>
            <line x1="81" y1="98" x2="79" y2="92" stroke="#8a6030" stroke-width="0.8"/>
            <line x1="39" y1="22" x2="41" y2="28" stroke="#8a6030" stroke-width="0.8"/>
            <line x1="23" y1="39" x2="28" y2="41" stroke="#8a6030" stroke-width="0.8"/>
            <line x1="23" y1="81" x2="28" y2="79" stroke="#8a6030" stroke-width="0.8"/>
            <line x1="39" y1="98" x2="41" y2="92" stroke="#8a6030" stroke-width="0.8"/>
            <line x1="60" y1="60" x2="60" y2="24" stroke="#f2e8d0" stroke-width="1.5" stroke-linecap="round" transform="rotate(42, 60, 60)"/>
            <line x1="60" y1="60" x2="60" y2="35" stroke="#f2e8d0" stroke-width="2.5" stroke-linecap="round" transform="rotate(93.5, 60, 60)"/>
            <circle cx="60" cy="60" r="3" fill="#c9a96e"/>
            <circle cx="60" cy="60" r="44" fill="none" stroke="#c9a96e" stroke-width="0.8" opacity="0.3" class="sp__halo"/>
            <text x="60" y="85" text-anchor="middle" fill="#c9a96e" font-size="7" font-family="serif" letter-spacing="1">3:07</text>
          </svg>

          <div
            v-for="zone in clickableZones"
            :key="zone.id"
            class="sp__zone"
            :class="[`sp__zone--${zone.id}`, { 'sp__zone--target': zone.id === targetZone }]"
            :style="{
              left: zone.x + '%',
              top: zone.y + '%',
              width: zone.width + '%',
              height: zone.height + '%',
            }"
            @click="clickZone(zone)"
          />

        </div>
      </transition>

      <transition name="sp-slide">
        <div v-if="activeReveal" class="sp__panel">
          <p class="sp__panel-text">{{ activeReveal }}</p>
          <button class="sp__panel-close" @click="activeReveal = null">×</button>
        </div>
      </transition>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  enigma: { type: Object, required: true },
  answerError: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])

// ── Config ──
const config = computed(() => props.enigma?.config ?? {})
const photos = computed(() => config.value.photos ?? [])
const clickableZones = computed(() => config.value.clickable_zones ?? [])
const targetZone = computed(() => config.value.target_zone ?? 'horloge')

// ── State ──
const phase = ref('grid')
const revealed = ref(new Set())
const merged = ref(false)
const activeReveal = ref(null)
const imgErrors = ref(new Set())
const revealImgError = ref(false)
const clockClicked = ref(false)

// ── Drag state ──
const arenaRef = ref(null)
const stacked = ref(new Set())
const positions = ref({})
const dragInfo = ref(null)
const dragOverDrop = ref(false)

const CARD_W = 130
const CARD_H = 98
const ARENA_W = 340
const ARENA_H = 310
const DROP_CX = ARENA_W / 2
const DROP_CY = ARENA_H / 2
const DROP_R = 72

function initialPos(id) {
  switch (id) {
    case 1: return { x: 8,                    y: 8 }
    case 2: return { x: ARENA_W - CARD_W - 8, y: 8 }
    case 3: return { x: 8,                    y: ARENA_H - CARD_H - 8 }
    default: return { x: ARENA_W - CARD_W - 8, y: ARENA_H - CARD_H - 8 }
  }
}

function initPositions() {
  const map = {}
  for (const p of photos.value) map[p.id] = { ...initialPos(p.id) }
  positions.value = map
}

watch(phase, (val) => {
  if (val === 'drag') {
    stacked.value = new Set()
    initPositions()
  }
})

function cardStyle(id) {
  if (stacked.value.has(id)) {
    return {
      left: DROP_CX - CARD_W / 2 + 'px',
      top:  DROP_CY - CARD_H / 2 + 'px',
      opacity: 0.25,
      transition: 'left 0.4s ease, top 0.4s ease, opacity 0.4s ease',
      zIndex: 8,
      pointerEvents: 'none',
    }
  }
  const pos = positions.value[id] ?? initialPos(id)
  return {
    left: pos.x + 'px',
    top:  pos.y + 'px',
    zIndex: dragInfo.value?.id === id ? 20 : 5,
    transition: dragInfo.value?.id === id ? 'none' : 'box-shadow 0.2s',
  }
}

function startDrag(e, id) {
  if (stacked.value.has(id)) return
  const pos = positions.value[id] ?? initialPos(id)
  dragInfo.value = {
    id,
    startPX: e.clientX,
    startPY: e.clientY,
    startX:  pos.x,
    startY:  pos.y,
  }
  window.addEventListener('pointermove', onDragMove)
  window.addEventListener('pointerup',   onDragEnd)
}

function onDragMove(e) {
  if (!dragInfo.value) return
  const { id, startPX, startPY, startX, startY } = dragInfo.value

  const dx = e.clientX - startPX
  const dy = e.clientY - startPY

  const newX = Math.max(0, Math.min(ARENA_W - CARD_W, startX + dx))
  const newY = Math.max(0, Math.min(ARENA_H - CARD_H, startY + dy))

  positions.value = { ...positions.value, [id]: { x: newX, y: newY } }

  // Centre de la carte
  const cx = newX + CARD_W / 2
  const cy = newY + CARD_H / 2
  const dist = Math.hypot(cx - DROP_CX, cy - DROP_CY)
  dragOverDrop.value = dist < DROP_R
}

function onDragEnd(e) {
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup',   onDragEnd)

  if (!dragInfo.value) return
  const { id } = dragInfo.value
  dragInfo.value = null
  dragOverDrop.value = false

  const pos = positions.value[id] ?? initialPos(id)
  const cx = pos.x + CARD_W / 2
  const cy = pos.y + CARD_H / 2
  const dist = Math.hypot(cx - DROP_CX, cy - DROP_CY)

  if (dist < DROP_R) {
    stacked.value = new Set([...stacked.value, id])
    if (stacked.value.size === photos.value.length) {
      // Toutes les photos superposées → lancer l'animation
      setTimeout(() => startSuperpose(), 400)
    }
  }
}

// ── Storage ──
const STORAGE_BUCKET = 'enigmas'
function storageUrl(path) {
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`
}
function onImgError(id) {
  imgErrors.value = new Set([...imgErrors.value, id])
}

// ── Actions ──
function revealPhoto(id) {
  revealed.value = new Set([...revealed.value, id])
}

let mergeTimer = null
function startSuperpose() {
  phase.value = 'superpose'
  mergeTimer = setTimeout(() => { merged.value = true }, 1800)
}

function onClockClick() {
  if (clockClicked.value) return
  clockClicked.value = true
  setTimeout(() => {
    emit('submit', String(config.value.horloge_time?.replace(':', '') ?? '307'))
  }, 700)
}

function clickZone(zone) {
  if (zone.id === targetZone.value) {
    emit('submit', String(config.value.horloge_time?.replace(':', '') ?? '307'))
  } else {
    activeReveal.value = zone.reveals
  }
}

onBeforeUnmount(() => {
  clearTimeout(mergeTimer)
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup',   onDragEnd)
})
</script>

<style scoped>
.sp {
  width: 100%;
  color: #f2e8d0;
}

/* ── GRID PHASE ── */
.sp__grid-wrap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.sp__instruction {
  font-family: 'IM Fell English', serif;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #c9a96e;
  text-align: center;
  max-width: 340px;
  font-style: italic;
}

.sp__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  width: 100%;
  max-width: 360px;
}

.sp__card {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(201, 169, 110, 0.15);
  cursor: pointer;
  transition: border-color 0.3s;
  background: #0a0704;
}

.sp__card--clear {
  border-color: rgba(201, 169, 110, 0.35);
}

.sp__card-scene {
  position: relative;
  width: 100%;
  padding-top: 75%;
  overflow: hidden;
}

.sp__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(4px) brightness(0.6) grayscale(0.3);
  transition: filter 0.45s ease;
}
.sp__img--clear {
  filter: blur(0px) brightness(1) grayscale(0);
}

.sp__scene--img {
  width: 100%;
  display: block;
  object-fit: cover;
}

.sp__img-placeholder {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: #0d0a08;
  filter: blur(4px) brightness(0.55);
  transition: filter 0.45s ease;
}
.sp__img-placeholder--clear {
  filter: blur(0px) brightness(1);
}

.sp__dc-placeholder {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: #0d0a08;
}

.sp__card-scene--plain {
  background: #14100a;
}

.sp__card-num {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Cinzel', serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: rgba(201, 169, 110, 0.6);
  pointer-events: none;
  transition: opacity 0.4s;
  z-index: 2;
}
.sp__card-num--off { opacity: 0; }

.sp__card-desc {
  font-family: 'IM Fell English', serif;
  font-size: 0.75rem;
  line-height: 1.4;
  color: #a08060;
  padding: 0.4rem 0.5rem;
  font-style: italic;
}

.sp__card-hint {
  font-family: 'Cinzel', serif;
  font-size: 0.55rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(201, 169, 110, 0.3);
  padding: 0.4rem 0.5rem;
  text-align: center;
}

.sp__btn {
  margin-top: 0.5rem;
  padding: 0.9rem 2rem;
  background: #c9a96e;
  color: #1a0d02;
  border: none;
  border-radius: 10px;
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.2s;
  box-shadow: 0 4px 20px rgba(201, 169, 110, 0.25);
}
.sp__btn:hover { opacity: 0.85; }

/* ── DRAG PHASE ── */
.sp__drag-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.sp__drag-label {
  font-family: 'Cinzel', serif;
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(201, 169, 110, 0.55);
  text-align: center;
}

.sp__arena {
  position: relative;
  width: 340px;
  height: 310px;
  touch-action: none;
  user-select: none;
}

/* Zone de dépôt */
.sp__drop {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 1.5px dashed rgba(201, 169, 110, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, background 0.2s;
  pointer-events: none;
}

.sp__drop--lit {
  border-color: rgba(201, 169, 110, 0.75);
  background: rgba(201, 169, 110, 0.06);
}

.sp__drop-count {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  color: rgba(201, 169, 110, 0.4);
}

/* Cartes draggables */
.sp__dc {
  position: absolute;
  width: 130px;
  height: 98px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(201, 169, 110, 0.2);
  cursor: grab;
  touch-action: none;
  background: #0a0704;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.5);
}

.sp__dc--dragging {
  cursor: grabbing;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7), 0 0 0 1.5px rgba(201, 169, 110, 0.4);
}

.sp__dc-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}


.sp__dc-num {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Cinzel', serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: rgba(201, 169, 110, 0.55);
  pointer-events: none;
}

/* ── SUPERPOSE PHASE ── */
.sp__super-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.sp__stack-anim {
  position: relative;
  width: 100%;
  max-width: 360px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sp__stack-card {
  position: absolute;
  width: 160px;
  height: 120px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(201, 169, 110, 0.2);
  animation: stackMerge 1.8s ease-in-out forwards;
  animation-delay: calc(var(--i) * 0.15s);
  opacity: 0;
}

@keyframes stackMerge {
  0%   { opacity: 0; transform: translate(calc((var(--i) - 1.5) * 80px), calc((var(--i) - 1.5) * 50px)) scale(0.9); }
  40%  { opacity: 0.7; }
  100% { opacity: 0; transform: translate(0, 0) scale(1); }
}

.sp__stack-label {
  position: absolute;
  bottom: 0;
  font-family: 'Cinzel', serif;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(201, 169, 110, 0.5);
  animation: pulse 0.9s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 1; }
}

.sp__canvas {
  position: relative;
  width: 100%;
  max-width: 400px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(201, 169, 110, 0.2);
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
}

.sp__scene {
  width: 100%;
  display: block;
}

.sp__halo {
  animation: haloPulse 1.6s ease-in-out infinite;
}
@keyframes haloPulse {
  0%, 100% { opacity: 0.2; }
  50%       { opacity: 0.7; }
}

/* Blend superposition */
.sp__blend {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  background: #050302;
  overflow: hidden;
}

.sp__blend-base {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sp__blend-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  mix-blend-mode: screen;
  opacity: 0.55;
}

.sp__blend-dark {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  pointer-events: none;
}

/* Horloge SVG overlay centré */
.sp__clock-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40%;
  max-width: 160px;
  cursor: pointer;
  filter: drop-shadow(0 0 12px rgba(201, 169, 110, 0.4));
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s;
}
.sp__clock-overlay:hover {
  filter: drop-shadow(0 0 22px rgba(201, 169, 110, 0.7));
}
.sp__clock-overlay--zoom {
  transform: translate(-50%, -50%) scale(4);
  filter: drop-shadow(0 0 30px rgba(201, 169, 110, 0.9));
}

.sp__clock-hint {
  position: absolute;
  bottom: 6px;
  right: 8px;
  font-family: 'Cinzel', serif;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  color: rgba(201, 169, 110, 0.35);
  pointer-events: none;
}

.sp__zone {
  position: absolute;
  cursor: pointer;
  border-radius: 3px;
  transition: background 0.2s;
}
.sp__zone:hover {
  background: rgba(201, 169, 110, 0.08);
  outline: 1px solid rgba(201, 169, 110, 0.25);
}
.sp__zone--target {
  animation: zonePulse 1.6s ease-in-out infinite;
}
@keyframes zonePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(201, 169, 110, 0); }
  50%       { box-shadow: 0 0 8px 2px rgba(201, 169, 110, 0.2); }
}

.sp__panel {
  width: 100%;
  max-width: 360px;
  background: rgba(10, 6, 2, 0.92);
  border: 1px solid rgba(201, 169, 110, 0.2);
  border-radius: 10px;
  padding: 1rem 1.2rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  backdrop-filter: blur(8px);
}

.sp__panel-text {
  font-family: 'IM Fell English', serif;
  font-size: 0.9rem;
  line-height: 1.55;
  color: #c9a96e;
  font-style: italic;
  flex: 1;
}

.sp__panel-close {
  background: none;
  border: none;
  color: #8a6030;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 0.2rem;
  line-height: 1;
  flex-shrink: 0;
}

/* Transitions */
.sp-fade-enter-active { transition: opacity 0.6s ease; }
.sp-fade-enter-from   { opacity: 0; }

.sp-slide-enter-active { transition: transform 0.3s ease, opacity 0.3s ease; }
.sp-slide-leave-active { transition: transform 0.2s ease, opacity 0.2s ease; }
.sp-slide-enter-from   { transform: translateY(12px); opacity: 0; }
.sp-slide-leave-to     { transform: translateY(12px); opacity: 0; }
</style>
