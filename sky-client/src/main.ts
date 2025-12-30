import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
// Vant styles are automatically imported by the resolver for components used in templates.
// For function calls (Toast, Dialog), we might need to import their styles or rely on unplugin-vue-components configuration.
// Importing base index.css is a safe fallback for some global styles if needed, but let's try pure auto-import first.
import 'vant/lib/index.css' 

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')