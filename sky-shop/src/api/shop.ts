import request from '@/utils/request'

// 查询店铺营业状态：1 营业中，0 休息
export const getShopStatus = () => {
  return request({
    url: '/user/shop/status',
    method: 'get'
  })
}
