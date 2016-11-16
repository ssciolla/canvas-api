This library is used to integrate with the Canvas LMS.

example:
```
const canvasApi = require('canvas-api')('http://my.canvas.api', 'my canvas key')
canvasApi.listAccounts().then(accounts => console.log(accounts))
```
