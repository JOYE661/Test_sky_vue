export const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('https')) {
    return url
  }
  return `/api/common/download?name=${url}`
}
