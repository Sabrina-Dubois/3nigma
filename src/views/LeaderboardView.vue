<template>
  <div class="min-h-screen parch-bg">
    <TopBar />

    <main class="px-4 pt-6 pb-24 max-w-xl mx-auto">
      <!-- Header -->
      <div class="mb-6 text-center">
        <h1 class="page-title">Classement</h1>
        <p class="page-subtitle mt-1">Les meilleurs enquêteurs</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-10">
        <p class="label-sm">Chargement du classement…</p>
      </div>

      <template v-else>
        <!-- Podium top 3 -->
        <div v-if="top3.length" class="podium-row mb-6">
          <!-- 2e place -->
          <div v-if="top3[1]" class="podium-item podium-2">
            <div class="podium-avatar" :class="{ 'podium-me': top3[1].id === currentUserId }">
              {{ avatarChar(top3[1].username) }}
            </div>
            <div class="podium-name">{{ top3[1].username }}</div>
            <div class="podium-xp">{{ top3[1].total_xp }} XP</div>
            <div class="podium-block podium-block-2">
              <span class="podium-rank">2</span>
            </div>
          </div>

          <!-- 1e place -->
          <div v-if="top3[0]" class="podium-item podium-1">
            <div class="podium-crown">🏆</div>
            <div class="podium-avatar podium-avatar-1" :class="{ 'podium-me': top3[0].id === currentUserId }">
              {{ avatarChar(top3[0].username) }}
            </div>
            <div class="podium-name">{{ top3[0].username }}</div>
            <div class="podium-xp">{{ top3[0].total_xp }} XP</div>
            <div class="podium-block podium-block-1">
              <span class="podium-rank">1</span>
            </div>
          </div>

          <!-- 3e place -->
          <div v-if="top3[2]" class="podium-item podium-3">
            <div class="podium-avatar" :class="{ 'podium-me': top3[2].id === currentUserId }">
              {{ avatarChar(top3[2].username) }}
            </div>
            <div class="podium-name">{{ top3[2].username }}</div>
            <div class="podium-xp">{{ top3[2].total_xp }} XP</div>
            <div class="podium-block podium-block-3">
              <span class="podium-rank">3</span>
            </div>
          </div>
        </div>

        <!-- Liste rangs 4+ -->
        <div v-if="rest.length" class="card double-frame p-0 overflow-hidden mb-4">
          <div
            v-for="(player, index) in rest"
            :key="player.id"
            class="leaderboard-row"
            :class="{
              'leaderboard-row-me': player.id === currentUserId,
              'leaderboard-row-border': index < rest.length - 1,
            }"
          >
            <div class="lb-rank">{{ index + 4 }}</div>
            <div class="lb-avatar" :class="{ 'lb-avatar-me': player.id === currentUserId }">
              {{ avatarChar(player.username) }}
            </div>
            <div class="lb-info">
              <div class="lb-name">
                {{ player.username }}
                <span v-if="player.id === currentUserId" class="lb-you">Vous</span>
                <span v-if="player.is_premium" class="lb-premium">👑</span>
              </div>
              <div class="lb-level">Niveau {{ computeLevel(player.total_xp) }}</div>
            </div>
            <div class="lb-xp">{{ player.total_xp }} XP</div>
          </div>
        </div>

        <!-- Position de l'utilisateur hors top (si non visible) -->
        <div v-if="userRank > 20 && currentUserData" class="card double-frame p-0 overflow-hidden mb-4">
          <div class="leaderboard-row-separator"><span>…</span></div>
          <div class="leaderboard-row leaderboard-row-me">
            <div class="lb-rank">{{ userRank }}</div>
            <div class="lb-avatar lb-avatar-me">{{ avatarChar(currentUserData.username) }}</div>
            <div class="lb-info">
              <div class="lb-name">
                {{ currentUserData.username }}
                <span class="lb-you">Vous</span>
              </div>
              <div class="lb-level">Niveau {{ computeLevel(currentUserData.total_xp) }}</div>
            </div>
            <div class="lb-xp">{{ currentUserData.total_xp }} XP</div>
          </div>
        </div>

        <!-- Vide -->
        <div v-if="!top3.length && !rest.length" class="card double-frame text-center">
          <p class="caption">Aucun enquêteur pour le moment.</p>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TopBar from '@/components/TopBar.vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()

const currentUserId = computed(() => authStore.user?.id)

const loading = ref(false)

const mockPlayers = [
    { id: 'mock-1', username: 'LeSherlock', total_xp: 8400, is_premium: true },
    { id: 'mock-2', username: 'Agatha_R', total_xp: 6200, is_premium: false },
    { id: 'mock-3', username: 'Lupin42', total_xp: 5100, is_premium: true },
    { id: 'mock-4', username: 'DetectiveNoir', total_xp: 3900, is_premium: false },
    { id: 'mock-5', username: 'MissMarple', total_xp: 3500, is_premium: false },
    { id: 'mock-6', username: 'Hercule_P', total_xp: 2800, is_premium: true },
    { id: 'mock-7', username: 'InspecteurG', total_xp: 2100, is_premium: false },
    { id: 'mock-8', username: 'ColonelM', total_xp: 1700, is_premium: false },
    { id: 'mock-9', username: 'DocteurW', total_xp: 1200, is_premium: false },
    { id: 'mock-10', username: 'MrHolmes', total_xp: 900, is_premium: false },
]

const players = ref([])

const top3 = computed(() => players.value.slice(0, 3))
const rest = computed(() => players.value.slice(3, 20))

const currentUserData = computed(() =>
    players.value.find((p) => p.id === currentUserId.value) ?? null
)

const userRank = computed(() => {
    const idx = players.value.findIndex((p) => p.id === currentUserId.value)
    return idx === -1 ? null : idx + 1
})

function avatarChar(username) {
    return username ? username.trim().charAt(0).toUpperCase() : '?'
}

function computeLevel(xp) {
    let n = 1
    while ((500 * (n + 1) * n) / 2 <= xp) n++
    return n
}

onMounted(async () => {
    loading.value = true

    const { data } = await supabase
        .from('profiles')
        .select('id, username, total_xp, level, is_premium')
        .order('total_xp', { ascending: false })
        .limit(100)

    const realPlayers = data ?? []

    // Compléter avec les mocks pour éviter un classement trop vide,
    // en excluant les mocks qui doubleraient un vrai joueur
    const realIds = new Set(realPlayers.map((p) => p.id))
    const fillerMocks = mockPlayers.filter((m) => !realIds.has(m.id))
    const merged = [...realPlayers, ...fillerMocks]
        .sort((a, b) => b.total_xp - a.total_xp)

    players.value = merged
    loading.value = false
})
</script>

<style scoped>
/* ── Podium ── */
.podium-row {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 110px;
}

.podium-crown {
  font-size: 20px;
  margin-bottom: 2px;
}

.podium-avatar {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.3);
  border: 2px solid rgba(90, 56, 24, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cinzel', serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--ink);
}

.podium-avatar-1 {
  width: 64px;
  height: 64px;
  font-size: 24px;
  border-color: var(--gold);
  border-width: 2px;
}

.podium-me {
  border-color: var(--gold) !important;
  background: rgba(200, 144, 10, 0.12) !important;
}

.podium-name {
  font-family: 'Cinzel', serif;
  font-size: 11px;
  font-weight: 700;
  color: var(--ink);
  text-align: center;
  margin-top: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.podium-xp {
  font-size: 10px;
  font-weight: 600;
  color: var(--sepia);
  margin-top: 2px;
  margin-bottom: 4px;
}

.podium-block {
  width: 100%;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0 8px;
}

.podium-block-1 {
  background: var(--gold);
  min-height: 64px;
}

.podium-block-2 {
  background: rgba(90, 56, 24, 0.18);
  min-height: 44px;
}

.podium-block-3 {
  background: rgba(90, 56, 24, 0.1);
  min-height: 32px;
}

.podium-rank {
  font-family: 'Cinzel', serif;
  font-size: 18px;
  font-weight: 900;
  color: var(--ink);
}

.podium-block-1 .podium-rank {
  color: #fff;
}

/* ── Liste ── */
.leaderboard-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  transition: background 0.15s;
}

.leaderboard-row-border {
  border-bottom: 1px solid var(--border);
}

.leaderboard-row-me {
  background: rgba(200, 144, 10, 0.07);
}

.lb-rank {
  font-family: 'Cinzel', serif;
  font-size: 14px;
  font-weight: 700;
  color: var(--sepia);
  min-width: 28px;
  text-align: center;
}

.lb-avatar {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.3);
  border: 1.5px solid rgba(90, 56, 24, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cinzel', serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  flex-shrink: 0;
}

.lb-avatar-me {
  border-color: var(--gold);
  background: rgba(200, 144, 10, 0.1);
}

.lb-info {
  flex: 1;
  min-width: 0;
}

.lb-name {
  font-family: 'Cinzel', serif;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lb-you {
  font-size: 10px;
  font-family: 'Crimson Pro', serif;
  font-weight: 700;
  color: var(--gold);
  background: rgba(200, 144, 10, 0.12);
  border: 1px solid rgba(200, 144, 10, 0.3);
  border-radius: 999px;
  padding: 1px 7px;
  flex-shrink: 0;
}

.lb-premium {
  font-size: 11px;
  flex-shrink: 0;
}

.lb-level {
  font-size: 11px;
  color: var(--sepia);
  margin-top: 1px;
}

.lb-xp {
  font-family: 'Cinzel', serif;
  font-size: 12px;
  font-weight: 700;
  color: var(--gold);
  flex-shrink: 0;
}

.leaderboard-row-separator {
  text-align: center;
  padding: 4px 0;
  color: var(--sepia);
  font-size: 16px;
  border-bottom: 1px solid var(--border);
  letter-spacing: 4px;
}
</style>
