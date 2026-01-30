/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#409EFF', // 复用我们管理后台的主题色
        secondary: '#67C23A',
        dark: '#303133'
      }
    },
  },
  plugins: [],
}
