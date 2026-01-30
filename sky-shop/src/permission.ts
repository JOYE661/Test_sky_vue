import router from './router'

// 无需登录即可访问的页面
const whiteList = ['/', '/products', '/login']

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')

  // 产品详情路径需要前缀匹配单独允许
  const isPublic = whiteList.includes(to.path) || to.path.startsWith('/product/')

  if (token) {
    // 已登录访问登录页 -> 跳首页
    if (to.path === '/login') {
      next('/')
      return
    }
    next()
  } else {
    if (isPublic) {
      next()
    } else {
      next({ path: '/login', query: { redirect: to.fullPath } })
    }
  }
})
