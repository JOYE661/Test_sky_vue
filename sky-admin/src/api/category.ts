import request from '@/utils/request'

export const getCategoryPage = (params: any) => {
  return request({
    url: '/category/page',
    method: 'get',
    params
  })
}

export const deleCategory = (id: string) => {
  return request({
    url: '/category',
    method: 'delete',
    params: { id }
  })
}

export const editCategory = (data: any) => {
  return request({
    url: '/category',
    method: 'put',
    data
  })
}

export const addCategory = (data: any) => {
  return request({
    url: '/category',
    method: 'post',
    data
  })
}

export const enableOrDisableCategory = (params: any) => {
  return request({
    url: `/category/status/${params.status}`,
    method: 'post',
    params: { id: params.id }
  })
}

export const queryCategoryByType = (params: any) => {
  return request({
    url: '/category/list',
    method: 'get',
    params
  })
}
