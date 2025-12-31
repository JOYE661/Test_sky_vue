import request from '@/utils/request'

// 根据分类ID获取套餐列表
export const getSetmealList = (categoryId: number) => {
  return request({
    url: '/user/setmeal/list',
    method: 'get',
    params: { categoryId }
  })
}
