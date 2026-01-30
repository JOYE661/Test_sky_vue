import request from '@/utils/request'

export const login = (data: any) =>
  request({
    url: '/employee/login',
    method: 'post',
    data
  })

export const logout = () =>
  request({
    url: '/employee/logout',
    method: 'post'
  })

export const getEmployeeList = (params: any) => {
  return request({
    url: '/employee/page',
    method: 'get',
    params
  })
}

export const enableOrDisableEmployee = (params: any) => {
  return request({
    url: `/employee/status/${params.status}`,
    method: 'post',
    params: { id: params.id }
  })
}

export const addEmployee = (data: any) => {
  return request({
    url: '/employee',
    method: 'post',
    data
  })
}

export const editEmployee = (data: any) => {
  return request({
    url: '/employee',
    method: 'put',
    data
  })
}

export const queryEmployeeById = (id: string) => {
  return request({
    url: `/employee/${id}`,
    method: 'get'
  })
}

// 修改密码
export const editPassword = (data: any) => {
  return request({
    url: '/employee/editPassword',
    method: 'put',
    data
  })
}
