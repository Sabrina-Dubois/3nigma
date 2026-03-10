<template>
    <header class="flex items-center justify-between px-4 py-3 sticky top-0 z-40"
        style="background: var(--parch2); border-bottom: 1px solid var(--border); box-shadow: 0 2px 8px var(--shadow);">

        <!-- Logo -->
        <router-link to="/" style="text-decoration: none;">
            <span
                style="font-family: 'Cinzel', serif; font-weight: 900; font-size: 22px; color: var(--ink3); letter-spacing: 1px;">
                <span style="color: var(--gold)">🗝️ 3</span>NIGMA<span
                    style="color: var(--gold); font-size: 30px;">°</span>
            </span>
        </router-link>

        <!-- Enigmes + Escapes + XP -->
        <div class="flex items-center gap-3">
            <div class="flex items-center gap-1">
                <span style="font-size: 16px;">🔍</span>
                <span style="font-family: 'Cinzel', serif; font-size: 13px; color: var(--ink2);">
                    {{ enigmasCompleted }}
                </span>
            </div>

            <div class="flex items-center gap-1">
                <span style="font-size: 16px;">🗂️</span>
                <span style="font-family: 'Cinzel', serif; font-size: 13px; color: var(--ink2);">
                    {{ escapesCompleted }}
                </span>
            </div>

            <div class="flex items-center gap-1">
                <span style="font-family: 'Cinzel', serif; font-size: 13px; color: var(--ink2);">
                    {{ authStore.profile?.total_xp ?? 0 }} XP
                </span>
            </div>
        </div>

    </header>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { supabase } from '@/lib/supabase'

const authStore = useAuthStore()
const enigmasCompleted = ref(0)
const escapesCompleted = ref(0)

async function loadCounts() {
    const userId = authStore.user?.id
    if (!userId) return

    const [enigmasRes, escapesRes] = await Promise.all([
        supabase
            .from('user_enigma_attempts')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .not('solved_at', 'is', null),
        supabase
            .from('user_escapes')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .not('completed_at', 'is', null),
    ])

    if (!enigmasRes.error && typeof enigmasRes.count === 'number') {
        enigmasCompleted.value = enigmasRes.count
    }
    if (!escapesRes.error && typeof escapesRes.count === 'number') {
        escapesCompleted.value = escapesRes.count
    }
}

onMounted(loadCounts)

// Se rafraîchit automatiquement quand le profil est rechargé (ex: après une énigme résolue)
watch(() => authStore.profile?.total_xp, (newXp, oldXp) => {
    if (newXp !== oldXp) loadCounts()
})
</script>
