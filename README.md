# This library is used to integrate with the Canvas LMS.

example:
```
const CanvasApi = require('canvas-api')
const canvasApi = new CanvasApi('http://my.canvas.api', 'my canvas key')
canvasApi.listAccounts().then(accounts => console.log(accounts))
```
