import { createRouter, createWebHistory } from 'vue-router'

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

    // ── APP ──
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
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
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// ── GUARD AUTH ──
router.beforeEach((to) => {
  const isLoggedIn = false // à remplacer par le vrai store auth plus tard
  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'login' }
  }
})

export default router
