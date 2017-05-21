<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Defining the API call](#defining-the-api-call)
  - [`[RSAA].endpoint`](#rsaaendpoint)
  - [`[RSAA].method`](#rsaamethod)
  - [`[RSAA].body`](#rsaabody)
  - [`[RSAA].headers`](#rsaaheaders)
  - [`[RSAA].credentials`](#rsaacredentials)
- [Bailing out](#bailing-out)
- [Lifecycle](#lifecycle)
- [Customizing the dispatched FSAs](#customizing-the-dispatched-fsas)
  - [*Request* type descriptors](#request-type-descriptors)
  - [*Success* type descriptors](#success-type-descriptors)
  - [*Failure* type descriptors](#failure-type-descriptors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### Defining the API call

The parameters of the API call are specified by root properties of the `[RSAA]` property of an RSAA.

#### `[RSAA].endpoint`

The URL endpoint for the API call.

It is usually a string, be it a plain old one or an ES2015 template string. It may also be a function taking the state of your Redux store as its argument, and returning such a string.

####  `[RSAA].method`

The HTTP method for the API call.

It must be one of the strings `GET`, `HEAD`, `POST`, `PUT`, `PATCH`, `DELETE` or `OPTIONS`, in any mixture of lowercase and uppercase letters.

#### `[RSAA].body`

The body of the API call.

`redux-api-middleware` uses the [`Fetch API`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to make the API call. `[RSAA].body` should hence be a valid body according to the the [fetch specification](https://fetch.spec.whatwg.org). In most cases, this will be a JSON-encoded string or a [`FormData`](https://developer.mozilla.org/en/docs/Web/API/FormData) object.

#### `[RSAA].headers`

The HTTP headers for the API call.

It is usually an object, with the keys specifying the header names and the values containing their content. For example, you can let the server know your call contains a JSON-encoded string body in the following way.

```js
{
  [RSAA]: {
    ...
    headers: { 'Content-Type': 'application/json' }
    ...
  }
}
```

It may also be a function taking the state of your Redux store as its argument, and returning an object of headers as above.

#### `[RSAA].credentials`

Whether or not to send cookies with the API call.

It must be one of the following strings:

- `omit` is the default, and does not send any cookies;
- `same-origin` only sends cookies for the current domain;
- `include` always send cookies, even for cross-origin calls.

### Bailing out

In some cases, the data you would like to fetch from the server may already be cached in you Redux store. Or you may decide that the current user does not have the necessary permissions to make some request.

You can tell `redux-api-middleware` to not make the API call through `[RSAA].bailout`. If the value is `true`, the RSAA will die here, and no FSA will be passed on to the next middleware.

A more useful possibility is to give `[RSAA].bailout` a function. At runtime, it will be passed the state of your Redux store as its only argument, if the return value of the function is `true`, the API call will not be made.

### Lifecycle

The `[RSAA].types` property controls the output of `redux-api-middleware`. The simplest form it can take is an array of length 3 consisting of string constants (or symbols), as in our [example](README.md#a-simple-example) above. This results in the default behavior we now describe.

1. When `redux-api-middleware` receives an action, it first checks whether it has an `[RSAA]` property. If it does not, it was clearly not intended for processing with `redux-api-middleware`, and so it is unceremoniously passed on to the next middleware.

2. It is now time to validate the action against the [RSAA definition](RSAA.md#redux-standard-api-calling-actions). If there are any validation errors, a *request* FSA will be dispatched (if at all possible) with the following properties:
    - `type`: the string constant in the first position of the `[RSAA].types` array;
    - `payload`: an [`InvalidRSAA`](REFERENCE.md#invalidrsaa) object containing a list of said validation errors;
    - `error: true`.

  `redux-api-middleware` will perform no further operations. In particular, no API call will be made, and the incoming RSAA will die here.

3. Now that `redux-api-middleware` is sure it has received a valid RSAA, it will try making the API call. If everything is alright, a *request* FSA will be dispatched with the following property:
  - `type`: the string constant in the first position of the `[RSAA].types` array.

  But errors may pop up at this stage, for several reasons:
  - `redux-api-middleware` has to call those of `[RSAA].bailout`, `[RSAA].endpoint` and `[RSAA].headers` that happen to be a function, which may throw an error;
  - `fetch` may throw an error: the RSAA definition is not strong enough to preclude that from happening (you may, for example, send in a `[RSAA].body` that is not valid according to the fetch specification &mdash; mind the SHOULDs in the [RSAA definition](RSAA.md#redux-standard-api-calling-actions));
  - a network failure occurs (the network is unreachable, the server responds with an error,...).

  If such an error occurs, a different *request* FSA will be dispatched (*instead* of the one described above). It will contain the following properties:
  - `type`: the string constant in the first position of the `[RSAA].types` array;
  - `payload`: a [`RequestError`](REFERENCE.md#requesterror) object containing an error message;
  - `error: true`.

4. If `redux-api-middleware` receives a response from the server with a status code in the 200 range, a *success* FSA will be dispatched with the following properties:
  - `type`: the string constant in the second position of the `[RSAA].types` array;
  - `payload`: if the `Content-Type` header of the response is set to something JSONy (see [*Success* type descriptors](#success-type-descriptors) below), the parsed JSON response of the server, or undefined otherwise.

  If the status code of the response falls outside that 200 range, a *failure* FSA will dispatched instead, with the following properties:
  - `type`: the string constant in the third position of the `[RSAA].types` array;
  - `payload`: an [`ApiError`](REFERENCE.md#apierror) object containing the message `` `${status} - ${statusText}` ``;
  - `error: true`.

### Customizing the dispatched FSAs

It is possible to customize the output of `redux-api-middleware` by replacing one or more of the string constants (or symbols) in `[RSAA].types` by a type descriptor.

A *type descriptor* is a plain JavaScript object that will be used as a blueprint for the dispatched FSAs. As such, type descriptors must have a `type` property, intended to house the string constant or symbol specifying the `type` of the resulting FSAs.

They may also have `payload` and `meta` properties, which may be of any type. Functions passed as `payload` and `meta` properties of type descriptors will be evaluated at runtime. The signature of these functions should be different depending on whether the type descriptor refers to *request*, *success* or *failure* FSAs &mdash; keep reading.

If a custom `payload` and `meta` function throws an error, `redux-api-middleware` will dispatch an FSA with its `error` property set to `true`, and an `InternalError` object as its `payload`.

A noteworthy feature of `redux-api-middleware` is that it accepts Promises (or function that return them) in `payload` and `meta` properties of type descriptors, and it will wait for them to resolve before dispatching the FSA &mdash; so no need to use anything like `redux-promise`.

#### *Request* type descriptors

`payload` and `meta` functions will be passed the RSAA action itself and the state of your Redux store.

For example, if you want your *request* FSA to have the URL endpoint of the API call in its `payload` property, you can model your RSAA on the following.

```js
// Input RSAA
{
  [RSAA]: {
    endpoint: 'http://www.example.com/api/users',
    method: 'GET',
    types: [
      {
        type: 'REQUEST',
        payload: (action, state) => ({ endpoint: action.endpoint })
      },
      'SUCCESS',
      'FAILURE'
    ]
  }
}

// Output request FSA
{
  type: 'REQUEST',
  payload: { endpoint: 'http://www.example.com/api/users' }
}
```

If you do not need access to the action itself or the state of your Redux store, you may as well just use a static object. For example, if you want the `meta` property to contain a fixed message saying where in your application you're making the request, you can do this.

```js
// Input RSAA
{
  [RSAA]: {
    endpoint: 'http://www.example.com/api/users',
    method: 'GET',
    types: [
      {
        type: 'REQUEST',
        meta: { source: 'userList' }
      },
      'SUCCESS',
      'FAILURE'
    ]
  }
}

// Output request FSA
{
  type: 'REQUEST',
  meta: { source: 'userList' }
}
```

By default, *request* FSAs will not contain `payload` and `meta` properties.

Error *request* FSAs might need to obviate these custom settings though.
  - *Request* FSAs resulting from invalid RSAAs (step 2 in [Lifecycle](#lifecycle) above) cannot be customized. `redux-api-middleware` will try to dispatch an error *request* FSA, but it might not be able to (it may happen that the invalid RSAA does not contain a value that can be used as the *request* FSA `type` property, in which case `redux-api-middleware` will let the RSAA die silently).
  - *Request* FSAs resulting in request errors (step 3 in [Lifecycle](#lifecycle) above) will honor the user-provided `meta`, but will ignore the user-provided `payload`, which is reserved for the default error object.

#### *Success* type descriptors

`payload` and `meta` functions will be passed the RSAA action itself, the state of your Redux store, and the raw server response.

For example, if you want to process the JSON response of the server using [`normalizr`](https://github.com/gaearon/normalizr), you can do it as follows.

```js
import { Schema, arrayOf, normalize } from 'normalizr';
const userSchema = new Schema('users');

// Input RSAA
{
  [RSAA]: {
    endpoint: 'http://www.example.com/api/users',
    method: 'GET',
    types: [
      'REQUEST',
      {
        type: 'SUCCESS',
        payload: (action, state, res) => {
          const contentType = res.headers.get('Content-Type');
          if (contentType && ~contentType.indexOf('json')) {
            // Just making sure res.json() does not raise an error
            return res.json().then((json) => normalize(json, { users: arrayOf(userSchema) }));
          }
        }
      },
      'FAILURE'
    ]
  }
}

// Output success FSA
{
  type: 'SUCCESS',
  payload: {
    result: [1, 2],
    entities: {
      users: {
        1: {
          id: 1,
          name: 'John Doe'
        },
        2: {
          id: 2,
          name: 'Jane Doe'
        }
      }
    }
  }
}
```

The above pattern of parsing the JSON body of the server response is probably quite common, so `redux-api-middleware` exports a utility function `getJSON` which allows for the above `payload` function to be written as
```js
(action, state, res) => {
  return getJSON(res).then((json) => normalize(json, { users: arrayOf(userSchema) }));
}
```

By default, *success* FSAs will not contain a `meta` property, while their `payload` property will be evaluated from
```js
(action, state, res) => getJSON(res)
```

#### *Failure* type descriptors

`payload` and `meta` functions will be passed the RSAA action itself, the state of your Redux store, and the raw server response &mdash; exactly as for *success* type descriptors. The `error` property of dispatched *failure* FSAs will always be set to `true`.

For example, if you want the status code and status message of a unsuccessful API call in the `meta` property of your *failure* FSA, do the following.

```js
{
  [RSAA]: {
    endpoint: 'http://www.example.com/api/users/1',
    method: 'GET',
    types: [
      'REQUEST',
      'SUCCESS',
      {
        type: 'FAILURE',
        meta: (action, state, res) => {
          if (res) {
            return {
              status: res.status
              statusText: res.statusText
            };
          } else {
            return {
              status: 'Network request failed'
            }
          }
        }
      }
    ]
  }
}
```

By default, *failure* FSAs will not contain a `meta` property, while their `payload` property will be evaluated from
```js
(action, state, res) =>
  getJSON(res).then(
    (json) => new ApiError(res.status, res.statusText, json)
  )
```
