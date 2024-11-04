const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const  terser = require('@rollup/plugin-terser');

module.exports = {
  input: 'src/flow/flow.js',
  output: [
  // {
  //   file: 'dist/flow.js',
  //   format: 'iife'
  // },
  {
    file: 'dist/flow.min.js',
    format: 'iife',
    name: 'version',
    plugins: [terser()]
  }],
  plugins: [commonjs(), json()]
};
