import request from '@/utils/request'

// 获取分类列表 (type: 1菜品分类 2套餐分类，如果不传则查所有)
export const getCategoryList = (type?: number) => {
  return request({
    url: '/user/category/list',
    method: 'get',
    params: { type }
  })
}
