<template>
    <header class="flex items-center justify-between px-4 py-3 sticky top-0 z-40"
        style="background: var(--parch2); border-bottom: 1px solid var(--border); box-shadow: 0 2px 8px var(--shadow);">

        <!-- Logo -->
        <router-link to="/" style="text-decoration: none;">
            <span
                style="font-family: 'Cinzel', serif; font-weight: 900; font-size: 20px; color: var(--ink3); letter-spacing: 1px;">
                <span style="color: var(--gold)">🗝️ 3</span>NIGMA<span
                    style="color: var(--gold); font-size: 28px;">°</span>
            </span>
        </router-link>

        <!-- XP + Streak -->
        <div class="flex items-center gap-3">
            <!-- Streak -->
            <div class="flex items-center gap-1">
                <span style="font-size: 16px;">🔥</span>
                <span style="font-family: 'Cinzel', serif; font-size: 12px; color: var(--ink2);">
                    {{ authStore.profile?.current_streak ?? 0 }}
                </span>
            </div>

            <!-- XP -->
            <div class="flex items-center gap-1">
                <span style="font-family: 'Cinzel', serif; font-size: 12px; color: var(--gold);">
                    {{ authStore.profile?.total_xp ?? 0 }} XP
                </span>
            </div>
        </div>

    </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
</script>
