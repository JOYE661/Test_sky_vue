import request from '@/utils/request'

// 根据分类ID获取菜品列表，可选关键词
export const getDishList = (categoryId?: number, name?: string) => {
  return request({
    url: '/user/dish/list',
    method: 'get',
    params: { categoryId, name }
  })
}

// 获取菜品详情；若后端未实现，可在调用侧兜底
export const getProductDetail = (id: string) => {
  return request({
    url: `/user/dish/${id}`,
    method: 'get'
  })
}
