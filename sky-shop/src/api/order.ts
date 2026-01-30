import request from '@/utils/request'

// 提交订单
export const submitOrder = (data: any) => {
  return request({
    url: '/user/order/submit',
    method: 'post',
    data
  })
}

// 订单支付 (模拟)
export const payOrder = (data: any) => {
  return request({
    url: '/user/order/payment',
    method: 'put',
    data
  })
}

// 历史订单
export const getHistoryOrders = (params: { page: number, pageSize: number, status?: number }) => {
  return request({
    url: '/user/order/historyOrders',
    method: 'get',
    params
  })
}

// 获取订单详情
export const getOrderDetail = (id: string) => {
  return request({
    url: `/user/order/orderDetail/${id}`,
    method: 'get'
  })
}

// 取消订单
export const cancelOrder = (id: string) => {
  return request({
    url: `/user/order/cancel/${id}`,
    method: 'put'
  })
}

// 再来一单 (本质是把旧订单商品重新加购)
export const repetitionOrder = (id: string) => {
  return request({
    url: `/user/order/repetition/${id}`,
    method: 'post'
  })
}