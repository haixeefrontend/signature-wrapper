import ElementPlus from 'element-plus'
import { zhCn } from 'element-plus/es/locale/index.mjs'
import { createApp } from 'vue'

// import 'virtual:uno.css'
import 'element-plus/theme-chalk/index.css'
import '../dist/signature-wrapper.css'

import src from '../src'

import App from './App.vue'

createApp(App)
  .use(ElementPlus, { locale: zhCn })
  .use(src)
  .mount('#app')
