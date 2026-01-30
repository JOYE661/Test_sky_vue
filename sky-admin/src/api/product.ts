import request from '@/utils/request'

// 分页查询产品
export const getProductPage = (params: any) => {
  return request({
    url: '/dish/page', // 后端接口还没改，暂时还是调 /dish
    method: 'get',
    params
  })
}

// 删除产品
export const deleteProduct = (ids: string) => {
  return request({
    url: '/dish',
    method: 'delete',
    params: { ids }
  })
}

// 修改产品
export const editProduct = (data: any) => {
  return request({
    url: '/dish',
    method: 'put',
    data
  })
}

// 新增产品
export const addProduct = (data: any) => {
  return request({
    url: '/dish',
    method: 'post',
    data
  })
}

// 启售/停售 (上架/下架)
export const enableOrDisableProduct = (params: any) => {
  return request({
    url: `/dish/status/${params.status}`,
    method: 'post',
    params: { id: params.id }
  })
}

// 根据ID查询详情
export const queryProductById = (id: string) => {
  return request({
    url: `/dish/${id}`,
    method: 'get'
  })
}

// 根据分类ID查询产品列表
export const queryProductList = (params: any) => {
  return request({
    url: '/dish/list',
    method: 'get',
    params
  })
}
