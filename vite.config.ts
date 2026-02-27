import { copyFileSync } from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'
import unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'

import packageJson from './package.json'
import unoConfig from './uno.config'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    dts({
      entryRoot: 'src',
      afterBuild() {
        // Publint requires a .d.cts type definition file
        // https://publint.dev/rules#export_types_invalid_format
        copyFileSync('dist/index.d.ts', 'dist/index.d.cts')
      },
    }),
    unocss({ ...unoConfig, mode: 'vue-scoped' }),
    AutoImport({
      imports: [
        'vue',
      ],
      dts: true,
      eslintrc: {
        enabled: true,
      },
    }),
  ],
  esbuild: {
    banner: `/*!
 * ${packageJson.name} v${packageJson.version}
 * (c) ${new Date().getFullYear()} Haixee Frontend Team
 */`,
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'SignatureWrapper',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        switch (format) {
          case 'es': return 'index.mjs'
          case 'cjs': return 'index.cjs'
          case 'umd': return 'index.umd.js'
          default: return 'index.js'
        }
      },
    },
    rollupOptions: {
      external: ['vue', 'element-plus'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus',
        },
      },
    },
    minify: false,
  },
})
