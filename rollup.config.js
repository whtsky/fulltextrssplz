import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/frontend.ts',
  output: {
    dir: 'public',
    format: 'iife',
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
    terser(),
  ],
}
