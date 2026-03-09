<template>
  <div class="min-h-screen flex flex-col items-center justify-start px-4 pt-6 pb-12" style="background: var(--parch)">

    <!-- Logo -->
    <div class="text-center mb-10">
      <!--<div class="text-5xl mb-3">🗝️</div>-->
      <h1
        style="font-family: 'Cinzel', serif; font-weight: 900; font-size: 38px; color: var(--ink3); letter-spacing: 2px;">
        <span style="color: var(--gold)">🗝️ 3</span>NIGMA<span
          style="color: var(--gold); font-size: 55px;">°</span>
      </h1>
      <p
        style="font-family: 'IM Fell English', serif; font-style: italic; color: var(--sepia); font-size: 18px; margin-top: 6px;">
        Chaque jour, une clé. Chaque clé, une vérité.
      </p>
    </div>

    <!-- Carte formulaire -->
    <div class="w-full max-w-sm rounded p-8 relative"
      style="background: var(--parch3); border: 1px solid var(--border); box-shadow: 0 4px 20px var(--shadow);">

      <!-- Cadre intérieur décoratif -->
      <div class="absolute inset-2 rounded pointer-events-none" style="border: 1px solid rgba(30,14,4,0.07)"></div>

      <h2
        style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 600; letter-spacing: 3px; color: var(--ink); text-align: center; margin-bottom: 28px; text-transform: uppercase;">
        Se connecter
      </h2>

      <!-- Message d'erreur -->
      <div v-if="errorMsg" class="mb-4 px-4 py-3 rounded text-sm"
        style="background: rgba(139,26,10,0.1); border: 1px solid rgba(139,26,10,0.3); color: var(--red); font-family: 'Crimson Pro', serif;">
        {{ errorMsg }}
      </div>

      <!-- Champ email -->
      <div class="mb-4">
        <label
          style="font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 2px; color: var(--sepia); text-transform: uppercase; display: block; margin-bottom: 6px;">
          Email
        </label>
        <input v-model="email" type="email" placeholder="votre@email.com" class="w-full px-4 py-3 rounded outline-none"
          style="background: var(--parch); border: 1px solid var(--border); font-family: 'Crimson Pro', serif; font-size: 16px; color: var(--ink);" />
      </div>

      <!-- Champ mot de passe -->
      <div class="mb-6">
        <label
          style="font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 2px; color: var(--sepia); text-transform: uppercase; display: block; margin-bottom: 6px;">
          Mot de passe
        </label>
        <input v-model="password" type="password" placeholder="••••••••" class="w-full px-4 py-3 rounded outline-none"
          style="background: var(--parch); border: 1px solid var(--border); font-family: 'Crimson Pro', serif; font-size: 16px; color: var(--ink);"
          @keyup.enter="handleLogin" />
      </div>

      <!-- Bouton connexion -->
      <button @click="handleLogin" :disabled="loading" class="w-full py-3 rounded transition-opacity"
        style="background: var(--ink3); color: var(--parch); font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; cursor: pointer; opacity: 1;"
        :style="{ opacity: loading ? 0.7 : 1 }">
        {{ loading ? 'Connexion...' : 'Se connecter' }}
      </button>

      <!-- Liens -->
      <div class="mt-6 text-center flex flex-col gap-2">
        <router-link to="/forgot-password"
          style="font-family: 'Crimson Pro', serif; font-style: italic; font-size: 14px; color: var(--sepia);">
          Mot de passe oublié ?
        </router-link>
        <router-link to="/register"
          style="font-family: 'Cinzel', serif; font-size: 11px; font-weight: 600; letter-spacing: 2px; color: var(--gold); text-transform: uppercase;">
          Créer un compte
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { t } = useI18n()

// ── STATE LOCAL ──
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

// ── CONNEXION ──
async function handleLogin() {
  errorMsg.value = ''
  loading.value = true

  try {
    await authStore.signIn(email.value, password.value)
    // Redirige vers la page demandée ou l'accueil
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    // Traduit les erreurs Supabase en français
    if (error.message.includes('Invalid login credentials')) {
      errorMsg.value = 'Email ou mot de passe incorrect.'
    } else if (error.message.includes('Email not confirmed')) {
      errorMsg.value = 'Veuillez confirmer votre email avant de vous connecter.'
    } else {
      errorMsg.value = 'Une erreur est survenue. Réessayez.'
    }
  } finally {
    loading.value = false
  }
}
</script>
