import request from '@/utils/request'

// 获取地址列表
export const listAddress = () => {
  return request({
    url: '/user/addressBook/list',
    method: 'get'
  })
}

// 获取默认地址
export const getDefaultAddress = () => {
  return request({
    url: '/user/addressBook/default',
    method: 'get'
  })
}

// 新增地址
export const addAddress = (data: any) => {
  return request({
    url: '/user/addressBook',
    method: 'post',
    data
  })
}

// 修改地址
export const updateAddress = (data: any) => {
  return request({
    url: '/user/addressBook',
    method: 'put',
    data
  })
}

// 删除地址
export const deleteAddress = (id: number) => {
  return request({
    url: '/user/addressBook',
    method: 'delete',
    params: { id }
  })
}

// 设置默认地址
export const setDefaultAddress = (id: any) => {
  return request({
    url: '/user/addressBook/default',
    method: 'put',
    data: { id }
  })
}

// 根据ID查询地址
export const getAddressById = (id: number) => {
  return request({
    url: `/user/addressBook/${id}`,
    method: 'get'
  })
}
