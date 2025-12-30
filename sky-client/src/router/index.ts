import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/index.vue')
  },
  {
    path: '/order/submit',
    name: 'OrderSubmit',
    component: () => import('@/views/order/submit.vue')
  },
  {
    path: '/address',
    name: 'AddressList',
    component: () => import('@/views/address/index.vue')
  },
  {
    path: '/address/edit',
    name: 'AddressEdit',
    component: () => import('@/views/address/edit.vue')
  },
  // 占位
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/order/list.vue')
  },
  {
    path: '/me',
    name: 'Me',
    component: () => import('@/views/user/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router