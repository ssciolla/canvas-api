# This library is used to integrate with the Canvas LMS.

## How to use
You need an instance of Canvas LMS to communicate with.
Log in to that instance and generate an access token (As of this writing under Account/Settings/Approved integrations in Canvas). Store the newly generated access token:
```
const accessToken = '123123123123123123123123123123'
```
Then create a variable containing the url to the Canvas api.
```
const apiUrl = 'https://xxx.test.instructure.com/api/v1'
```
Now, instantiate CanvasApi with these two variables:
```
const CanvasApi = require('canvas-api')

const canvasApi = new CanvasApi(apiUrl, accessToken)
```

## Example functions
### List all accounts
```
canvasApi.listAccounts()
.then(accounts => console.log(JSON.stringify(accounts, null,4)))
```
### List all courses
```
canvasApi.listCourses()
.then(courses => console.log(JSON.stringify(courses, null,4)))
```

### List all users
```
canvasApi.listUsers()
.then(courses => console.log(JSON.stringify(courses, null,4)))
```
