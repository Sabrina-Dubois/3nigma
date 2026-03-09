import { createI18n } from 'vue-i18n'
import fr from './locales/fr.json'
import en from './locales/en.json'

const i18n = createI18n({
  legacy: false, // utilise la Composition API (Vue 3)
  locale: 'fr', // langue par défaut
  fallbackLocale: 'en', // si une clé manque en FR, on prend l'EN
  messages: {
    fr,
    en,
  },
})

export default i18n
