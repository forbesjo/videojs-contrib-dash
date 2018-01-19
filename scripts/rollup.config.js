import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';
import pkg from '../package.json';

const date = new Date();

const banner =
`/**
 * ${pkg.name}
 * @version ${pkg.version}
 * @copyright ${date.getFullYear()} ${pkg.author}
 * @license ${pkg.license}
 */`;

const plugins = [
  resolve({ browser: true, main: true, jsnext: true }),
  json(),
  commonjs({ sourceMap: false }),
  babel()
];

export default [
  /**
   * Rollup configuration for packaging the plugin in a module that is consumable
   * as the `src` of a `script` tag or via AMD or similar client-side loading.
   *
   * This module DOES include its dependencies.
   */
  {
    name: 'videojsDash',
    input: 'src/index.js',
    output: {
      file: 'dist/videojs-dash.js',
      format: 'umd'
    },
    external: ['video.js', 'dashjs'],
    globals: {
      'dashjs': 'dashjs',
      'video.js': 'videojs'
    },
    legacy: true,
    banner,
    plugins
  }, {
    name: 'videojsDash',
    input: 'src/index.js',
    output: {
      file: 'dist/videojs-dash.min.js',
      format: 'umd'
    },
    external: ['video.js', 'dashjs'],
    globals: {
      'dashjs': 'dashjs',
      'video.js': 'videojs'
    },
    legacy: true,
    banner,
    plugins: plugins
      .concat([uglify({output: {comments: 'some'}}, minify)])
  },

  /**
   * Rollup configuration for packaging the plugin in a module that is consumable
   * by either CommonJS (e.g. Node or Browserify) or ECMAScript (e.g. Rollup).
   *
   * These modules DO NOT include their dependencies as we expect those to be
   * handled by the module system.
   */
  {
    name: 'videojsDash',
    input: 'src/index.js',
    legacy: true,
    banner,
    plugins: [ json(), babel({exclude: 'node_modules/**'}) ],
    output: [
      {file: 'dist/videojs-dash.cjs.js', format: 'cjs'},
      {file: 'dist/videojs-dash.es.js', format: 'es'}
    ]
  }
];
