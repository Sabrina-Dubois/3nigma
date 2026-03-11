<template>
    <nav class="bottom-nav">
        <div class="bottom-nav__inner">
            <router-link v-for="tab in tabs" :key="tab.name" :to="tab.to" class="bottom-nav__item"
                :style="isActive(tab) ? 'color: var(--gold);' : 'color: var(--sepia);'">
                <i :class="`mdi ${tab.icon}`" class="bottom-nav__icon"></i>
                <span class="bottom-nav__label">
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
    { name: 'home', icon: 'mdi-home-variant', label: 'Accueil', to: '/' },
    { name: 'escapes', icon: 'mdi-compass', label: 'Enquêtes', to: '/escapes' },
    { name: 'leaderboard', icon: 'mdi-trophy', label: 'Classement', to: '/leaderboard' },
    { name: 'profile', icon: 'mdi-account', label: 'Profil', to: '/profile' },
    { name: 'settings', icon: 'mdi-cog', label: 'Réglages', to: '/settings' },
]

function isActive(tab) {
    if (tab.to === '/') return route.path === '/'
    return route.path.startsWith(tab.to)
}
</script>

<style scoped>
.bottom-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    z-index: 50;
    background: var(--parch2);
    border-top: 1px solid var(--border);
    box-shadow: 0 -2px 12px var(--shadow);
}

.bottom-nav__inner {
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 2px;
    gap: 0;
}

.bottom-nav__item {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 6px 0;
    border-radius: 10px;
    text-decoration: none;
    transition: all 0.2s ease;
}

.bottom-nav__icon {
    font-size: 26px;
}

.bottom-nav__label {
    font-family: 'Cinzel', serif;
    font-size: 11px;
    letter-spacing: 1px;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

@media (max-width: 360px) {
    .bottom-nav__label {
        display: none;
    }
}
</style>
