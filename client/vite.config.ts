/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import VueRouter from 'vue-router/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    VueRouter({
      routesFolder: 'src/pages',
      dts: 'src/typed-router.d.ts',
      /*
       * The design-system showcase under `src/pages/dev/` is a development
       * tool. Excluding it here removes the route and its chunk from
       * production builds entirely, rather than merely keeping it out of the
       * navigation where it would remain reachable by URL.
       */
      // Globs are resolved against the cwd, not the routes folder.
      exclude: mode === 'production' ? ['src/pages/dev/**'] : [],
    }),
    vue(),
    tailwindcss(),
  ],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: './src/test/setup.ts',
  },
}))
