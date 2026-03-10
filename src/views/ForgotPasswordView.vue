<template>
    <div class="min-h-screen flex flex-col items-center justify-start px-4 pt-6 pb-12" style="background: var(--parch)">

        <!-- Logo -->
        <div class="text-center mb-10">
            <h1
                style="font-family: 'Cinzel', serif; font-weight: 900; font-size: 38px; color: var(--ink3); letter-spacing: 2px;">
                <span style="color: var(--gold)">🗝️ 3</span>NIGMA<span
                    style="color: var(--gold); font-size: 55px;">°</span>
            </h1>
        </div>

        <!-- Carte -->
        <div class="w-full max-w-sm rounded p-8 relative"
            style="background: var(--parch3); border: 1px solid var(--border); box-shadow: 0 4px 20px var(--shadow);">

            <div class="absolute inset-2 rounded pointer-events-none" style="border: 1px solid rgba(30,14,4,0.07)">
            </div>

            <h2
                style="font-family: 'Cinzel', serif; font-size: 16px; font-weight: 600; letter-spacing: 3px; color: var(--ink); text-align: center; margin-bottom: 12px; text-transform: uppercase;">
                Mot de passe oublié
            </h2>

            <p
                style="font-family: 'Crimson Pro', serif; font-style: italic; font-size: 15px; color: var(--sepia); text-align: center; margin-bottom: 24px;">
                Entrez votre email — vous recevrez un lien pour réinitialiser votre mot de passe.
            </p>

            <!-- Succès -->
            <div v-if="success" class="mb-4 px-4 py-3 rounded"
                style="background: rgba(42,90,26,0.1); border: 1px solid rgba(42,90,26,0.3); color: #2a5a1a; font-family: 'Crimson Pro', serif; font-size: 15px;">
                Email envoyé ! Vérifiez votre boîte mail.
            </div>

            <!-- Erreur -->
            <div v-if="error" class="mb-4 px-4 py-3 rounded"
                style="background: rgba(139,26,10,0.1); border: 1px solid rgba(139,26,10,0.3); color: var(--red); font-family: 'Crimson Pro', serif; font-size: 15px;">
                {{ error }}
            </div>

            <template v-if="!success">
                <!-- Email -->
                <div class="mb-6">
                    <label
                        style="font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 2px; color: var(--sepia); text-transform: uppercase; display: block; margin-bottom: 6px;">
                        Email
                    </label>
                    <input v-model="email" type="email" placeholder="votre@email.com"
                        class="w-full px-4 py-3 rounded outline-none"
                        style="background: var(--parch); border: 1px solid var(--border); font-family: 'Crimson Pro', serif; font-size: 16px; color: var(--ink);"
                        @keyup.enter="sendReset" />
                </div>

                <!-- Bouton -->
                <button @click="sendReset" :disabled="loading" class="w-full py-3 rounded"
                    style="background: var(--ink3); color: var(--parch); font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; cursor: pointer; border: none;"
                    :style="{ opacity: loading ? 0.7 : 1 }">
                    {{ loading ? '...' : 'Envoyer le lien' }}
                </button>
            </template>

            <!-- Retour login -->
            <div class="mt-6 text-center">
                <router-link to="/login"
                    style="font-family: 'Crimson Pro', serif; font-style: italic; font-size: 14px; color: var(--sepia);">
                    ← Retour à la connexion
                </router-link>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

async function sendReset() {
    if (!email.value.includes('@')) {
        error.value = 'Email invalide.'
        return
    }

    loading.value = true
    error.value = ''

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.value, {
        redirectTo: `${window.location.origin}/reset-password`,
    })

    loading.value = false

    if (resetError) {
        error.value = resetError.message
    } else {
        success.value = true
    }
}
</script>