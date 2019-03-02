# This library is used to integrate with the Canvas LMS.

## How to use

Once you build a canvas instance, you get an object with only four methods:

1. The low-level `requestUrl()` method to perform any request with any HTTP method
2. Three helper methods for doing GET requests:
   - `get()` to perform a GET request
   - `list()` to perform a GET request and iterate through the results
   - `listPaginated()` like *list()* but for iterating through pages

### Helper methods (GET requests)

```js
const Canvas = require('kth-canvas-api')

const url = 'https://xxx.instructure.com/api/v1'
const token = 'AAAA~XXX'
const canvas = Canvas(url, token)

// Use `get()` to get a single resource... this will return only the
// "first page". Sometimes it's enough
const courses = await canvas.get('/courses')

// Use `list()` to get a list of resources and iterate through them
const courses = canvas.list('/courses')
for await (let course of courses) {
  console.log(course.id)
}

// Use `listPaginated()` if you want to iterate through pages
const pages = canvas.listPaginated('/courses')
for await (let page of pages) {
  // Each "page" is a list of courses
  console.log(page.length)
}

// You can pass query parameters to the request with all the methods
// Equivalent to GET /courses?enrollment_type=teacher will be:
const courses = await canvas.get('/courses', {enrollment_type: 'teacher'})
const courses = await canvas.list('/courses', {enrollment_type: 'teacher'})
const pages = await canvas.listPaginated('/courses', {enrollment_type: 'teacher'})
```

### Low-level `requestUrl` (for non-GET requests)

```js
// The method returns a full response (including headers, statusCode...)
const {body, headers, statusCode} = await canvas.requestUrl('/courses', 'POST')

// Pass an object as body parameter
const body = {
  name: 'Example course'
}
const response = await canvas.requestUrl('/courses', 'POST', body)

// You can use the fourth parameter to pass extra options to the request
// Read the documentation on the `request` and `request-promise` library
// https://github.com/request/request
// https://github.com/request/request-promise
const options = {
  resolveWithFullResponse: false
}
const responseBody = await canvas.requestUrl('/courses', 'POST', body, options)
```
