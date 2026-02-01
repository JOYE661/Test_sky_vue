import router from './router'
import { useUserStore } from './store/modules/user'
import nProgress from 'nprogress'
import 'nprogress/nprogress.css'

const whiteList = ['/login']

router.beforeEach((to, _from, next) => {
  nProgress.start()
  
  const userStore = useUserStore()
  
  if (userStore.token) {
    if (to.path === '/login') {
      next({ path: '/' })
      nProgress.done()
    } else {
      next()
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next('/login')
      nProgress.done()
    }
  }
})

router.afterEach(() => {
  nProgress.done()
})
