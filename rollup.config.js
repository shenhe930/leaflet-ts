import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import alias from '@rollup/plugin-alias';
import pkg from './package.json';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

export default {
  input: './src/index.ts',

  // Specify here external modules which you don't want to include in your bundle (for instance: 'lodash', 'moment' etc.)
  // https://rollupjs.org/guide/en/#external
  external: [],

  plugins: [
    // Allows node_modules resolution
    resolve({ extensions }),

    // Allow bundling cjs modules. Rollup doesn't understand cjs
    commonjs(),

    // Compile TypeScript/JavaScript files
    babel({
      extensions,
      babelHelpers: 'bundled',
      include: ['src/**/*'],
    }),
    alias({
      entries: [
        {
          find: /^@\/(.*)$/,
          replacement: path.resolve(__dirname, 'src/$1'),
        },
      ],
    }),
  ],

  output: [
    {
      file: pkg.main,
      format: 'umd',
      name: 'L',
      sourcemap: true,
      freeze: false,
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
      freeze: false,
    },
  ],
};
