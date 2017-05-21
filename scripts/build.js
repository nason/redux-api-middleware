// Inspired by https://medium.com/@tarkus/how-to-build-and-publish-es6-modules-today-with-babel-and-rollup-4426d9c7ca71

const fs = require('fs');
const del = require('del');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const pkg = require('../package.json');


const bundles = [
  // ES Module for node-next and webpack v2
  {
    format: 'es', ext: '.es.js',
  },

  // CommonJS bundle for node and webpack v1
  {
    format: 'cjs', ext: '.js',
  },

  // UMD Build
  {
    format: 'umd', ext: '.js',
  },
];

let promise = Promise.resolve();

// Clean up the output directory
promise = promise.then(() => del(['dist/*']));

// Compile source code into a distributable format with Babel and Rollup
for (const config of bundles) {
  promise = promise.then(() => rollup.rollup({
    entry: 'src/index.js',
    external: Object.keys(pkg.dependencies),
    plugins: [
      babel({
        exclude: 'node_modules/**',
        runtimeHelpers: true // depends on "transform-runtime" plugin
      }),
    ],
  }).then((bundle) => {
    return bundle.write({
      dest: `dist/${config.format === 'cjs' ? 'index' : `index.${config.format}`}.js`,
      format: config.format,
      sourceMap: true,
      moduleName: config.format === 'umd' ? pkg.name : undefined,
    })
  }))
}

promise.catch(err => console.error(err.stack)); // eslint-disable-line no-console
