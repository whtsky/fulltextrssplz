import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
// @ts-ignore
import postcss from 'rollup-plugin-postcss'
import purgecss from '@fullhuman/postcss-purgecss'

export default {
  input: 'src/frontend.ts',
  output: {
    dir: 'public',
    format: 'iife',
    sourcemap: true,
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
      extract: 'styles.css',
      plugins: [
        purgecss({
          content: ['./public/*.html'],
        }),
      ],
    }),
    terser(),
  ],
  external: [
    'crypto', // not used in frontend code
  ],
}
