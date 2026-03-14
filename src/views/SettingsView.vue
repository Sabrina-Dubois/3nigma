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
          <p class="caption">Si l'email change, un email de confirmation sera envoyé.</p>
        </div>
      </section>

      <!-- Sécurité -->
      <section class="card double-frame rounded p-5 mb-4">
        <p class="section-title-sm mb-3">Sécurité</p>

        <div v-if="!showPasswordForm">
          <button @click="showPasswordForm = true" class="btn-primary btn-block">
            Changer mon mot de passe
          </button>
        </div>

        <div v-else class="grid gap-3">
          <div>
            <label class="form-label">Nouveau mot de passe</label>
            <input v-model="newPassword" type="password" class="input-field" placeholder="••••••••" />
          </div>
          <div>
            <label class="form-label">Confirmer le mot de passe</label>
            <input v-model="confirmPassword" type="password" class="input-field" placeholder="••••••••" />
          </div>
          <div class="flex gap-2">
            <button class="btn-primary flex-1" :disabled="savingPassword" @click="changePassword">
              {{ savingPassword ? '...' : 'Confirmer' }}
            </button>
            <button class="btn-secondary" @click="showPasswordForm = false; newPassword = ''; confirmPassword = ''">
              Annuler
            </button>
          </div>
        </div>
      </section>

      <!-- Préférences -->
      <section class="card double-frame rounded p-5 mb-4">
        <p class="section-title-sm mb-4">Préférences</p>

        <!-- Notifications -->
        <div class="flex items-center justify-between mb-4">
          <div>
            <p style="font-family: 'Crimson Pro', serif; font-size: 16px; color: var(--ink);">
              Notifications
            </p>
            <p class="caption">Recevoir des alertes sur cet appareil</p>
          </div>
          <button @click="toggleNotifications" class="toggle-pill" :class="{ active: notificationsEnabled }">
            {{ notificationsEnabled ? 'Activé' : 'Désactivé' }}
          </button>
        </div>

        <!-- Heure du rappel -->
        <div class="flex items-center justify-between mb-5">
          <div>
            <p style="font-family: 'Crimson Pro', serif; font-size: 16px; color: var(--ink);">
              Rappel quotidien
            </p>
            <p class="caption">Heure à laquelle vous souhaitez être rappelé</p>
          </div>
          <div class="time-picker">
            <select v-model="reminderHour" class="time-select" @change="saveReminderTime">
              <option v-for="h in hours" :key="h" :value="h">{{ h }}</option>
            </select>
            <span class="time-sep">:</span>
            <select v-model="reminderMinute" class="time-select" @change="saveReminderTime">
              <option v-for="m in minutes" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
        </div>

        <!-- Langue -->
        <div class="flex items-center justify-between">
          <div>
            <p style="font-family: 'Crimson Pro', serif; font-size: 16px; color: var(--ink);">
              Langue
            </p>
            <p class="caption">Langue de l'interface</p>
          </div>
          <div class="flex gap-2">
            <button @click="setLanguage('fr')" class="lang-btn" :class="{ 'lang-btn--active': language === 'fr' }">
              FR
            </button>
            <button @click="setLanguage('en')" class="lang-btn" :class="{ 'lang-btn--active': language === 'en' }">
              EN
            </button>
          </div>
        </div>
      </section>

      <!-- Premium -->
      <section class="card double-frame rounded p-5 mb-4">
        <p class="section-title-sm mb-3">Premium</p>

        <div v-if="authStore.profile?.is_premium">
          <p style="font-family: 'Crimson Pro', serif; font-size: 16px; color: var(--ink);">
            Vous êtes membre Premium 🗝️
          </p>
          <p class="caption mt-1">Merci pour votre soutien.</p>
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
          <button class="w-full text-left py-3 px-4 rounded card-soft" @click="router.push('/help')">
            Centre d'aide
          </button>
          <button class="w-full text-left py-3 px-4 rounded card-soft" @click="router.push('/terms')">
            Conditions d'utilisation
          </button>
          <button class="w-full text-left py-3 px-4 rounded card-soft" @click="router.push('/privacy')">
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
const reminderHour = ref('08')
const reminderMinute = ref('00')
const language = ref('fr')
const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const minutes = ['00', '15', '30', '45']

const username = ref('')
const email = ref('')
const savingAll = ref(false)

const showPasswordForm = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const savingPassword = ref(false)

const NOTIF_KEY = '3nigma.notifications.enabled'
const REMINDER_KEY = '3nigma.reminder.time'
const LANG_KEY = '3nigma.language'

onMounted(() => {
  const p = authStore.profile
  notificationsEnabled.value = p?.notifications_enabled ?? localStorage.getItem(NOTIF_KEY) === 'true'
  const saved = p?.reminder_time ?? localStorage.getItem(REMINDER_KEY) ?? '08:00'
  const [h, m] = saved.split(':')
  reminderHour.value = h ?? '08'
  reminderMinute.value = m ?? '00'
  language.value = p?.language ?? localStorage.getItem(LANG_KEY) ?? 'fr'
  username.value = p?.username ?? ''
  email.value = authStore.user?.email ?? ''
})

async function toggleNotifications() {
  notificationsEnabled.value = !notificationsEnabled.value
  localStorage.setItem(NOTIF_KEY, String(notificationsEnabled.value))
  await supabase
    .from('profiles')
    .update({ notifications_enabled: notificationsEnabled.value })
    .eq('id', authStore.user?.id)
    .select()
}

async function saveReminderTime() {
  const time = `${reminderHour.value}:${reminderMinute.value}`
  localStorage.setItem(REMINDER_KEY, time)
  await supabase
    .from('profiles')
    .update({ reminder_time: time })
    .eq('id', authStore.user?.id)
    .select()
}

async function setLanguage(lang) {
  language.value = lang
  localStorage.setItem(LANG_KEY, lang)
  await supabase
    .from('profiles')
    .update({ language: lang })
    .eq('id', authStore.user?.id)
    .select()
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
    .select()

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

async function changePassword() {
  if (newPassword.value.length < 8) {
    uiStore.showToast('Minimum 8 caractères.', 'error')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    uiStore.showToast('Les mots de passe ne correspondent pas.', 'error')
    return
  }
  savingPassword.value = true
  const { error } = await supabase.auth.updateUser({ password: newPassword.value })
  savingPassword.value = false
  if (error) {
    if (error.status === 422) {
      uiStore.showToast('Le mot de passe doit être différent du précédent.', 'error')
    } else {
      uiStore.showToast('Erreur : ' + error.message, 'error')
    }
  } else {
    showPasswordForm.value = false
    newPassword.value = ''
    confirmPassword.value = ''
    uiStore.showToast('Mot de passe mis à jour.', 'success')
  }
}

async function onLogout() {
  await authStore.signOut()
  router.push('/login')
}
</script>

<style scoped>
.time-picker {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--parch2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.3rem 0.5rem;
}

.time-select {
  font-family: 'Cinzel', serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ink3);
  background: var(--parch2);
  border: none;
  outline: none;
  cursor: pointer;
  padding: 0.1rem 0.15rem;
  min-width: 2.5rem;
}

.time-sep {
  font-family: 'Cinzel', serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--sepia);
}

.lang-btn {
  font-family: 'Cinzel', serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--sepia);
  cursor: pointer;
  transition: all 0.2s;
}

.lang-btn--active {
  background: var(--ink3);
  color: var(--parch);
  border-color: var(--ink3);
}
</style>
