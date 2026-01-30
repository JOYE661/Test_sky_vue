import request from '@/utils/request'

// 订单分页查询
export const getOrderPage = (params: any) => {
  return request({
    url: '/order/conditionSearch',
    method: 'get',
    params
  })
}

// 订单详情
export const queryOrderById = (id: string) => {
  return request({
    url: `/order/details/${id}`,
    method: 'get'
  })
}

// 接单 (确认发货准备)
export const confirmOrder = (data: any) => {
  return request({
    url: '/order/confirm',
    method: 'put',
    data
  })
}

// 拒单 (缺货/异常)
export const rejectOrder = (data: any) => {
  return request({
    url: '/order/rejection',
    method: 'put',
    data
  })
}

// 派送 (发货/发车)
export const deliveryOrder = (id: string) => {
  return request({
    url: `/order/delivery/${id}`,
    method: 'put'
  })
}

// 完成 (签收)
export const completeOrder = (id: string) => {
  return request({
    url: `/order/complete/${id}`,
    method: 'put'
  })
}

// 取消订单
export const cancelOrder = (data: any) => {
  return request({
    url: '/order/cancel',
    method: 'put',
    data
  })
}

// 各个状态的订单数量统计
export const getOrderStatistics = () => {
  return request({
    url: '/order/statistics',
    method: 'get'
  })
}
