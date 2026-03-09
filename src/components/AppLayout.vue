<template>
    <div class="flex flex-col min-h-screen" style="background: var(--parch);">

        <TopBar />

        <!-- Contenu de la page — padding bottom pour pas être caché par la BottomNav -->
        <main class="flex-1 px-4 pt-4 pb-24">
            <slot />
        </main>

        <BottomNav />

    </div>
</template>

<script setup>
import TopBar from '@/components/TopBar.vue'
import BottomNav from '@/components/BottomNav.vue'
</script>