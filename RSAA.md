<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Redux Standard API-calling Actions](#redux-standard-api-calling-actions)
  - [`[RSAA]`](#rsaa)
  - [`[RSAA].endpoint`](#rsaaendpoint)
  - [`[RSAA].method`](#rsaamethod)
  - [`[RSAA].body`](#rsaabody)
  - [`[RSAA].headers`](#rsaaheaders)
  - [`[RSAA].credentials`](#rsaacredentials)
  - [`[RSAA].bailout`](#rsaabailout)
  - [`[RSAA].types`](#rsaatypes)
  - [Type descriptors](#type-descriptors)
- [Flux Standard Actions](#flux-standard-actions)
  - [`type`](#type)
  - [`payload`](#payload)
  - [`error`](#error)
  - [`meta`](#meta)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### Redux Standard API-calling Actions

The definition of a *Redux Standard API-calling Action* below is the one used to validate RSAA actions. As explained in [Lifecycle](USAGE.md#lifecycle),
  - actions without an `[RSAA]` property will be passed to the next middleware without any modifications;
  - actions with an `[RSAA]` property that fail validation will result in an error *request* FSA.

A *Redux Standard API-calling Action* MUST

- be a plain JavaScript object,
- have an `[RSAA]` property.

A *Redux Standard API-calling Action* MUST NOT

- include properties other than `[RSAA]`.

#### `[RSAA]`

The `[RSAA]` property MUST

- be a plain JavaScript Object,
- have an `endpoint` property,
- have a `method` property,
- have a `types` property.

The `[RSAA]` property MAY

- have a `body` property,
- have a `headers` property,
- have a `credentials` property,
- have a `bailout` property.

The `[RSAA]` property MUST NOT

- include properties other than `endpoint`, `method`, `types`, `body`, `headers`, `credentials`, and `bailout`.

#### `[RSAA].endpoint`

The `[RSAA].endpoint` property MUST be a string or a function. In the second case, the function SHOULD return a string.

#### `[RSAA].method`

The `[RSAA].method` property MUST be one of the strings `GET`, `HEAD`, `POST`, `PUT`, `PATCH`, `DELETE` or `OPTIONS`, in any mixture of lowercase and uppercase letters.

#### `[RSAA].body`

The optional `[RSAA].body` property SHOULD be a valid body according to the the [fetch specification](https://fetch.spec.whatwg.org).

#### `[RSAA].headers`

The optional `[RSAA].headers` property MUST be a plain JavaScript object or a function. In the second case, the function SHOULD return a plain JavaScript object.

#### `[RSAA].credentials`

The optional `[RSAA].credentials` property MUST be one of the strings `omit`, `same-origin` or `include`.

#### `[RSAA].bailout`

The optional `[RSAA].bailout` property MUST be a boolean or a function.

#### `[RSAA].types`

The `[RSAA].types` property MUST be an array of length 3. Each element of the array MUST be a string, a `Symbol`, or a type descriptor.

#### Type descriptors

A type descriptor MUST

- be a plain JavaScript object,
- have a `type` property, which MUST be a string or a `Symbol`.

A type descriptor MAY

- have a `payload` property, which MAY be of any type,
- have a `meta` property, which MAY be of any type.

A type descriptor MUST NOT

- have properties other than `type`, `payload` and `meta`.

### Flux Standard Actions

For convenience, we recall here the definition of a [*Flux Standard Action*](https://github.com/acdlite/flux-standard-action).

An action MUST

- be a plain JavaScript object,
- have a `type` property.

An action MAY

- have an `error` property,
- have a `payload` property,
- have a `meta` property.

An action MUST NOT

- include properties other than `type`, `payload`, `error` and `meta`.

#### `type`

The `type` of an action identifies to the consumer the nature of the action that has occurred. Two actions with the same `type` MUST be strictly equivalent (using `===`). By convention, `type` is usually a string constant or a `Symbol`.

#### `payload`

The optional `payload` property MAY be any type of value. It represents the payload of the action. Any information about the action that is not the `type` or status of the action should be part of the `payload` field.

By convention, if `error` is true, the `payload` SHOULD be an error object. This is akin to rejecting a Promise with an error object.

#### `error`

The optional `error` property MAY be set to `true` if the action represents an error.

An action whose `error` is true is analogous to a rejected Promise. By convention, the `payload` SHOULD be an error object.

If `error` has any other value besides `true`, including `undefined` and `null`, the action MUST NOT be interpreted as an error.

#### `meta`

The optional `meta` property MAY be any type of value. It is intended for any extra information that is not part of the payload.
