<template>
  <div class="min-h-screen flex flex-col items-center justify-start px-4 pt-6 pb-24 parch-bg">

    <!-- Logo -->
    <div class="text-center mb-10">
      <h1
        style="font-family: 'Cinzel', serif; font-weight: 900; font-size: 38px; color: var(--ink3); letter-spacing: 2px;">
        <span style="color: var(--gold)">🗝️ 3</span>NIGMA<span style="color: var(--gold); font-size: 55px;">°</span>
      </h1>
      <p
        style="font-family: 'IM Fell English', serif; font-style: italic; color: var(--sepia); font-size: 18px; margin-top: 6px;">
        Chaque jour, une clé. Chaque clé, une vérité.
      </p>
    </div>

    <!-- Carte -->
    <div class="w-full max-w-sm rounded p-8 relative card double-frame">

      <!-- Toggle Login / Register -->
      <div class="tab-group mb-8">
        <button @click="switchMode('login')" class="tab-btn" :class="{ active: mode === 'login' }">
          Connexion
        </button>
        <button @click="switchMode('register')" class="tab-btn" :class="{ active: mode === 'register' }">
          Inscription
        </button>
      </div>

      <!-- Message succès -->
      <div v-if="successMsg" class="mb-4 px-4 py-3 rounded"
        style="background: rgba(42,90,26,0.1); border: 1px solid rgba(42,90,26,0.3); color: #2a5a1a; font-family: 'Crimson Pro', serif; font-size: 15px;">
        {{ successMsg }}
      </div>

      <!-- Message erreur -->
      <div v-if="errorMsg" class="mb-4 px-4 py-3 rounded"
        style="background: rgba(139,26,10,0.1); border: 1px solid rgba(139,26,10,0.3); color: var(--red); font-family: 'Crimson Pro', serif; font-size: 15px;">
        {{ errorMsg }}
      </div>

      <template v-if="!successMsg">

        <!-- Pseudo (register only) -->
        <div v-if="mode === 'register'" class="mb-4">
          <label class="form-label">Pseudo</label>
          <input v-model="username" type="text" placeholder="VotreNom" class="input-field" />
        </div>

        <!-- Email -->
        <div class="mb-4">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" placeholder="votre@email.com" class="input-field" />
        </div>

        <!-- Mot de passe -->
        <div class="mb-4">
          <label class="form-label">Mot de passe</label>
          <div class="relative">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••"
              class="input-field pr-12" />
            <button type="button" @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2"
              style="background: none; border: none; cursor: pointer; color: var(--sepia); font-size: 20px;">
              <i :class="showPassword ? 'mdi mdi-eye-off' : 'mdi mdi-eye'"></i>
            </button>
          </div>
        </div>

        <!-- Confirmation (register only) -->
        <div v-if="mode === 'register'" class="mb-6">
          <label class="form-label">Confirmer le mot de passe</label>
          <div class="relative">
            <input v-model="passwordConfirm" :type="showPasswordConfirm ? 'text' : 'password'" placeholder="••••••••"
              class="input-field pr-12" @keyup.enter="handleSubmit" />
            <button type="button" @click="showPasswordConfirm = !showPasswordConfirm"
              class="absolute right-3 top-1/2 -translate-y-1/2"
              style="background: none; border: none; cursor: pointer; color: var(--sepia); font-size: 20px;">
              <i :class="showPasswordConfirm ? 'mdi mdi-eye-off' : 'mdi mdi-eye'"></i>
            </button>
          </div>
        </div>

        <!-- Mot de passe oublié (login only) -->
        <div v-if="mode === 'login'" class="mb-6 text-right">
          <router-link to="/forgot-password"
            style="font-family: 'Crimson Pro', serif; font-style: italic; font-size: 13px; color: var(--sepia);">
            Mot de passe oublié ?
          </router-link>
        </div>

        <!-- Bouton -->
        <button @click="handleSubmit" :disabled="loading" class="btn-primary btn-block">
          {{ loading ? '...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte' }}
        </button>

      </template>
    </div>
  </div>
</template>
Dis-moi quand c'est fait 👇

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// ── MODE : login ou register ──
const mode = ref('login') // 'login' | 'register'
const showPassword = ref(false)
const showPasswordConfirm = ref(false)

// ── STATE ──
const username = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

function switchMode(newMode) {
  mode.value = newMode
  errorMsg.value = ''
  successMsg.value = ''
}

// ── VALIDATION ──
function validate() {
  if (mode.value === 'register') {
    if (!username.value || username.value.length < 3) {
      errorMsg.value = 'Le pseudo doit faire au moins 3 caractères.'
      return false
    }
    if (password.value !== passwordConfirm.value) {
      errorMsg.value = 'Les mots de passe ne correspondent pas.'
      return false
    }
  }
  if (!email.value.includes('@')) {
    errorMsg.value = 'Email invalide.'
    return false
  }
  if (password.value.length < 8) {
    errorMsg.value = 'Le mot de passe doit faire au moins 8 caractères.'
    return false
  }
  return true
}

// ── SUBMIT ──
async function handleSubmit() {
  errorMsg.value = ''
  successMsg.value = ''
  if (!validate()) return

  loading.value = true
  try {
    if (mode.value === 'login') {
      await authStore.signIn(email.value, password.value)
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } else {
      await authStore.signUp(email.value, password.value, username.value)
      successMsg.value = 'Compte créé ! Vérifiez votre email pour confirmer.'
    }
  } catch (error) {
    if (error.message.includes('Invalid login credentials')) {
      errorMsg.value = 'Email ou mot de passe incorrect.'
    } else if (error.message.includes('Email not confirmed')) {
      errorMsg.value = 'Veuillez confirmer votre email avant de vous connecter.'
    } else if (error.message.includes('already registered')) {
      errorMsg.value = 'Cet email est déjà utilisé.'
    } else {
      errorMsg.value = 'Une erreur est survenue. Réessayez.'
    }
  } finally {
    loading.value = false
  }
}
</script>
