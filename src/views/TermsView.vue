<template>
  <div class="terms-page parch-bg">
    <TopBar />

    <!-- Header -->
    <div class="page-header">
      <div class="page-title">{{ t('terms.title') }}</div>
      <div class="last-updated">Mis à jour en mars 2026</div>
    </div>

    <div class="page-actions">
      <button class="btn-ghost" @click="router.back()">← Retour</button>
    </div>

    <!-- Navigation rapide -->
    <div class="quick-nav">
      <div class="nav-pills">
        <a v-for="(section, i) in sections" :key="i" :href="`#section-${i}`" class="nav-pill">
          {{ section.short }}
        </a>
      </div>
    </div>

    <!-- Contenu -->
    <div class="card-wrapper">
      <div class="content-card card double-frame">
        <div class="card-content">
          <div :id="'section-0'" class="section-block">
            <div class="section-header">
              <span class="section-number">01</span>
              <h2 class="section-title">{{ t('terms.intro.title') }}</h2>
            </div>
            <p class="section-text">{{ t('terms.intro.content') }}</p>
          </div>

          <div class="divider"></div>

          <div :id="'section-1'" class="section-block">
            <div class="section-header">
              <span class="section-number">02</span>
              <h2 class="section-title">{{ t('terms.account.title') }}</h2>
            </div>
            <p class="section-text">{{ t('terms.account.content') }}</p>
          </div>

          <div class="divider"></div>

          <div :id="'section-2'" class="section-block">
            <div class="section-header">
              <span class="section-number">03</span>
              <h2 class="section-title">{{ t('terms.usage.title') }}</h2>
            </div>
            <p class="section-text">{{ t('terms.usage.content') }}</p>
          </div>

          <div class="divider"></div>

          <div :id="'section-3'" class="section-block">
            <div class="section-header">
              <span class="section-number">04</span>
              <h2 class="section-title">{{ t('terms.forbidden.title') }}</h2>
            </div>
            <p class="section-text">{{ t('terms.forbidden.content') }}</p>
          </div>

          <div class="divider"></div>

          <div :id="'section-4'" class="section-block">
            <div class="section-header">
              <span class="section-number">05</span>
              <h2 class="section-title">{{ t('terms.ip.title') }}</h2>
            </div>
            <p class="section-text">{{ t('terms.ip.content') }}</p>
          </div>

          <div class="divider"></div>

          <!-- Section RGPD -->
          <div :id="'section-5'" class="section-block highlight-block">
            <div class="section-header">
              <span class="section-number">06</span>
              <h2 class="section-title">{{ t('terms.data.title') }}</h2>
            </div>
            <p class="section-text">{{ t('terms.data.content') }}</p>
            <div class="info-box">
              <span class="info-icon">🛡️</span>
              <span>
                {{ t('terms.data.content1') }}
                <router-link to="/privacy" class="link-inline">{{ t('terms.data.content2') }}</router-link>
                {{ t('terms.data.content3') }}
              </span>
            </div>
            <p class="section-text">{{ t('terms.data.content4') }}</p>
            <a href="mailto:support@3nigma.app" class="email-link">
              support@3nigma.app
            </a>
          </div>

          <div class="divider"></div>

          <div :id="'section-6'" class="section-block">
            <div class="section-header">
              <span class="section-number">07</span>
              <h2 class="section-title">{{ t('terms.liability.title') }}</h2>
            </div>
            <p class="section-text">{{ t('terms.liability.content') }}</p>
          </div>

          <div class="divider"></div>

          <div :id="'section-7'" class="section-block">
            <div class="section-header">
              <span class="section-number">08</span>
              <h2 class="section-title">{{ t('terms.termination.title') }}</h2>
            </div>
            <p class="section-text">{{ t('terms.termination.content') }}</p>
          </div>

          <div class="divider"></div>

          <div :id="'section-8'" class="section-block">
            <div class="section-header">
              <span class="section-number">09</span>
              <h2 class="section-title">{{ t('terms.changes.title') }}</h2>
            </div>
            <p class="section-text">{{ t('terms.changes.content') }}</p>
          </div>

          <div class="divider"></div>

          <div :id="'section-9'" class="section-block">
            <div class="section-header">
              <span class="section-number">10</span>
              <h2 class="section-title">{{ t('terms.law.title') }}</h2>
            </div>
            <p class="section-text">{{ t('terms.law.content') }}</p>
          </div>

          <div class="divider"></div>

          <!-- Contact -->
          <div :id="'section-10'" class="section-block contact-block">
            <div class="section-header">
              <span class="section-number">11</span>
              <h2 class="section-title">{{ t('terms.contact.title') }}</h2>
            </div>
            <p class="section-text">{{ t('terms.contact.content') }}</p>
            <a href="mailto:support@3nigma.app" class="email-link">
              support@3nigma.app
            </a>
          </div>
        </div>
      </div>
    </div>

    <footer class="page-footer">
      <button class="btn-secondary" @click="router.push('/help')">Aide</button>
      <button class="btn-secondary" @click="router.push('/terms')">Conditions</button>
      <button class="btn-secondary" @click="router.push('/privacy')">Confidentialité</button>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import TopBar from '@/components/TopBar.vue'

const { t } = useI18n()
const router = useRouter()

const sections = computed(() => [
  { short: t('terms.nav.intro') },
  { short: t('terms.nav.account') },
  { short: t('terms.nav.usage') },
  { short: t('terms.nav.forbidden') },
  { short: t('terms.nav.ip') },
  { short: t('terms.nav.data') },
  { short: t('terms.nav.liability') },
  { short: t('terms.nav.termination') },
  { short: t('terms.nav.changes') },
  { short: t('terms.nav.law') },
  { short: t('terms.nav.contact') },
])
</script>

<style scoped>
.terms-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  min-height: 100vh;
  padding-bottom: 80px;
}

.page-header {
  text-align: center;
  padding: 16px 0 8px;
  width: 100%;
  max-width: 560px;
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

.quick-nav {
  width: 100%;
  max-width: 560px;
  margin-bottom: 16px;
}

.nav-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.nav-pill {
  font-size: 11px;
  font-weight: 700;
  color: var(--ink3);
  background: var(--parch2);
  border: 1px solid var(--border);
  padding: 4px 10px;
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: 'Cinzel', serif;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.nav-pill:hover {
  background: var(--ink3);
  color: var(--parch);
}

.card-wrapper {
  width: 100%;
  max-width: 560px;
}

.content-card {
  border-radius: 16px;
}

.card-content {
  padding: 8px 4px;
}

.section-block {
  padding: 20px;
  scroll-margin-top: 80px;
  transition: background 0.2s;
}

.section-block:hover {
  background: rgba(255, 255, 255, 0.4);
  border-radius: 12px;
}

.highlight-block {
  background: rgba(200, 144, 10, 0.08);
  border-radius: 12px;
  border-left: 3px solid var(--gold);
}

.contact-block {
  background: rgba(200, 144, 10, 0.06);
  border-radius: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.section-number {
  font-size: 11px;
  font-weight: 800;
  color: var(--ink3);
  background: var(--parch2);
  padding: 3px 8px;
  border-radius: 6px;
  flex-shrink: 0;
  letter-spacing: 0.5px;
  font-family: 'Cinzel', serif;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
  line-height: 1.3;
  font-family: 'Cinzel', serif;
}

.section-text {
  font-size: 14px;
  color: var(--ink2);
  line-height: 1.7;
  margin: 0 0 10px 0;
  font-family: 'Crimson Pro', serif;
}

.info-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: rgba(200, 144, 10, 0.15);
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 13px;
  color: var(--ink3);
  margin: 4px 0;
  line-height: 1.5;
  font-family: 'Crimson Pro', serif;
}

.info-icon {
  font-size: 16px;
}

.link-inline {
  color: var(--gold);
  font-weight: 700;
  text-decoration: underline;
}

.email-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--gold);
  font-weight: 700;
  font-size: 13px;
  text-decoration: none;
  background: rgba(200, 144, 10, 0.12);
  padding: 8px 14px;
  border-radius: 20px;
  margin-top: 6px;
  transition: all 0.2s;
  font-family: 'Cinzel', serif;
  letter-spacing: 1px;
}

.email-link:hover {
  background: var(--gold);
  color: var(--parch);
}

.divider {
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(30, 14, 4, 0.2), transparent);
  margin: 0 20px;
}

.page-footer {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

</style>
