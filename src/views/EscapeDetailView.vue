<template>
  <div class="min-h-screen" :style="isDark ? {} : { background: 'var(--parch)' }">

    <!-- Header avec bouton retour -->
    <div class="flex items-center px-4 py-3 sticky top-0 z-40"
      :style="isDark
        ? { background: 'rgba(10,6,2,0.85)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(240,192,112,0.15)' }
        : { background: 'var(--parch2)', borderBottom: '1px solid var(--border)' }">
      <button @click="router.back()" style="background: none; border: none; cursor: pointer;"
        :style="{ color: isDark ? '#c9a96e' : 'var(--sepia)' }">
        <i class="mdi mdi-arrow-left" style="font-size: 24px;"></i>
      </button>
      <span
        style="font-family: 'Cinzel', serif; font-size: 14px; font-weight: 700; margin-left: 12px; letter-spacing: 1px;"
        :style="{ color: isDark ? '#f2e8d0' : 'var(--ink)' }">
        {{ escape?.title }}
      </span>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <p style="font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 2px; color: var(--sepia);">
        Chargement...
      </p>
    </div>

    <div v-else-if="escape" class="px-4 py-6 pb-24">

      <!-- Premium check -->
        <div v-if="escape.is_premium && !authStore.isPremium" class="card p-6 rounded text-center">
        <p class="section-title-sm" style="color: var(--ink); margin-bottom: 12px;">
          Cette escape est réservée aux membres Premium 🗝️
        </p>
        <button @click="router.push('/premium')" class="py-3 px-6 rounded"
          style="background: var(--ink3); color: var(--parch); font-family: 'Cinzel', serif; text-transform: uppercase; letter-spacing: 2px; border: none; cursor: pointer;">
          Devenir Premium
        </button>
      </div>

      <div v-else>

        <!-- Titre + thème -->
        <div class="flex items-center gap-3 mb-6">
          <span style="font-size: 40px;">{{ escape.theme_emoji }}</span>
          <div>
            <h1
              style="font-family: 'Cinzel', serif; font-size: 22px; font-weight: 900; letter-spacing: 1px;"
              :style="{ color: isDark ? '#f2e8d0' : 'var(--ink)' }">
              {{ escape.title }}
            </h1>
            <p
              style="font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px;"
              :style="{ color: isDark ? '#c9a96e' : 'var(--sepia)' }">
              {{ escape.duration_days }} jours · Thriller
            </p>
          </div>
        </div>

        <!-- Bande colorée décorative -->
        <div class="w-full h-1 rounded mb-6" :style="{ background: escape.accent_color }"></div>

        <!-- Prologue -->
        <div class="rounded p-6 mb-6 relative"
          :style="isDark
            ? { background: 'rgba(242,232,208,0.04)', border: '1px solid rgba(240,192,112,0.2)' }
            : { background: 'var(--parch2)', border: '1px solid var(--border)' }">

          <p class="section-title-sm mb-4" :style="{ color: isDark ? '#c9a96e' : '' }">Prologue</p>

          <div v-for="(paragraph, i) in prologueParagraphs" :key="i">
            <p
              style="font-family: 'IM Fell English', serif; font-size: 17px; line-height: 1.7; margin-bottom: 16px;"
              :style="{ color: isDark ? '#e8d8b8' : 'var(--ink)' }">
              {{ paragraph }}
            </p>
          </div>

        </div>

        <!-- Bouton démarrer / continuer -->
        <button v-if="!userEscape" @click="startEscape()" :disabled="starting" class="w-full py-4 rounded mb-4"
          style="background: var(--ink3); color: var(--parch); font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; cursor: pointer; border: none;"
          :style="{ opacity: starting ? 0.7 : 1 }">
          {{ starting ? 'Chargement...' : '🗝️ Commencer l\'aventure' }}
        </button>

        <template v-else-if="userEscape.completed_at">
          <div class="w-full py-3 rounded mb-3 text-center"
            style="background: rgba(201,169,110,0.12); border: 1px solid rgba(201,169,110,0.35); font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #c9a96e;">
            ✦ Escape terminé
          </div>
          <button @click="startReplay()"
            class="w-full py-4 rounded"
            style="background: var(--ink3); color: var(--parch); font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; cursor: pointer; border: none; opacity: 0.75;">
            ↺ Rejouer depuis le début
          </button>
        </template>

        <button v-else @click="router.push(`/escape/${escape.id}/day/${userEscape.current_day}`)"
          class="w-full py-4 rounded"
          style="background: var(--ink3); color: var(--parch); font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; cursor: pointer; border: none;">
          🗝️ Continuer — Jour {{ userEscape.current_day }}
        </button>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useEscapesStore } from '@/stores/escapes.store'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const escapesStore = useEscapesStore()

const escape = ref(null)
const userEscape = ref(null)
const loading = ref(true)
const starting = ref(false)

const DARK_ESCAPES = ['eclipse', 'boucle']
const isDark = computed(() => DARK_ESCAPES.includes(escapesStore.currentEscapeId))

const prologueParagraphs = computed(() => {
  return escape.value?.prologue?.split('\n').filter(p => p.trim() !== '') || []
})

onMounted(async () => {
  const id = route.params.id
  // Charger l'escape
  const { data: escapeData, error: escapeError } = await supabase
    .from('escapes')
    .select('*')
    .eq('id', id)
    .single()

  if (escapeError || !escapeData) {
    router.push('/') // redirige si escape introuvable
    return
  }
  escape.value = escapeData

  // Charger la progression de l'utilisateur
  const { data: userEscapeData } = await supabase
    .from('user_escapes')
    .select('*')
    .eq('user_id', authStore.user.id)
    .eq('escape_id', id)
    .maybeSingle()

  userEscape.value = userEscapeData
  loading.value = false
})

function startReplay() {
  localStorage.setItem('replayEscape', JSON.stringify({ id: escape.value.id, day: 1 }))
  router.push(`/escape/${escape.value.id}/day/1`)
}

async function startEscape() {
  starting.value = true

  const { data, error } = await supabase
    .from('user_escapes')
    .insert({
      user_id: authStore.user.id,
      escape_id: escape.value.id,
      current_day: 1,
      started_at: new Date().toISOString(),
      last_played_at: new Date().toISOString(),
    })
    .select()
    .single()

  starting.value = false

  if (!error) {
    userEscape.value = data
    router.push(`/escape/${escape.value.id}/day/1`)
  } else {
    // fallback silencieux (toast global gère déjà les erreurs)
  }
}
</script>
