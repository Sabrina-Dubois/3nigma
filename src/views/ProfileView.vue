<template>
  <div class="profile-page parch-bg">
    <TopBar />

    <main class="px-4 pt-6 pb-24 max-w-xl mx-auto">
      <div class="center">
        <button type="button" class="avatar avatar-btn" aria-label="Changer l'avatar" title="Changer l'avatar"
          @click="changeAvatar">
          {{ avatarEmoji }}
        </button>
        <div class="page-title">{{ displayName }}</div>

        <div class="header-badges-row">
          <span class="rank-label">Rang</span>
          <div class="rank-pill">🕵️ Enquêteur</div>
          <div v-if="isPremium" class="premium-badge">👑 Premium</div>
        </div>

        <div class="member-since">
          Membre depuis {{ memberSince }}
        </div>
      </div>

      <!-- Stats rapides -->
      <div class="stats-grid mt-4">
        <div class="card double-frame stat-card">
          <div class="stat-icon">🔍</div>
        <div class="stat-value">{{ enigmasCompleted }}</div>
          <div class="stat-label">Énigmes validées</div>
        </div>
        <div class="card double-frame stat-card">
          <div class="stat-icon">🗂️</div>
          <div class="stat-value">{{ escapesCompleted }}</div>
          <div class="stat-label">Escapes terminés</div>
        </div>
        <div class="card double-frame stat-card">
          <div class="stat-icon">⭐️</div>
          <div class="stat-value">{{ totalXp }}</div>
          <div class="stat-label">XP total</div>
        </div>
      </div>

      <!-- Niveau & progression -->
      <section class="card double-frame p-4 mt-4">
        <XpBar
          :total-xp="totalXp"
          :level="level"
          :xp-next="xpNext"
          :xp-current="xpStore.xpForCurrentLevel ?? 0"
        />
      </section>

      <!-- Success -->
      <section class="card double-frame p-4 mt-4">
        <div class="section-title-sm">SUCCES ({{ unlockedBadges }}/{{ totalBadges }})</div>
        <div class="badges-scroll">
          <div class="badges-grid">
            <div v-for="badge in badges" :key="badge.id" class="badge-item"
              :class="{ locked: !badge.unlocked, premium: badge.premiumOnly }">
              <span v-if="badge.premiumOnly" class="badge-crown">👑</span>
              <div class="badge-icon">{{ badge.icon }}</div>
              <div class="badge-name">{{ badge.label }}</div>
              <div class="badge-desc">{{ badge.description }}</div>
              <div v-if="badge.premiumOnly && !isPremium" class="badge-premium-lock">🔒 Premium</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Résumé -->
      <section class="card double-frame p-4 mt-4">
        <div class="section-title-sm">Résumé</div>
        <p class="caption mt-2">
          Continuez vos enquêtes pour débloquer plus de badges et terminer de nouvelles aventures.
        </p>
      </section>

      <!-- Bouton Premium -->
      <button v-if="!isPremium" class="btn-primary btn-block mt-4" @click="router.push('/premium')">
        Passer Premium
      </button>

      <div v-else class="premium-active">👑 Abonnement Premium actif</div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useXpStore } from '@/stores/xp.store'
import { useUiStore } from '@/stores/ui.store'
import TopBar from '@/components/TopBar.vue'
import XpBar from '@/components/XpBar.vue'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const authStore = useAuthStore()
const xpStore = useXpStore()
const uiStore = useUiStore()

const displayName = computed(() => authStore.profile?.username || 'Profil')
const isPremium = computed(() => authStore.profile?.is_premium ?? false)

const totalXp = computed(() => authStore.profile?.total_xp ?? xpStore.totalXp ?? 0)
const escapesCompleted = ref(0)

const level = computed(() => authStore.profile?.level ?? xpStore.level ?? 1)

const xpNext = computed(() => xpStore.xpForNextLevel ?? 0)

const enigmasCompleted = ref(0)

const memberSince = computed(() => {
  const raw = authStore.profile?.created_at
  if (!raw) return '—'
  const date = new Date(raw)
  return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
})

const avatarEmoji = computed(() => {
  const name = authStore.profile?.username
  return name ? name.trim().charAt(0).toUpperCase() : '🗝️'
})

function changeAvatar() {
  uiStore.showToast('Changement d\'avatar bientôt disponible', 'info')
}

async function loadEscapesCompleted() {
  const userId = authStore.user?.id
  if (!userId) return
  const { count, error } = await supabase
    .from('user_escapes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
  if (!error && typeof count === 'number') {
    escapesCompleted.value = count
  }
}

async function loadEnigmasCompleted() {
  const userId = authStore.user?.id
  if (!userId) return
  const { count, error } = await supabase
    .from('user_enigma_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('solved_at', 'is', null)
  if (!error && typeof count === 'number') {
    enigmasCompleted.value = count
  }
}

const badges = computed(() => [
  { id: 1, label: 'Premier Pas', icon: '🔑', description: 'Valider 1 énigme', unlocked: enigmasCompleted.value >= 1, premiumOnly: false },
  { id: 2, label: 'Détective', icon: '🕵️', description: '10 énigmes validées', unlocked: enigmasCompleted.value >= 10, premiumOnly: false },
  { id: 3, label: 'Archiviste', icon: '📚', description: '1 escape terminé', unlocked: escapesCompleted.value >= 1, premiumOnly: false },
  { id: 4, label: 'Maître', icon: '🧠', description: '50 énigmes validées', unlocked: enigmasCompleted.value >= 50, premiumOnly: false },
  { id: 5, label: 'Collectionneur', icon: '🗂️', description: '3 escapes terminés', unlocked: escapesCompleted.value >= 3, premiumOnly: false },
  { id: 6, label: 'Légende', icon: '👑', description: 'Premium actif', unlocked: isPremium.value, premiumOnly: true },
])

const unlockedBadges = computed(() => badges.value.filter((b) => b.unlocked).length)
const totalBadges = computed(() => badges.value.length)

onMounted(async () => {
  await loadEscapesCompleted()
  await loadEnigmasCompleted()
})
</script>

<style scoped>
.profile-page {
  width: 100%;
}

.center {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 6px;
}

.avatar {
  width: 112px;
  height: 112px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44px;
  background: rgba(255, 255, 255, 0.22);
  border: 3px solid rgba(90, 56, 24, 0.35);
  cursor: pointer;
  transition: transform 0.2s;
}

.avatar:hover {
  transform: scale(1.05);
}

.header-badges-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.rank-label {
  font-size: 11px;
  color: var(--sepia);
  font-weight: 600;
}

.rank-pill {
  background: rgba(90, 56, 24, 0.12);
  border: 1px solid rgba(90, 56, 24, 0.35);
  border-radius: 999px;
  padding: 3px 12px;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink3);
}

.premium-badge {
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(200, 144, 10, 0.15);
  border: 1px solid rgba(200, 144, 10, 0.4);
  font-size: 12px;
  font-weight: 700;
  color: var(--gold);
}

.member-since {
  color: var(--sepia);
  font-weight: 600;
  font-size: 12px;
  margin-top: 4px;
  margin-bottom: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  padding: 14px;
  text-align: center;
}

.stat-icon {
  font-size: 20px;
}

.stat-value {
  font-family: 'Cinzel', serif;
  font-size: 18px;
  font-weight: 900;
  color: var(--ink);
  margin-top: 4px;
}

.stat-label {
  font-size: 11px;
  color: var(--sepia);
  margin-top: 4px;
}


.badges-scroll {
  max-height: 360px;
  overflow-y: auto;
  padding-right: 4px;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 8px;
}

.badge-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  background: var(--parch2);
  border: 1px solid var(--border);
  transition: all 0.2s;
}

.badge-item.premium {
  border: 1px solid rgba(200, 144, 10, 0.35);
}

.badge-crown {
  position: absolute;
  top: 4px;
  left: 6px;
  font-size: 12px;
  line-height: 1;
}

.badge-item.locked {
  opacity: 0.35;
  filter: grayscale(1);
}

.badge-icon {
  font-size: 28px;
  margin-bottom: 6px;
}

.badge-name {
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  color: var(--ink);
}

.badge-desc {
  margin-top: 4px;
  font-size: 10px;
  font-weight: 600;
  text-align: center;
  color: var(--sepia);
  line-height: 1.25;
}

.badge-premium-lock {
  margin-top: 4px;
  font-size: 10px;
  font-weight: 700;
  color: var(--gold);
}

.premium-active {
  margin-top: 16px;
  text-align: center;
  font-weight: 700;
  color: var(--gold);
}

@media (max-width: 600px) {
  .badges-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
