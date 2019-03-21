const proxyquire = require('proxyquire').noCallThru()

const test = require('ava')
const Canvas = require('../index')

test('Token is correctly stripped', async t => {
  t.plan(1)
  const canvas = Canvas('https://kth.test.instructure.com/api/v1', 'My token')

  try {
    await canvas.requestUrl('/accounts')
  } catch (err) {
    const error = JSON.stringify(err)
    t.notRegex(error, /My token/)
  }
})

test('URLs are correctly "resolved"', async t => {
  const base = 'http://example.com'
  const e = '/index'

  let spy
  const SpecialCanvas = proxyquire('../index', {
    'request-promise': function (obj) {
      spy = obj.url
      return []
    }
  })

  const canvas = SpecialCanvas(base)
  canvas.get(e)

  t.is(spy, 'http://example.com/index')

})
