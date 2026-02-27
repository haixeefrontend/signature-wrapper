import ElementPlus from 'element-plus'
import { App } from 'vue'

import SignatureWrapper from './signature-wrapper.vue'

export { SignatureWrapper }

export function install(app: App) {
  // Check if Element Plus is installed
  if (!app._context.components.ElButton) {
    app.use(ElementPlus)
  }
  app.component('SignatureWrapper', SignatureWrapper)
}

export default install
