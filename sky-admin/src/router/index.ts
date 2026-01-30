import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { hidden: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: 'route.dashboard', icon: 'Odometer' }
      }
    ]
  },
  {
    path: '/statistics',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Statistics',
        component: () => import('@/views/statistics/index.vue'),
        meta: { title: 'route.statistics', icon: 'PieChart' }
      }
    ]
  },
  {
    path: '/order',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Order',
        component: () => import('@/views/order/index.vue'),
        meta: { title: 'route.order', icon: 'Tickets' }
      },
      {
        path: 'detail',
        name: 'OrderDetail',
        component: () => import('@/views/order/detail.vue'),
        meta: { title: '订单详情', hidden: true }
      }
    ]
  },
  {
    path: '/inventory',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Inventory',
        component: () => import('@/views/inventory/index.vue'),
        meta: { title: 'route.setmeal', icon: 'Box' }
      },
      {
        path: 'add',
        name: 'AddInventory',
        component: () => import('@/views/inventory/add.vue'),
        meta: { title: 'route.addInventory', hidden: true }
      }
    ]
  },
  {
    path: '/product',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Product',
        component: () => import('@/views/product/index.vue'),
        meta: { title: 'route.dish', icon: 'Food' }
      },
      {
        path: 'add',
        name: 'AddProduct',
        component: () => import('@/views/product/add.vue'),
        meta: { title: 'route.addProduct', hidden: true }
      }
    ]
  },
  {
    path: '/category',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Category',
        component: () => import('@/views/category/index.vue'),
        meta: { title: 'route.category', icon: 'Menu' }
      }
    ]
  },
  {
    path: '/employee',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Employee',
        component: () => import('@/views/employee/index.vue'),
        meta: { title: 'route.employee', icon: 'User' }
      },
      {
        path: 'add',
        name: 'AddEmployee',
        component: () => import('@/views/employee/add.vue'),
        meta: { title: '添加员工', hidden: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
