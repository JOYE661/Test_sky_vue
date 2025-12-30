export const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('https')) {
    return url
  }
  // 如果是相对路径或文件名，假设是后端存储的文件名，拼接 common/download 接口
  // 注意：这里利用 Nginx 代理，/api/common/download -> 后端 /admin/common/download
  return `/api/common/download?name=${url}`
}
