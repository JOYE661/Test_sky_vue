import request from '@/utils/request'

// 根据分类ID获取菜品列表
export const getDishList = (categoryId: number) => {
  return request({
    url: '/user/dish/list',
    method: 'get',
    params: { categoryId }
  })
}
