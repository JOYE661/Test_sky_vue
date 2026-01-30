import request from '@/utils/request'

// 营业额统计 (销售额)
export const getTurnoverStatistics = (params: any) => {
  return request({
    url: '/report/turnoverStatistics',
    method: 'get',
    params
  })
}

// 用户统计 (客户数)
export const getUserStatistics = (params: any) => {
  return request({
    url: '/report/userStatistics',
    method: 'get',
    params
  })
}

// 订单统计 (单量)
export const getOrderStatistics = (params: any) => {
  return request({
    url: '/report/ordersStatistics',
    method: 'get',
    params
  })
}

// 销量排名 (热销商品)
export const getTop10 = (params: any) => {
  return request({
    url: '/report/top10',
    method: 'get',
    params
  })
}

// 导出报表
export const exportReport = () => {
  return request({
    url: '/report/export',
    method: 'get',
    responseType: 'blob'
  })
}

// 获取今日/昨日经营数据 (工作台概览)
export const getBusinessData = () => {
  return request({
    url: '/workspace/businessData',
    method: 'get'
  })
}

// 获取订单概览 (待接单、待派送等数量)
export const getOrderOverview = () => {
  return request({
    url: '/workspace/overviewOrders',
    method: 'get'
  })
}

// 获取套餐(品牌)总览
export const getSetmealOverview = () => {
  return request({
    url: '/workspace/overviewSetmeals',
    method: 'get'
  })
}

// 获取菜品(产品)总览
export const getDishOverview = () => {
  return request({
    url: '/workspace/overviewDishes',
    method: 'get'
  })
}