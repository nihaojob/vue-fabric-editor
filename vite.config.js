import { createVuePlugin } from 'vite-plugin-vue2';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import viteCompression from 'vite-plugin-compression';
import requireTransform from 'vite-plugin-require-transform';

export default defineConfig({
  base: './',
  publicPath: './',
  cacheDir: 'node_modules/.vite',
  plugins: [
    createVuePlugin({
      vueTemplateOptions: {},
    }),
    requireTransform({
      fileRegex: /.js$|.ts$|.tsx$|.vue$/,
    }),

    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // 大于100k的文件进行压缩
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  resolve: {
    extensions: ['.vue', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    alias: [
      {
        find: '@', // 别名
        replacement: resolve(__dirname, 'src'), // 别名对应地址
      },
    ],
  },

  build: {
    commonjsOptions: {
      transformMixedEsModules: true, // require可以使用
    },
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境去除console
        drop_debugger: true, // 生产环境去除debugger
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: '3088',
    open: true,
  },
});
