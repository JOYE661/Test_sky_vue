import request from '@/utils/request'

export const commonUpload = (data: any) => {
  return request({
    url: '/common/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
