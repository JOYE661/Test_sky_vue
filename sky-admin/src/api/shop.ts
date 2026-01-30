import request from '@/utils/request'

// 获取营业状态
export const getShopStatus = () => {
  return request({
    url: '/shop/status',
    method: 'get'
  })
}

// 设置营业状态
export const setShopStatus = (status: number) => {
  return request({
    url: `/shop/${status}`,
    method: 'put'
  })
}
