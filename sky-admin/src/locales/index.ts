import { createI18n } from 'vue-i18n'
import zhCn from './zh-cn'
import en from './en'

// 获取浏览器语言或缓存
const getLanguage = () => {
  const cached = localStorage.getItem('language')
  if (cached) return cached
  const language = navigator.language.toLowerCase()
  if (language.indexOf('en') > -1) return 'en'
  return 'zh-cn'
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API
  locale: getLanguage(),
  fallbackLocale: 'zh-cn',
  messages: {
    'zh-cn': zhCn,
    en: en
  }
})

export default i18n
