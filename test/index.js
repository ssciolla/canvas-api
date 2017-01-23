var test = require('tape')

test.only('should be able to mock functions on canvasApi', t => {
  const CanvasApi = require('../index');
  const canvasApi = new CanvasApi()

  CanvasApi.prototype.findCourse = ()=>true

  t.ok(canvasApi.findCourse())
  t.end()
})
