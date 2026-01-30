import request from '@/utils/request'

// 根据分类ID获取品牌(套餐)列表，可选关键词
export const getSetmealList = (categoryId?: number, name?: string) => {
  return request({
    url: '/user/setmeal/list',
    method: 'get',
    params: { categoryId, name }
  })
}
