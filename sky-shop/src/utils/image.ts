export const getImageUrl = (url: string) => {
  if (!url) return ''
  
  // 核心逻辑：无论后端返回什么垃圾路径，只要它是通过 common/download 接口下的
  // 我们就强行提取 name 参数，并重定向到我们的 /api 代理
  if (typeof url === 'string' && url.includes('/common/download')) {
      const urlObj = new URL(url.startsWith('http') ? url : `http://mock.com${url}`)
      const name = urlObj.searchParams.get('name')
      if (name) {
          return `/api/common/download?name=${name}`
      }
  }
  
  // 如果是普通 URL 且不包含 download 接口，则按原样返回
  if (url.startsWith('http')) {
      return url
  }

  // 如果只是一个文件名
  return `/api/common/download?name=${url}`
}