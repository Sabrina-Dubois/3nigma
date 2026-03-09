import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // ── STATE ──
  const isLoading = ref(false) // loader global pendant l'init de l'app
  const toasts = ref([]) // liste des notifications temporaires

  // ── ACTIONS ──

  // Affiche un toast temporaire
  // type : 'success' | 'error' | 'info'
  function showToast(message, type = 'info', duration = 3000) {
    const id = Date.now() // identifiant unique basé sur le timestamp

    // on ajoute le toast à la liste
    toasts.value.push({ id, message, type })

    // on le supprime automatiquement après `duration` millisecondes
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  // Supprime un toast par son id
  function removeToast(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    isLoading,
    toasts,
    showToast,
    removeToast,
  }

  // pas de persist: true ici — les toasts ne doivent pas survivre au refresh
})
