# Canvas API client

NodeJS HTTP client based on [Request-Promise](https://github.com/request/request-promise) for the [Canvas LMS API](https://canvas.instructure.com/doc/api/)

[![Build Status](https://travis-ci.org/KTH/canvas-api.svg?branch=master)](https://travis-ci.org/KTH/canvas-api)


## How to use

Once you build a canvas instance, you get an object with only four methods:

1. The low-level `requestUrl()` method to perform any request with any HTTP method
2. `get()` to perform a GET request
3. `list()` to perform a GET request and iterate through the results. Works for paginated responses.
4. `listPaginated()` like *list()* but for iterating through pages

### Build the Canvas instance

``` js
const Canvas = require('kth-canvas-api')

const url = 'https://xxx.instructure.com/api/v1'
const token = 'AAAA~XXX'
const canvas = Canvas(url, token)
```

The builder function accepts three arguments:

1. `url`. The root URL of the Canvas API
2. `token`. A token obtained from Canvas to make API requests
3. `options`. *optional* An object containing:
   - `log`. A function that will be called with logging messages. Default: empty function

### Get a single resource with `get()`

Use `get()` to get a single resource. Get returns the whole response (not only its body)

``` js
const response = await canvas.get('/courses/1')
const console.log(response.body.name)
```

### Get iterables with `list()` and `listPaginated()`

Use `list()` to get an **iterable** of resources

``` js
for await (let course of canvas.list('/courses')) {
  console.log(course.id)
}
```

Use `listPaginated()` to get an iterable of **pages** (you won't need this almost never)

```js
for await (let page of canvas.listPaginated('/courses')) {
  // Each "page" is a list of courses
  console.log(page.length)
}

```

### Convert iterables to arrays with `.toArray()`

Both `list()` and `listPaginated()` return special versions of iterables with a `toArray()` method. Use it to convert the iterables to arrays:

``` javascript
const courses = (await canvas.list('/courses').toArray())
  .filter(c => c.id < 100)
```


### Advanced usage

You can pass query parameters to the request with all the methods

```js
// Equivalent to GET /courses?enrollment_type=teacher will be:

const courses = await canvas.get('/courses', {enrollment_type: 'teacher'})
const courses = await canvas.list('/courses', {enrollment_type: 'teacher'})
const pages = await canvas.listPaginated('/courses', {enrollment_type: 'teacher'})
```

### `requestUrl` (for non-GET requests)

The method returns a full response (including headers, statusCode...)

```js
const {body, headers, statusCode} = await canvas.requestUrl('/courses', 'POST')
```

Send body parameters with the request passing an object as third argument

```js
const body = {
  name: 'Example course'
}
const response = await canvas.requestUrl('/courses', 'POST', body)

```

You can use the fourth parameter to pass extra options to the request. Read the documentation of [Request](https://github.com/request/request) and [Request Promise](https://github.com/request/request-promise) libraries

``` js
const options = {
  resolveWithFullResponse: false
}
const responseBody = await canvas.requestUrl('/courses', 'POST', body, options)
```
