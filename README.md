
This function returns an object with all the exported functions,
but has to be called with apiKey and apiUrl.

example:
```
const canvasApi = require('canvas-api')('http://my.canvas.api', 'my canvas key')
canvasApi.listAccounts().then(accounts => console.log(accounts))
```
