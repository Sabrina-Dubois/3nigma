<template>
    <nav class="fixed bottom-0 left-0 w-full z-50" style="
      background: var(--parch2);
      border-top: 1px solid var(--border);
      box-shadow: 0 -2px 12px var(--shadow);
    ">
        <div class="mx-auto flex justify-around items-center px-2 py-2" style="max-width: 430px;">

            <router-link v-for="tab in tabs" :key="tab.name" :to="tab.to"
                class="flex flex-col items-center gap-1 px-4 py-1 rounded transition-all"
                style="text-decoration: none; min-width: 55px;" :style="isActive(tab)
                    ? 'color: var(--gold);'
                    : 'color: var(--sepia);'">
                <i :class="`mdi ${tab.icon}`" style="font-size: 22px;"></i>

                <span style="
            font-family: 'Cinzel', serif;
            font-size: 10px;
            letter-spacing: 1px;
            text-transform: uppercase;
          ">
                    {{ tab.label }}
                </span>

            </router-link>

        </div>
    </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
    { name: 'home', icon: 'mdi-compass', label: 'Enquêtes', to: '/' },
    { name: 'leaderboard', icon: 'mdi-trophy', label: 'Classement', to: '/leaderboard' },
    { name: 'profile', icon: 'mdi-account', label: 'Profil', to: '/profile' },
    { name: 'settings', icon: 'mdi-cog', label: 'Réglages', to: '/settings' },
]

function isActive(tab) {
    if (tab.to === '/') return route.path === '/'
    return route.path.startsWith(tab.to)
}
</script>