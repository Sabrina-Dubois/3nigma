<template>
    <div class="min-h-screen flex flex-col items-center justify-start px-4 pt-6 pb-12 parch-bg">

        <!-- Logo -->
        <div class="text-center mb-10">
            <h1
                style="font-family: 'Cinzel', serif; font-weight: 900; font-size: 38px; color: var(--ink3); letter-spacing: 2px;">
                <span style="color: var(--gold)">🗝️ 3</span>NIGMA<span
                    style="color: var(--gold); font-size: 55px;">°</span>
            </h1>
        </div>

        <!-- Carte -->
        <div class="w-full max-w-sm rounded p-8 relative card double-frame">

            <h2
                style="font-family: 'Cinzel', serif; font-size: 16px; font-weight: 600; letter-spacing: 3px; color: var(--ink); text-align: center; margin-bottom: 28px; text-transform: uppercase;">
                Nouveau mot de passe
            </h2>

            <!-- Chargement initial -->
            <div v-if="initializing"
                style="text-align: center; color: var(--sepia); font-family: 'Crimson Pro', serif; font-size: 15px;">
                Vérification du lien...
            </div>

            <!-- Erreur -->
            <div v-if="error" class="mb-4 px-4 py-3 rounded"
                style="background: rgba(139,26,10,0.1); border: 1px solid rgba(139,26,10,0.3); color: var(--red); font-family: 'Crimson Pro', serif; font-size: 15px;">
                {{ error }}
            </div>

            <!-- Succès -->
            <div v-if="success" class="mb-4 px-4 py-3 rounded"
                style="background: rgba(42,90,26,0.1); border: 1px solid rgba(42,90,26,0.3); color: #2a5a1a; font-family: 'Crimson Pro', serif; font-size: 15px;">
                Mot de passe mis à jour ! Redirection...
            </div>

            <template v-if="!initializing && !success && !linkError">
                <!-- Nouveau mot de passe -->
                <div class="mb-4">
                    <label class="form-label">Nouveau mot de passe</label>
                    <div class="relative">
                        <input v-model="newPassword" :type="showPassword ? 'text' : 'password'" placeholder="••••••••"
                            class="input-field pr-12" />
                        <button type="button" @click="showPassword = !showPassword"
                            class="absolute right-3 top-1/2 -translate-y-1/2"
                            style="background: none; border: none; cursor: pointer; color: var(--sepia);">
                            <i :class="showPassword ? 'mdi mdi-eye-off' : 'mdi mdi-eye'" style="font-size: 20px;"></i>
                        </button>
                    </div>
                </div>

                <!-- Bouton -->
                <button @click="updatePassword" :disabled="loading" class="btn-primary btn-block mt-2"
                    :style="{ opacity: loading ? 0.7 : 1 }">
                    {{ loading ? '...' : 'Confirmer' }}
                </button>
            </template>

            <!-- Lien invalide/expiré -->
            <div v-if="linkError" style="text-align: center;">
                <p
                    style="font-family: 'Crimson Pro', serif; font-size: 15px; color: var(--sepia); margin-bottom: 16px;">
                    Ce lien est invalide ou a expiré.
                </p>
                <button @click="router.push('/forgot-password')" class="btn-primary btn-block">
                    Renvoyer un lien
                </button>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const route = useRoute()

const newPassword = ref('')
const showPassword = ref(false)
const error = ref('')
const success = ref(false)
const loading = ref(false)
const initializing = ref(true)
const linkError = ref(false)

onMounted(async () => {
    const token_hash = route.query.token_hash
    const type = route.query.type

    if (!token_hash || type !== 'recovery') {
        initializing.value = false
        linkError.value = true
        return
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'recovery',
    })

    if (verifyError) {
        initializing.value = false
        linkError.value = true
        return
    }

    initializing.value = false
})


async function updatePassword() {
    if (newPassword.value.length < 8) {
        error.value = 'Le mot de passe doit faire au moins 8 caractères.'
        return
    }

    loading.value = true
    error.value = ''

    const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword.value,
    })

    loading.value = false

    if (updateError) {
        error.value = updateError.message
    } else {
        success.value = true
        setTimeout(async () => {
            await supabase.auth.signOut()
            router.push('/login')
        }, 2000)
    }
}
</script>
