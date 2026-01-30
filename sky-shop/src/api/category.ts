import request from '@/utils/request'

// 获取分类列表 (type: 1菜品 2套餐)
export const getCategoryList = (type?: number) => {
  return request({
    url: '/user/category/list',
    method: 'get',
    params: { type }
  })
}
