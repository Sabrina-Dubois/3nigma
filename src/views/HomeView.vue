<template>
  <AppLayout>

    <!-- Header -->
    <div class="mb-6 text-center">
      <h1 class="page-title">Bonjour <br>{{ authStore.profile?.username ? ` ${authStore.profile.username}` : '' }}</h1>
      <p class="page-subtitle mt-1">Reprenez votre enquête ou découvrez une nouvelle affaire</p>
    </div>

    <!-- Enquêtes en cours -->
    <div v-if="inProgressEscapes.length || replayInProgress" class="mb-6">
      <p class="section-title-sm mb-3">Enquêtes en cours</p>
      <div class="grid gap-3">
        <div v-for="escape in inProgressEscapes" :key="escape.id" class="card double-frame p-4 cursor-pointer"
          @click="router.push(`/escape/${escape.id}/day/${escape.userEscape.current_day}`)">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span style="font-size: 26px;">{{ escape.theme_emoji }}</span>
              <div>
                <p style="font-family: 'Cinzel', serif; font-size: 16px; color: var(--ink);">
                  {{ escape.title }}
                </p>
                <p class="caption">Jour {{ escape.userEscape.current_day }} / {{ escape.duration_days }}</p>
              </div>
            </div>
            <div v-if="escape.isLocked" class="countdown-pill">
              <CountdownTimer :target="escape.unlockedNextAt" />
            </div>
            <span v-else class="pill pill-active">Reprendre</span>
          </div>
        </div>
        <div v-if="replayInProgress" class="card double-frame p-4 cursor-pointer"
          @click="router.push(`/escape/${replayInProgress.id}/day/${replayInProgress.replayDay}`)">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span style="font-size: 26px;">{{ replayInProgress.theme_emoji }}</span>
              <div>
                <p style="font-family: 'Cinzel', serif; font-size: 16px; color: var(--ink);">
                  {{ replayInProgress.title }}
                </p>
                <p class="caption">Relecture · Jour {{ replayInProgress.replayDay }} / {{ replayInProgress.duration_days }}</p>
              </div>
            </div>
            <span class="pill pill-active">Reprendre</span>
          </div>
        </div>
      </div>
    </div>
    <div class="mb-6 text-center">
      <button class="btn-secondary" @click="router.push('/escapes')">
        Voir toutes les enquêtes
      </button>
    </div>

    <PwaButton />
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import PwaButton from '@/components/PwaButton.vue'
import CountdownTimer from '@/components/CountdownTimer.vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// ── STATE ──
const escapes = ref([])
const userEscapes = ref([])
const loading = ref(true)
const unlocksMap = ref({}) // escapeId → unlocked_next_at

const inProgressEscapes = computed(() => {
  return userEscapes.value
    .filter((ue) => !ue.completed_at)
    .map((ue) => {
      const escape = escapes.value.find((e) => e.id === ue.escape_id)
      if (!escape) return null
      const unlockedNextAt = unlocksMap.value[ue.escape_id] ?? null
      const isLocked = unlockedNextAt && new Date() < new Date(unlockedNextAt)
      return { ...escape, userEscape: ue, unlockedNextAt, isLocked }
    })
    .filter(Boolean)
})

const activeReplay = ref(null) // { id, day } depuis localStorage

const replayInProgress = computed(() => {
  if (!activeReplay.value) return null
  const ue = userEscapes.value.find((ue) => ue.escape_id === activeReplay.value.id && ue.completed_at)
  if (!ue) return null
  const escape = escapes.value.find((e) => e.id === activeReplay.value.id)
  if (!escape) return null
  return { ...escape, userEscape: ue, replayDay: activeReplay.value.day }
})



// ── CHARGEMENT ──
onMounted(async () => {
  const [{ data: escapesData }, { data: userEscapesData }] = await Promise.all([
    supabase
      .from('escapes')
      .select('*')
      .eq('is_active', true)
      .order('duration_days'),
    supabase
      .from('user_escapes')
      .select('*')
      .eq('user_id', authStore.user?.id ?? '')
      .order('started_at', { ascending: false }),
  ])

  if (escapesData) escapes.value = escapesData
  if (userEscapesData) userEscapes.value = userEscapesData
  loading.value = false

  // Charger les unlock times pour les escapes en cours
  const inProgressIds = (userEscapesData ?? [])
    .filter((ue) => !ue.completed_at && ue.current_day > 1)
    .map((ue) => ue.escape_id)

  if (inProgressIds.length) {
    const { data: attemptsData } = await supabase
      .from('user_enigma_attempts')
      .select('unlocked_next_at, enigmas!inner(escape_id, day_number)')
      .eq('user_id', authStore.user?.id ?? '')
      .not('unlocked_next_at', 'is', null)

    if (attemptsData) {
      const map = {}
      for (const ue of (userEscapesData ?? []).filter((u) => !u.completed_at)) {
        const match = attemptsData.find(
          (a) => a.enigmas?.escape_id === ue.escape_id && a.enigmas?.day_number === ue.current_day - 1
        )
        if (match) map[ue.escape_id] = match.unlocked_next_at
      }
      unlocksMap.value = map
    }
  }

  // Charger le replay actif depuis localStorage
  const replayRaw = localStorage.getItem('replayEscape')
  if (replayRaw) {
    activeReplay.value = JSON.parse(replayRaw)
    // Rediriger automatiquement uniquement au démarrage PWA
    if (route.query.source === 'pwa') {
      router.push(`/escape/${activeReplay.value.id}/day/${activeReplay.value.day}`)
    }
  }
})
</script>

<style scoped>
.countdown-pill {
  font-family: 'Cinzel', serif;
  font-size: 12px;
  font-weight: 700;
  color: var(--sepia);
  background: var(--parch2);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 4px 10px;
  white-space: nowrap;
}
</style>
