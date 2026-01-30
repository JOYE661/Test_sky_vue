import request from '@/utils/request'

// 分页查询库存单据 (复用套餐分页)
export const getInventoryPage = (params: any) => {
  return request({
    url: '/setmeal/page',
    method: 'get',
    params
  })
}

// 删除单据
export const deleteInventory = (ids: string) => {
  return request({
    url: '/setmeal',
    method: 'delete',
    params: { ids }
  })
}

// 修改单据
export const editInventory = (data: any) => {
  return request({
    url: '/setmeal',
    method: 'put',
    data
  })
}

// 新增单据
export const addInventory = (data: any) => {
  return request({
    url: '/setmeal',
    method: 'post',
    data
  })
}

// 审核/反审核 (复用起售/停售)
// status: 1=已审核(生效), 0=草稿(失效)
export const auditInventory = (params: any) => {
  return request({
    url: `/setmeal/status/${params.status}`,
    method: 'post',
    params: { id: params.id }
  })
}

// 根据ID查询详情
export const queryInventoryById = (id: string) => {
  return request({
    url: `/setmeal/${id}`,
    method: 'get'
  })
}

// 根据分类ID查询 (预留)
export const queryInventoryList = (params: any) => {
  return request({
    url: '/setmeal/list',
    method: 'get',
    params
  })
}
