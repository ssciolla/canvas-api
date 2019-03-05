# Canvas API

NodeJS interface for making requests to the [Canvas LMS API](https://canvas.instructure.com/doc/api/)

[![Build Status](https://travis-ci.org/KTH/canvas-api.svg?branch=master)](https://travis-ci.org/KTH/canvas-api)


## How to use

Once you build a canvas instance, you get an object with only four methods:

1. The low-level `requestUrl()` method to perform any request with any HTTP method
2. Three high-level methods for doing GET requests:
   - `get()` to perform a GET request
   - `list()` to perform a GET request and iterate through the results
   - `listPaginated()` like *list()* but for iterating through pages

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

### Basic usage of `get()`, `list()` and `listPaginated()`

Use `get()` to get a single resource

``` js
// This will return only the "first page".
// Sometimes it's enough
const courses = await canvas.get('/courses')
```

Use `list()` to get a list of resources and iterate through them. `list()` returns an async iterable that iterates for each element.

``` js
const courses = canvas.list('/courses')
for await (let course of courses) {
  console.log(course.id)
}
```

Use `listPaginated()` to get a list of pages and iterate through them. `listPaginated()` returns an async iterable that iterates per page.

```js
const pages = canvas.listPaginated('/courses')

for await (let page of pages) {
  // Each "page" is a list of courses
  console.log(page.length)
}

```

### Advanced usage

You can pass query parameters to the request with all the methods

```js
// Equivalent to GET /courses?enrollment_type=teacher will be:

const courses = await canvas.get('/courses', {enrollment_type: 'teacher'})
const courses = await canvas.list('/courses', {enrollment_type: 'teacher'})
const pages = await canvas.listPaginated('/courses', {enrollment_type: 'teacher'})
```

### Low-level `requestUrl` (for non-GET requests)

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
