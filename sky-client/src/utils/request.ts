import axios from 'axios'
import { showToast } from 'vant'

const service = axios.create({
  baseURL: '/api', // Trigger Vite proxy
  timeout: 10000
})

// Request interceptor
service.interceptors.request.use(
  (config) => {
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
    // Backend standard: code === 1 is success
    if (res.code === 1) {
      return res.data
    } else {
      showToast(res.msg || 'System Error')
      return Promise.reject(new Error(res.msg || 'Error'))
    }
  },
  (error) => {
    console.error('err' + error)
    showToast(error.message || 'Request Failed')
    return Promise.reject(error)
  }
)

export default service
