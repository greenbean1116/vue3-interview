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
    {
      path: '/eight',
      name: 'Eight',
      component: () => import('../test/eight/Eight.vue'),
    },
    {
      path: '/nine',
      name: 'Nine',
      component: () => import('../test/nine/Nine.vue'),
    },
    {
      path: '/ten',
      name: 'Ten',
      component: () => import('../test/ten/Ten.vue'),
    },
    {
      path: '/eleven',
      name: 'Eleven',
      component: () => import('../test/eleven/Eleven.vue'),
    },
    {
      path: '/eleven',
      name: 'Eleven',
      component: () => import('../test/eleven/Eleven.vue'),
    },
    {
      path: '/twelve',
      name: 'Twelve',
      component: () => import('../test/twelve/Twelve.vue'),
    },
    {
      path: '/thirteen',
      name: 'Thirteen',
      component: () => import('../test/thirteen/Thirteen.vue'),
    },
    {
      path: '/tree',
      name: 'Tree',
      component: () => import('../test/tree/Tree.vue'),
    },
  ],
})

export default router
