<template>
  <div class="min-h-screen parch-bg">
    <TopBar />

    <main class="px-4 pt-6 pb-24 max-w-xl mx-auto">
      <!-- Titre -->
      <div class="mb-6">
        <h1 class="page-title">Réglages</h1>
        <p class="page-subtitle mt-1">Gérez votre compte et vos préférences</p>
      </div>

      <!-- Compte -->
      <section class="card double-frame rounded p-5 mb-4 relative">

        <p class="section-label mb-3">Compte</p>

        <div class="grid gap-3">
          <div>
            <p style="font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 2px; color: var(--sepia);">
              Pseudo
            </p>
            <p style="font-family: 'Crimson Pro', serif; font-size: 16px; color: var(--ink);">
              {{ authStore.profile?.username ?? '—' }}
            </p>
          </div>

          <div>
            <p style="font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 2px; color: var(--sepia);">
              Email
            </p>
            <p style="font-family: 'Crimson Pro', serif; font-size: 16px; color: var(--ink);">
              {{ authStore.user?.email ?? '—' }}
            </p>
          </div>

          <div>
            <p style="font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 2px; color: var(--sepia);">
              Statut
            </p>
            <p style="font-family: 'Crimson Pro', serif; font-size: 16px; color: var(--ink);">
              {{ authStore.profile?.is_premium ? 'Premium 🗝️' : 'Gratuit' }}
            </p>
          </div>
        </div>
      </section>

      <!-- Sécurité -->
      <section class="card double-frame rounded p-5 mb-4">
        <p class="section-label mb-3">Sécurité</p>

        <button @click="router.push('/forgot-password')" class="btn-primary btn-block">
          Changer mon mot de passe
        </button>
      </section>

      <!-- Notifications -->
      <section class="card double-frame rounded p-5 mb-4">
        <p class="section-label mb-3">Notifications</p>

        <div class="flex items-center justify-between">
          <div>
            <p style="font-family: 'Crimson Pro', serif; font-size: 16px; color: var(--ink);">
              Rappel quotidien
            </p>
            <p style="font-family: 'Crimson Pro', serif; font-size: 13px; color: var(--sepia);">
              Activez un rappel local pour ne pas rater un jour
            </p>
          </div>

          <button
            @click="toggleNotifications"
            class="toggle-pill"
            :class="{ active: notificationsEnabled }">
            {{ notificationsEnabled ? 'Activé' : 'Désactivé' }}
          </button>
        </div>

        <p class="mt-3"
          style="font-family: 'Crimson Pro', serif; font-size: 13px; color: var(--sepia);">
          Fonctionne sur cet appareil uniquement.
        </p>
      </section>

      <!-- Premium -->
      <section class="card double-frame rounded p-5 mb-4">
        <p class="section-label mb-3">Premium</p>

        <div v-if="authStore.profile?.is_premium">
          <p style="font-family: 'Crimson Pro', serif; font-size: 16px; color: var(--ink);">
            Vous êtes membre Premium 🗝️
          </p>
          <p class="mt-1" style="font-family: 'Crimson Pro', serif; font-size: 13px; color: var(--sepia);">
            Merci pour votre soutien.
          </p>
        </div>

        <div v-else>
          <p style="font-family: 'Crimson Pro', serif; font-size: 16px; color: var(--ink);">
            Débloquez toutes les enquêtes et avantages.
          </p>
          <button @click="router.push('/premium')" class="btn-primary btn-block mt-4">
            Passer au Premium
          </button>
        </div>
      </section>

      <!-- À propos -->
      <section class="card double-frame rounded p-5 mb-4">
        <p class="section-label mb-3">À propos</p>

        <div class="grid gap-3">
          <button class="w-full text-left py-3 px-4 rounded card-soft"
            @click="router.push('/help')">
            Centre d'aide
          </button>

          <button class="w-full text-left py-3 px-4 rounded card-soft"
            @click="router.push('/terms')">
            Conditions d'utilisation
          </button>

          <button class="w-full text-left py-3 px-4 rounded card-soft"
            @click="router.push('/privacy')">
            Politique de confidentialité
          </button>
        </div>
      </section>

      <!-- Déconnexion -->
      <button @click="onLogout" class="btn-danger btn-block py-3 rounded">
        Se déconnecter
      </button>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import TopBar from '@/components/TopBar.vue'

const router = useRouter()
const authStore = useAuthStore()
const notificationsEnabled = ref(false)

const NOTIF_KEY = '3nigma.notifications.enabled'

onMounted(() => {
  const saved = localStorage.getItem(NOTIF_KEY)
  notificationsEnabled.value = saved === 'true'
})

function toggleNotifications() {
  notificationsEnabled.value = !notificationsEnabled.value
  localStorage.setItem(NOTIF_KEY, String(notificationsEnabled.value))
}

async function onLogout() {
  await authStore.signOut()
  router.push('/login')
}
</script>
