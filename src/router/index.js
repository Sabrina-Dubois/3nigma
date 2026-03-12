import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { supabase } from '@/lib/supabase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ── AUTH ──
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/ForgotPasswordView.vue'),
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/ResetPasswordView.vue'),
    },

    // ── APP ──
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/escapes',
      name: 'escapes',
      component: () => import('@/views/EscapesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/escape/:id',
      name: 'escape-detail',
      component: () => import('@/views/EscapeDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/escape/:id/day/:n',
      name: 'enigma',
      component: () => import('@/views/EnigmaView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/escape/:id/day/:n/success',
      name: 'success',
      component: () => import('@/views/SuccessView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: () => import('@/views/LeaderboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/premium',
      name: 'premium',
      component: () => import('@/views/PremiumView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('@/views/HelpView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('@/views/TermsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/views/PrivacyView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/not-found',
      name: 'notFound',
      component: () => import('@/views/NotFoundView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'notFound' },
    },
  ],
})

// ── GUARD AUTH ──
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Si la route nécessite d'être connecté et qu'on ne l'est pas
  // on redirige vers /login en gardant la route demandée en paramètre
  if (to.meta.requiresAuth) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      authStore.user = null
      authStore.profile = null
      return { name: 'login', query: { redirect: to.fullPath } }
    }
    if (!authStore.user) {
      authStore.user = session.user
    }
  }
})

export default router
