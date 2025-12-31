import request from '@/utils/request'

export const getShopStatus = () => {
  return request({
    url: '/user/shop/status',
    method: 'get'
  })
}
