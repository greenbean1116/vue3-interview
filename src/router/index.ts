import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../pages/HomePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../pages/AboutPage.vue'),
    },
    {
      path: '/table',
      name: 'table',
      component: () => import('../pages/TablePage.vue'),
    },
    {
      path: '/one',
      name: 'One',
      component: () => import('../test/one/One.vue'),
    },
    {
      path: '/two',
      name: 'Two',
      component: () => import('../test/two/Two.vue'),
    },
    {
      path: '/three',
      name: 'Three',
      component: () => import('../test/three/Three.vue'),
    },
    {
      path: '/four',
      name: 'Four',
      component: () => import('../test/four/Four.vue'),
    },
    {
      path: '/five',
      name: 'Five',
      component: () => import('../test/five/Five.vue'),
    },
    {
      path: '/six',
      name: 'Six',
      component: () => import('../test/six/Six.vue'),
    },
    {
      path: '/seven',
      name: 'Seven',
      component: () => import('../test/seven/Seven.vue'),
    },
  ],
})

export default router
