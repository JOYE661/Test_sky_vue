import request from '@/utils/request'

export const login = (data: { code: string }) => {
  return request({
    url: '/user/user/login',
    method: 'post',
    data
  })
}
