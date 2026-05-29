import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/picker',
    name: 'picker',
    component: () => import('@/views/PickerView.vue'),
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('@/views/MapView.vue'),
  },
  {
    path: '/person/:id',
    name: 'person',
    component: () => import('@/views/PersonDetailView.vue'),
  },
  {
    path: '/info',
    name: 'info',
    component: () => import('@/views/InfoView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/admin',
    component: () => import('@/views/AdminDashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/people/new',
    component: () => import('@/views/AdminPersonNew.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/people/:id/edit',
    component: () => import('@/views/AdminPersonEdit.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const { useAuthStore } = await import('@/stores/auth')
    const auth = useAuthStore()
    if (!auth.isLoggedIn) {
      next('/login')
    } else if (!auth.isAdmin) {
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
