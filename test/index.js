const proxyquire = require('proxyquire').noCallThru()
const test = require('ava')
const createTestServer = require('create-test-server')

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
  const server = await createTestServer()
  server.get('/index', 'foo')
  server.get('/api/v1/courses/1', 'foo')

  const urls = [
    { base: server.url, end: '/index' },
    { base: server.url, end: 'index' },
    { base: server.url + '/', end: '/index' },
    { base: server.url + '/', end: 'index' },
    { base: `${server.url}/api/v1`, end: '/courses/1' },
    { base: `${server.url}/api/v1`, end: 'courses/1' },
    { base: `${server.url}/api/v1/`, end: '/courses/1' },
    { base: `${server.url}/api/v1/`, end: 'courses/1' }
  ]

  for (const { base, end } of urls) {
    const canvas = Canvas(base, '')
    const result = await canvas.get(end)
    t.is(result.body, 'foo')
  }
})

test('List returns a correct iterable', async t => {
  const server = await createTestServer()

  server.get('/something', (req, res) => {
    res.set('Link', `<${server.url}/something_else>; rel="next", <irrelevant>; rel="first"`)
    res.send([1, 2, 3])
  })
  server.get('/something_else', [4, 5])

  const canvas = Canvas(server.url, '')
  const result = []

  for await (const e of canvas.list('/something')) {
    result.push(e)
  }

  t.deepEqual(result, [1, 2, 3, 4, 5])
})

test('List returns an Augmented iterable', async t => {
  const SpecialCanvas = proxyquire('../index', {
    'request-promise': function ({ url }) {
      if (url === 'http://example.com/something') {
        return {
          body: [1, 2, 3],
          headers: {
            link: '<http://example.com/something_else>; rel="next", <irrelevant>; rel="first"'
          }
        }
      } else if (url === 'http://example.com/something_else') {
        return {
          body: [4, 5]
        }
      }
    }
  })

  const canvas = SpecialCanvas('http://example.com')
  const result = await canvas.list('/something').toArray()

  t.deepEqual(result, [1, 2, 3, 4, 5])
})

test('List ignores non-"rel=next" link headers', async t => {
  const SpecialCanvas = proxyquire('../index', {
    'request-promise': function ({ url }) {
      if (url === 'http://example.com/something') {
        return {
          body: [1],
          headers: {
            link: '<http://dont-call.com>; rel="last", <http://ignore-this.se>; rel="prev", <http://nope.com>; rel="first"'
          }
        }
      } else {
        t.fail(`The url: "${url}" was requested and should not be!`)
      }
    }
  })

  const canvas = SpecialCanvas('http://example.com')
  const result = []

  for await (const e of canvas.list('/something')) {
    result.push(e)
  }
  t.deepEqual(result, [1])
})

test('List can handle pagination urls with query strings', async t => {
  const SpecialCanvas = proxyquire('../index', {
    'request-promise': function ({ url, qs }) {
      if (url === 'http://example.com/something') {
        return {
          body: [1, 2, 3],
          headers: {
            link: '<http://example.com/something_else?query=string>; rel="next", <irrelevant>; rel="first"'
          }
        }
      } else if (url === 'http://example.com/something_else?query=string' && !qs) {
        return {
          body: [4, 5]
        }
      }
    }
  })

  const canvas = SpecialCanvas('http://example.com')
  const result = []

  for await (const e of canvas.list('/something')) {
    result.push(e)
  }

  t.deepEqual(result, [1, 2, 3, 4, 5])
})
