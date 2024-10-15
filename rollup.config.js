const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const  terser = require('@rollup/plugin-terser');

module.exports = {
  input: 'src/Slimo.js',
  output: [{
    file: 'dist/bundle.js',
    format: 'iife'
  },{
    file: 'dist/bundle.min.js',
    format: 'iife',
    name: 'version',
    plugins: [terser()]
  }],
  plugins: [commonjs(), json()]
};
