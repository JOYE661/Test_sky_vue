import request from '@/utils/request'

// 提交订单
export const submitOrder = (data: any) => {
  return request({
    url: '/user/order/submit',
    method: 'post',
    data
  })
}

// 订单支付
export const payOrder = (data: any) => {
  return request({
    url: '/user/order/payment',
    method: 'put',
    data
  })
}

// 历史订单
export const historyOrders = (params: any) => {
  return request({
    url: '/user/order/historyOrders',
    method: 'get',
    params
  })
}

// 订单详情
export const orderDetail = (id: number) => {
  return request({
    url: `/user/order/orderDetail/${id}`,
    method: 'get'
  })
}

// 取消订单
export const cancelOrder = (id: number) => {
  return request({
    url: `/user/order/cancel/${id}`,
    method: 'put'
  })
}
