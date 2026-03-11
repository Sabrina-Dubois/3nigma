<template>
  <AppLayout>

    <!-- Titre -->
    <div class="mb-6 text-center">
      <h1 class="page-title">Toutes les enquêtes</h1>
      <p class="page-subtitle mt-1">Choisissez votre prochaine aventure</p>
    </div>

    <!-- Filtres durée -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-1">
      <button v-for="filter in filters" :key="filter.value" @click="activeFilter = filter.value"
        class="pill" :class="{ 'pill-active': activeFilter === filter.value }">
        {{ filter.label }}
      </button>
    </div>

    <!-- Liste des escapes -->
    <div v-if="loading" class="text-center py-12">
      <p class="label-sm">Chargement...</p>
    </div>

    <div v-else class="flex flex-col gap-4">
      <div v-for="escape in filteredEscapes" :key="escape.id" @click="router.push(`/escape/${escape.id}`)"
        class="card card-compact rounded relative cursor-pointer transition-all">

        <!-- Bande colorée à gauche -->
        <div class="absolute left-0 top-0 bottom-0 w-1 rounded-l" :style="`background: ${escape.accent_color}`"></div>

        <!-- Header carte -->
        <div class="flex items-start justify-between mb-3 pl-2">
          <div class="flex items-center gap-2">
            <span style="font-size: 24px;">{{ escape.theme_emoji }}</span>
            <div>
              <h3 style="font-family: 'Cinzel', serif; font-size: 15px; font-weight: 700; color: var(--ink);">
                {{ escape.title }}
              </h3>
              <p class="label-xs mt-1">{{ escape.duration_days }} jours</p>
            </div>
          </div>

          <!-- Badges -->
          <div class="flex flex-col items-end gap-1">
            <span v-if="completedEscapeIds.has(escape.id)" class="badge badge-gold">✦ Terminé</span>
            <span v-else-if="escape.is_premium" class="badge badge-gold">Premium</span>
          </div>
        </div>

        <!-- Tagline -->
        <p class="pl-2"
          style="font-family: 'Crimson Pro', serif; font-size: 15px; color: var(--ink2); line-height: 1.4;">
          {{ escape.tagline }}
        </p>

        <!-- Flèche -->
        <div class="flex justify-end mt-3">
          <i class="mdi mdi-arrow-right" style="color: var(--sepia); font-size: 18px;"></i>
        </div>

      </div>
    </div>

  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

// ── STATE ──
const escapes = ref([])
const completedEscapeIds = ref(new Set())
const loading = ref(true)
const activeFilter = ref('all')

// ── FILTRES ──
const filters = [
  { label: 'Tous', value: 'all' },
  { label: '7 jours', value: 7 },
  { label: '10 jours', value: 10 },
  { label: '15 jours', value: 15 },
  { label: '30 jours', value: 30 },
  { label: '45 jours', value: 45 },
]

// ── ESCAPES FILTRÉS ──
const filteredEscapes = computed(() => {
  if (activeFilter.value === 'all') return escapes.value
  return escapes.value.filter(e => e.duration_days === activeFilter.value)
})

// ── CHARGEMENT ──
onMounted(async () => {
  const [{ data: escapesData }, { data: userEscapesData }] = await Promise.all([
    supabase.from('escapes').select('*').eq('is_active', true).order('duration_days'),
    supabase.from('user_escapes').select('escape_id, completed_at').eq('user_id', authStore.user?.id ?? ''),
  ])

  if (escapesData) escapes.value = escapesData
  if (userEscapesData) {
    completedEscapeIds.value = new Set(
      userEscapesData.filter(ue => ue.completed_at).map(ue => ue.escape_id)
    )
  }
  loading.value = false
})
</script>
