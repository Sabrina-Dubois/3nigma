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

        <p class="section-title-sm mb-3">Compte</p>

        <div class="grid gap-3">
          <div>
            <label class="form-label">Pseudo</label>
            <input v-model="username" type="text" class="input-field" placeholder="Votre pseudo" />
          </div>

          <div>
            <label class="form-label">Email</label>
            <input v-model="email" type="email" class="input-field" placeholder="votre@email.com" />
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

        <div class="grid gap-2 mt-4">
          <button class="btn-primary btn-block" :disabled="savingAll" @click="saveAll">
            {{ savingAll ? '...' : 'Enregistrer' }}
          </button>
          <p class="caption">Si l’email change, un email de confirmation sera envoyé.</p>
        </div>
      </section>

      <!-- Sécurité -->
      <section class="card double-frame rounded p-5 mb-4">
        <p class="section-title-sm mb-3">Sécurité</p>

        <button @click="router.push('/forgot-password')" class="btn-primary btn-block">
          Changer mon mot de passe
        </button>
      </section>

      <!-- Notifications -->
      <section class="card double-frame rounded p-5 mb-4">
        <p class="section-title-sm mb-3">Notifications</p>

        <div class="flex items-center justify-between">
          <div>
            <p style="font-family: 'Crimson Pro', serif; font-size: 16px; color: var(--ink);">
              Rappel quotidien
            </p>
            <p class="caption">
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

        <p class="caption mt-3">
          Fonctionne sur cet appareil uniquement.
        </p>
      </section>

      <!-- Premium -->
      <section class="card double-frame rounded p-5 mb-4">
        <p class="section-title-sm mb-3">Premium</p>

        <div v-if="authStore.profile?.is_premium">
          <p style="font-family: 'Crimson Pro', serif; font-size: 16px; color: var(--ink);">
            Vous êtes membre Premium 🗝️
          </p>
          <p class="caption mt-1">
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
        <p class="section-title-sm mb-3">À propos</p>

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
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/stores/ui.store'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()
const notificationsEnabled = ref(false)
const username = ref('')
const email = ref('')
const savingAll = ref(false)

const NOTIF_KEY = '3nigma.notifications.enabled'

onMounted(() => {
  const saved = localStorage.getItem(NOTIF_KEY)
  notificationsEnabled.value = saved === 'true'
  username.value = authStore.profile?.username ?? ''
  email.value = authStore.user?.email ?? ''
})

function toggleNotifications() {
  notificationsEnabled.value = !notificationsEnabled.value
  localStorage.setItem(NOTIF_KEY, String(notificationsEnabled.value))
}

async function saveAll() {
  if (!authStore.user?.id) return
  if (!username.value.trim()) {
    uiStore.showToast('Pseudo invalide.', 'error')
    return
  }
  if (!email.value.includes('@')) {
    uiStore.showToast('Email invalide.', 'error')
    return
  }

  savingAll.value = true

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ username: username.value.trim() })
    .eq('id', authStore.user.id)

  let emailError = null
  if (email.value.trim() !== (authStore.user?.email ?? '')) {
    const { error } = await supabase.auth.updateUser({ email: email.value.trim() })
    emailError = error
  }

  savingAll.value = false

  if (profileError || emailError) {
    uiStore.showToast('Erreur lors de la sauvegarde.', 'error')
    return
  }

  await authStore.fetchProfile()
  uiStore.showToast('Modifications enregistrées.', 'success')
}

async function onLogout() {
  await authStore.signOut()
  router.push('/login')
}
</script>
