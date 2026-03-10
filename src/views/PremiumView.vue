<template>
  <div class="min-h-screen" style="background: var(--parch)">
    <TopBar />

    <main class="px-4 pt-6 pb-24 max-w-xl mx-auto">
      <!-- Header -->
      <div class="mb-6 text-center">
        <h1 class="page-title">Premium 🗝️</h1>
        <p class="page-subtitle mt-1">L’expérience complète de 3NIGMA°</p>
      </div>

      <!-- Statut -->
      <section class="card rounded p-5 mb-4">
        <div v-if="authStore.profile?.is_premium">
          <p style="font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 2px; color: var(--gold); text-transform: uppercase;">
            Statut actif
          </p>
          <p class="mt-2" style="font-family: 'Crimson Pro', serif; font-size: 16px; color: var(--ink);">
            Vous êtes membre Premium. Merci pour votre soutien.
          </p>
        </div>
        <div v-else>
          <p style="font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 2px; color: var(--sepia); text-transform: uppercase;">
            Statut gratuit
          </p>
          <p class="mt-2" style="font-family: 'Crimson Pro', serif; font-size: 16px; color: var(--ink);">
            Débloquez l’intégralité des enquêtes et des bonus.
          </p>
        </div>
      </section>

      <!-- Avantages -->
      <section class="card rounded p-5 mb-4">
        <p class="section-label mb-3">Avantages</p>

        <div class="grid gap-3">
          <div class="flex gap-3">
            <span>🗝️</span>
            <p style="font-family: 'Crimson Pro', serif; font-size: 15px; color: var(--ink);">
              Accès aux 14 enquêtes complètes
            </p>
          </div>
          <div class="flex gap-3">
            <span>⏳</span>
            <p style="font-family: 'Crimson Pro', serif; font-size: 15px; color: var(--ink);">
              2 énigmes par jour pour rattraper plus vite
            </p>
          </div>
          <div class="flex gap-3">
            <span>💡</span>
            <p style="font-family: 'Crimson Pro', serif; font-size: 15px; color: var(--ink);">
              3 indices gratuits par mois
            </p>
          </div>
          <div class="flex gap-3">
            <span>📚</span>
            <p style="font-family: 'Crimson Pro', serif; font-size: 15px; color: var(--ink);">
              Archives rejouables une fois un escape terminé
            </p>
          </div>
        </div>
      </section>

      <!-- Offre -->
      <section class="card rounded p-5">
        <p class="section-label mb-3">Offre</p>

        <div class="text-center">
          <div style="font-family: 'Cinzel', serif; font-size: 28px; font-weight: 900; color: var(--gold);">
            3,99 € / mois
          </div>
          <div class="mt-1" style="font-family: 'Crimson Pro', serif; font-size: 14px; color: var(--sepia);">
            ou 29,99 € / an
          </div>

          <button class="btn-primary btn-block mt-4" disabled>
            Paiement bientôt disponible
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth.store'
import TopBar from '@/components/TopBar.vue'

const authStore = useAuthStore()
</script>
