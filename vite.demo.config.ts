import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  build: {
    outDir: 'docs'
  },
  root: 'src/examples',
  publicDir: '../../public',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})