import request from '@/utils/request'

// 添加购物车
export const addCart = (data: any) => {
  return request({
    url: '/user/shoppingCart/add',
    method: 'post',
    data
  })
}

// 查看购物车
export const listCart = () => {
  return request({
    url: '/user/shoppingCart/list',
    method: 'get'
  })
}

// 清空购物车
export const cleanCart = () => {
  return request({
    url: '/user/shoppingCart/clean',
    method: 'delete'
  })
}

// 减少购物车商品
export const subCart = (data: any) => {
  return request({
    url: '/user/shoppingCart/sub',
    method: 'post',
    data
  })
}
