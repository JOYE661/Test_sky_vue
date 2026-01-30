import axios from 'axios'

const service = axios.create({
  baseURL: '/api', // Vite 代理
  timeout: 10000
})

// Request interceptor
service.interceptors.request.use(
  (config) => {
    // 假设 Token 存在 localStorage 'token' 中
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['authentication'] = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 假设后端 code === 1 为成功
    if (res.code === 1) {
      return res.data
    } else {
      console.error(res.msg || 'Error')
      return Promise.reject(new Error(res.msg || 'Error'))
    }
  },
  (error) => {
    console.error('err' + error)
    return Promise.reject(error)
  }
)

export default service
