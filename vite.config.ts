import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  //plugins: [vue()],
  build: {
    outDir: './lib',
    lib: {
      entry: path.resolve('src/index.ts'),
      name: 'Stripe UI',
      fileName: (format) => `stripe-ui.${ format }.js`,
      formats: ['es', 'umd'/*, 'cjs', 'amd', 'iife', 'system'*/],
    },
    rollupOptions: {
      external: ['vue', 'naive-ui', 'naive-tools'],
      output: {
        sourcemap: false,
        // Provide global variables to use in the UMD build
        // Add external deps here
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  plugins: [vue(), dts()]
})
