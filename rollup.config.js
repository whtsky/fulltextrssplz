import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import htmlTemplate from 'rollup-plugin-generate-html-template';
// @ts-ignore
import postcss from 'rollup-plugin-postcss'

export default {
  input: 'src/frontend.ts',
  output: {
    dir: 'public',
    format: 'iife',
    sourcemap: true,
    entryFileNames: '[name].[hash].js',
    globals: {
      crypto: 'undefined',
    },
  },
  plugins: [
    resolve({
      browser: true,
    }),
    commonjs(),
    typescript({
      module: 'es6',
      target: 'es5',
    }),
    postcss({
      extract: true,
      minimize: true
    }),
    terser(),
    htmlTemplate({
      template: 'index.html',
      target: 'index.html',
      attrs: ['defer'],
    }),
  ],
  external: [
    'crypto', // not used in frontend code
  ],
}
