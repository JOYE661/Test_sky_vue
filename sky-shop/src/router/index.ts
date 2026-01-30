import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home/index.vue'
// Lazy pages are kept as dynamic imports to optimize bundle size

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/products',
      name: 'Products',
      component: () => import('../views/product/index.vue')
    },
    {
      path: '/product/:id',
      name: 'ProductDetail',
      component: () => import('../views/product/detail.vue')
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/login/index.vue')
    },
    {
      path: '/cart',
      name: 'Cart',
      component: () => import('../views/cart/index.vue') // 还没写
    },
    {
      path: '/order',
      name: 'OrderList',
      component: () => import('../views/order/index.vue')
    },
    {
      path: '/order/detail/:id',
      name: 'OrderDetail',
      component: () => import('../views/order/detail.vue')
    },
    {
      path: '/order/create',
      name: 'OrderCreate',
      component: () => import('../views/order/create.vue')
    },
    {
      path: '/address',
      name: 'Address',
      component: () => import('../views/address/index.vue')
    },
    {
      path: '/user',
      name: 'User',
      component: () => import('../views/user/index.vue')
    }
  ]
})

export default router
