import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import router from '@/router'

const service = axios.create({
  baseURL: '/api', // Vite 代理转发
  timeout: 50000
})

// Request interceptor
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers['token'] = userStore.token
    }
    return config
  },
  (error) => {
    console.log(error)
    return Promise.reject(error)
  }
)

// Response interceptor
service.interceptors.response.use(
  (response) => {
    // 如果是下载文件 (blob)，直接返回 data
    if (response.config.responseType === 'blob' || response.data instanceof Blob) {
        return response.data
    }

    const res = response.data

    // 假设后端 code === 1 为成功，与原项目保持一致
    if (res.code === 1) {
      return res.data // 返回 data 部分，与 sky-client 风格一致，方便调用
    } else {
      ElMessage.error(res.msg || '系统错误')
      
      // 401: 未登录
      if (res.code === 0 && res.msg === 'NOTLOGIN') {
        const userStore = useUserStore()
        userStore.removeToken()
        router.push('/login')
      }
      return Promise.reject(new Error(res.msg || 'Error'))
    }
  },
  (error) => {
    console.log('err' + error)
    let msg = error.message || '请求失败'
    if (error.response && error.response.status === 401) {
        msg = '登录已过期，请重新登录'
        const userStore = useUserStore()
        userStore.removeToken()
        router.push('/login')
    }
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export default service
