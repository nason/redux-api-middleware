<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [`RSAA`](#rsaa)
- [`apiMiddleware`](#apimiddleware)
- [`isRSAA(action)`](#isrsaaaction)
- [`validateRSAA(action)`](#validatersaaaction)
- [`isValidRSAA(action)`](#isvalidrsaaaction)
- [`InvalidRSAA`](#invalidrsaa)
- [`InternalError`](#internalerror)
- [`RequestError`](#requesterror)
- [`ApiError`](#apierror)
- [`getJSON(res)`](#getjsonres)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

The following objects are exported by `redux-api-middleware`.

#### `RSAA`

A JavaScript `String` whose presence as a key in an action signals that `redux-api-middleware` should process said action.

#### `apiMiddleware`

The Redux middleware itself.

#### `isRSAA(action)`

A function that returns `true` if `action` has an `[RSAA]` property, and `false` otherwise.

#### `validateRSAA(action)`

A function that validates `action` against the RSAA definition, returning an array of validation errors.

#### `isValidRSAA(action)`

A function that returns `true` if `action` conforms to the RSAA definition, and `false` otherwise. Internally, it simply checks the length of the array of validation errors returned by `validateRSAA(action)`.

#### `InvalidRSAA`

An error class extending the native `Error` object. Its constructor takes an array of validation errors as its only argument.

`InvalidRSAA` objects have three properties:

- `name: 'InvalidRSAA'`;
- `validationErrors`: the argument of the call to its constructor; and
- `message: 'Invalid RSAA'`.

#### `InternalError`

An error class extending the native `Error` object. Its constructor takes a string, intended to contain an error message.

`InternalError` objects have two properties:

- `name: 'InternalError'`;
- `message`: the argument of the call to its constructor.

#### `RequestError`

An error class extending the native `Error` object. Its constructor takes a string, intended to contain an error message.

`RequestError` objects have two properties:

- `name: 'RequestError'`;
- `message`: the argument of the call to its constructor.

#### `ApiError`

An error class extending the native `Error` object. Its constructor takes three arguments:

- a status code,
- a status text, and
- a further object, intended for a possible JSON response from the server.

`ApiError` objects have five properties:

- `name: 'ApiError'`;
- `status`: the first argument of the call to its constructor;
- `statusText`: the second argument of the call to its constructor;
- `response`: to the third argument of the call to its constructor; and
- `` message : `${status} - ${statusText}` ``.

#### `getJSON(res)`

A function taking a response object as its only argument. If the response object contains a JSONy `Content-Type`, it returns a promise resolving to its JSON body. Otherwise, it returns a promise resolving to undefined.
