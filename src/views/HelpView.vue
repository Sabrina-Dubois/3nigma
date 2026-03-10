<template>
  <div class="help-page parch-bg">
    <TopBar />

    <div class="page-header">
      <div class="page-title">{{ t('help.title') }}</div>
      <div class="last-updated">Mis à jour en mars 2026</div>
    </div>

    <div class="page-actions">
      <button class="btn-ghost" @click="router.back()">← Retour</button>
    </div>

    <section class="card double-frame micro-card mb-6">
      <h2 class="section-title">{{ t('help.search.title') }}</h2>
      <input
        v-model="searchQuery"
        :placeholder="t('help.search.placeholder')"
        class="search-field"
        type="text"
      />
    </section>

    <section class="card double-frame micro-card mb-6">
      <h2 class="section-title">{{ t('help.faq_title') }}</h2>

      <div v-if="filteredFaqs.length" class="faq-list">
        <details v-for="(faq, index) in filteredFaqs" :key="index" class="faq-item">
          <summary class="faq-question">{{ faq.question }}</summary>
          <div class="faq-answer">{{ faq.answer }}</div>
        </details>
      </div>

      <div v-else class="no-results">
        <div class="no-results-icon">❓</div>
        <div>{{ searchQuery ? 'Aucun résultat' : 'Chargement...' }}</div>
      </div>
    </section>

    <section class="card double-frame micro-card">
      <h2 class="section-title">{{ t('help.support.title') }}</h2>
      <p class="support-subtitle">{{ t('help.support.subtitle') }}</p>
      <button class="email-button" @click="copyEmail">
        support@3nigma.app
      </button>
    </section>

    <footer class="page-footer">
      <button class="footer-link" @click="router.push('/help')">Aide</button>
      <button class="footer-link" @click="router.push('/terms')">Conditions</button>
      <button class="footer-link" @click="router.push('/privacy')">Confidentialité</button>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import TopBar from '@/components/TopBar.vue'

const { t, tm } = useI18n()
const router = useRouter()

const searchQuery = ref('')

const faqs = computed(() => {
  const rawFaqs = tm('help.faqs')
  return Array.isArray(rawFaqs) ? rawFaqs : []
})

const filteredFaqs = computed(() => {
  if (!searchQuery.value?.trim()) return faqs.value.slice(0, 30)
  const q = searchQuery.value.toLowerCase()
  return faqs.value.filter(
    (f) =>
      f.question?.toLowerCase().includes(q) ||
      f.answer?.toLowerCase().includes(q),
  )
})

function copyEmail() {
  navigator.clipboard.writeText('support@3nigma.app')
}
</script>

<style scoped>
.help-page {
  padding: 12px;
  min-height: 100vh;
  padding-bottom: 80px;
  max-width: 560px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  padding: 16px 0 8px;
}

.last-updated {
  font-size: 12px;
  color: var(--sepia);
  margin-top: 4px;
  font-family: 'Crimson Pro', serif;
}

.page-actions {
  display: flex;
  justify-content: center;
  margin: 6px 0 16px;
}

.micro-card {
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow);
}

.section-title {
  font-family: 'Cinzel', serif;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 2px;
  color: var(--ink);
  margin: 0 0 12px;
}

.search-field {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--parch2);
  font-family: 'Crimson Pro', serif;
  font-size: 15px;
  color: var(--ink);
  outline: none;
}

.search-field:focus {
  border-color: var(--gold);
}

.faq-list {
  display: grid;
  gap: 10px;
}

.faq-item {
  background: var(--parch2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
}

.faq-question {
  cursor: pointer;
  font-family: 'Cinzel', serif;
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--ink);
}

.faq-answer {
  margin-top: 8px;
  font-family: 'Crimson Pro', serif;
  font-size: 15px;
  color: var(--ink2);
  line-height: 1.6;
}

.no-results {
  text-align: center;
  padding: 20px 10px;
  color: var(--sepia);
  font-family: 'Crimson Pro', serif;
}

.no-results-icon {
  font-size: 36px;
  margin-bottom: 6px;
}

.support-subtitle {
  font-family: 'Crimson Pro', serif;
  font-size: 14px;
  color: var(--sepia);
  margin: 0 0 12px;
}

.email-button {
  width: 100%;
  padding: 12px;
  border-radius: 999px;
  border: 1px solid var(--gold);
  background: rgba(200, 144, 10, 0.12);
  color: var(--gold);
  font-family: 'Cinzel', serif;
  font-size: 12px;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
}

.email-button:hover {
  background: var(--gold);
  color: var(--parch);
}

.page-footer {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.footer-link {
  background: var(--parch2);
  border: 1px solid var(--border);
  color: var(--ink3);
  padding: 8px 12px;
  border-radius: 999px;
  font-family: 'Cinzel', serif;
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
}

.footer-link:hover {
  background: var(--ink3);
  color: var(--parch);
}
</style>
