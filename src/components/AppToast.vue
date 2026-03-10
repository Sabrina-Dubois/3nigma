<template>
    <!-- Conteneur fixe en haut de l'écran -->
    <div class="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4" style="pointer-events: none;">

        <!-- Un toast par message dans le store -->
        <transition-group name="toast">
            <div v-for="toast in uiStore.toasts" :key="toast.id"
                class="w-full max-w-sm px-4 py-3 rounded flex items-center gap-3"
                style="pointer-events: all; box-shadow: 0 4px 16px rgba(30,14,4,0.15);" :style="toastStyle(toast.type)">

                <!-- Icône selon le type -->
                <i :class="toastIcon(toast.type)" style="font-size: 18px;"></i>

                <!-- Message -->
                <span style="font-family: 'Crimson Pro', serif; font-size: 15px; flex: 1;">
                    {{ toast.message }}
                </span>

                <!-- Bouton fermer -->
                <button @click="uiStore.removeToast(toast.id)"
                    style="background: none; border: none; cursor: pointer; opacity: 0.6; font-size: 16px;">
                    <i class="mdi mdi-close"></i>
                </button>

            </div>
        </transition-group>

    </div>
</template>

<script setup>
import { useUiStore } from '@/stores/ui.store'

const uiStore = useUiStore()

// Couleurs selon le type de toast
function toastStyle(type) {
    if (type === 'success') return 'background: #2a5a1a; color: #F2E8D0;'
    if (type === 'error') return 'background: var(--red); color: #F2E8D0;'
    return 'background: var(--ink3); color: var(--parch);' // info
}

// Icône selon le type
function toastIcon(type) {
    if (type === 'success') return 'mdi mdi-check-circle'
    if (type === 'error') return 'mdi mdi-alert-circle'
    return 'mdi mdi-information'
}
</script>

<style scoped>
/* Animation d'entrée/sortie des toasts */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translateY(-20px);
}

.toast-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}
</style>