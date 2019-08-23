# Canvas API client

NodeJS HTTP client based on [got](https://github.com/sindresorhus/got) for the [Canvas LMS API](https://canvas.instructure.com/doc/api/)

[![Build Status](https://travis-ci.org/KTH/canvas-api.svg?branch=master)](https://travis-ci.org/KTH/canvas-api)


## How to use

Once you build a canvas instance, you get an object with only five methods:

1. The low-level `requestUrl()` method to perform a request with any HTTP method
2. `get()` to perform a GET request
3. `list()` to perform a GET request and iterate through the results. Works for paginated responses.
4. `listPaginated()` like *list()* but for iterating through pages
5. `sendSis()` to perform a POST request attaching a file.

### Build the Canvas instance

``` js
const Canvas = require('kth-canvas-api')
// You can alternatively use ES modules
import Canvas from '@kth/canvas-api/esm'

const url = 'https://xxx.instructure.com/api/v1'
const token = 'AAAA~XXX'
const canvas = Canvas(url, token)
```

The builder function accepts two arguments:

1. `url`. The root URL of the Canvas API
2. `token`. A token obtained from Canvas to make API requests

### Get a single resource with `get()`

Use `get()` to get a single resource. Get returns the whole response (not only its body). A query string can be supplied as a plain object, which will then be converted to a string using the [query-string](https://github.com/sindresorhus/query-string) package (bracket representation).

``` js
const response = await canvas.get('/courses/1')
const console.log(response.body.name)
```

### Get iterables with `list()` and `listPaginated()`

Use `list()` to get an **iterable** of resources. A query string can be supplied as a plain object, which will then be converted to a string using the [query-string](https://github.com/sindresorhus/query-string) package (bracket representation).

``` js
for await (let course of canvas.list('/courses')) {
  console.log(course.id)
}
```

Use `listPaginated()` to get an iterable of **pages** (you probably won't ever need this). A query string can be supplied as a plain object, which will then be converted to a string using the [query-string](https://github.com/sindresorhus/query-string) package (bracket representation).

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

### Send CSV attachments with `sendSis(endpoint, attachment, body)`

Use this function to send a single file as attachment. Pass the path of that file as the `attachment` parameter.

You can include also any extra parameters using `body`. However, make sure that you don't pass any value with `attachment` key since that is the name of the field for the actual attachment.

The request is going to be sent as `multipart/form-data`. And the response will be parsed as JSON:

```javascript
const {body} = await canvas.sendSis('/accounts/1/sis_imports', 'enrollments.csv', {})
console.log(body.id)
```


### Advanced usage

You can pass query parameters to the request with all the methods

```js
// Equivalent to GET /courses?enrollment_type=teacher will be:

const courses = await canvas.get('/courses', {enrollment_type: 'teacher'})
const courses = await canvas.list('/courses', {enrollment_type: 'teacher'})
const pages = await canvas.listPaginated(`/courses/${courseId}/users`, new URLSearchParams([['include[]', 'avatar_url'], ['include[]', 'uuid']]))

```

### `requestUrl`

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

You can use the fourth parameter to pass extra options to the request. Read the documentation of [got](https://github.com/sindresorhus/got) for more information

``` js
const options = {
  query: {
    enrollment_state: 'completed'
  }
}
const responseBody = await canvas.requestUrl('/courses', 'GET', {}, options)
```
