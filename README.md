# This library is used to integrate with the Canvas LMS.

## How to use

```js
const Canvas = require('kth-canvas-api')

const url = 'https://xxx.instructure.com/api/v1'
const token = 'AAAA~XXX'
const canvas = Canvas(url, token)

const course = await canvas.requestUrl('/courses/1')
```
