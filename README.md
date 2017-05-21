## This `next` branch is 2.0.0-beta in development!

See [Upgrading from v1.0.x](#upgrading-from-v1.0.x) for details on upgrading, and issues for the [2.0 milestone here](https://github.com/agraboso/redux-api-middleware/issues?utf8=%E2%9C%93&q=milestone%3A2.0.0%20)

[![Build Status](https://travis-ci.org/agraboso/redux-api-middleware.svg?branch=next)](https://travis-ci.org/agraboso/redux-api-middleware) [![Coverage Status](https://coveralls.io/repos/agraboso/redux-api-middleware/badge.svg?branch=next&service=github)](https://coveralls.io/github/agraboso/redux-api-middleware?branch=next)

[Redux middleware](http://rackt.github.io/redux/docs/advanced/Middleware.html) for calling an API.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Introduction](#introduction)
  - [A simple example](#a-simple-example)
  - [Usage](#usage)
- [Installation](#installation)
    - [configureStore.js](#configurestorejs)
    - [app.js](#appjs)
- [Documentation and Reference](#documentation-and-reference)
- [History](#history)
- [Tests](#tests)
- [Upgrading from v1.0.x](#upgrading-from-v10x)
- [License](#license)
- [Projects using redux-api-middleware](#projects-using-redux-api-middleware)
- [Acknowledgments](#acknowledgments)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Introduction

This middleware receives [*Redux Standard API-calling Actions*](REFERENCE.md#redux-standard-api-calling-actions) (RSAAs) and dispatches [*Flux Standard Actions*](REFERENCE.md#flux-standard-actions) (FSAs) to the next middleware.

RSAAs are identified by the presence of an `[RSAA]` property, where [`RSAA`](REFERENCE.md#rsaa) is a `String` constant defined in, and exported by `redux-api-middleware`. They contain information describing an API call and three different types of FSAs, known as the *request*, *success* and *failure* FSAs.

### A simple example

The following is a minimal RSAA action:

```js
import { RSAA } from `redux-api-middleware`; // RSAA = '@@redux-api-middleware/RSAA'

{
  [RSAA]: {
    endpoint: 'http://www.example.com/api/users',
    method: 'GET',
    types: ['REQUEST', 'SUCCESS', 'FAILURE']
  }
}
```

Upon receiving this action, `redux-api-middleware` will

1. check that it is indeed a valid RSAA action;
2. dispatch the following *request* FSA to the next middleware;

    ```js
    {
      type: 'REQUEST'
    }
    ```

3. make a GET request to `http://www.example.com/api/users`;
4. if the request is successful, dispatch the following *success* FSA to the next middleware;

    ```js
    {
      type: 'SUCCESS',
      payload: {
        users: [
          { id: 1, name: 'John Doe' },
          { id: 2, name: 'Jane Doe' },
        ]
      }
    }
    ```

5. if the request is unsuccessful, dispatch the following *failure* FSA to the next middleware.

    ```js
    {
      type: 'FAILURE',
      payload: error // An ApiError object
      error: true
    }
    ```

We have tiptoed around error-handling issues here. For a thorough walkthrough of the `redux-api-middleware` lifecycle, see [Lifecycle](USAGE.md#lifecycle) below.

### Usage

See [Usage](USAGE.md) for more documentation

## Installation

`redux-api-middleware` is available on [npm](https://www.npmjs.com/package/redux-api-middleware).

```
$ npm install redux-api-middleware --save
```

To use it, wrap the standard Redux store with it. Here is an example setup. For more information (for example, on how to add several middlewares), consult the [Redux documentation](http://redux.js.org).

Note: `redux-api-middleware` depends on a [global Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) being available, and may require a polyfill for your runtime environment(s).

#### configureStore.js

```js
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { apiMiddleware } from 'redux-api-middleware';
import reducers from './reducers';

const reducer = combineReducers(reducers);
const createStoreWithMiddleware = applyMiddleware(apiMiddleware)(createStore);

export default function configureStore(initialState) {
  return createStoreWithMiddleware(reducer, initialState);
}
```

#### app.js

```js
const store = configureStore(initialState);
```

## Documentation and Reference

// TODO set this up!
Documentation is available at https://redux-api-middleware.js.org

## History

// TODO set this up!
See [CHANGELOG.md](CHANGELOG.md)

## Tests

```
$ npm install && npm test
```

## Upgrading from v1.0.x

- The `CALL_API` symbol is replaced with the `RSAA` string as the top-level RSAA action key. `CALL_API` is aliased to the new value as of 2.0, but this will ultimately be deprecated.
- `redux-api-middleware` no longer brings its own `fetch` implementation and depends on a global `fetch` to be provided in the runtime
- A new `options` config is added to pass your `fetch` implementation extra options other than `method`, `headers`, `body` and `credentials`

## License

MIT. See [LICENSE.md](LICENSE.md)

## Projects using redux-api-middleware

- [react-trebuchet](https://github.com/barrystaes/react-trebuchet/tree/test-bottledapi-apireduxmiddleware) (experimental/opinionated fork of react-slingshot for SPA frontends using REST JSON API backends)

If your opensource project uses (or works with) `redux-api-middleware` we would be happy to list it here!

## Acknowledgments

The code in this module was originally extracted from the [real-world](https://github.com/rackt/redux/blob/master/examples/real-world/middleware/api.js) example in the [redux](https://github.com/rackt/redux) repository, due to [Dan Abramov](https://github.com/gaearon). It has evolved thanks to issues filed by, and pull requests contributed by, other developers.
