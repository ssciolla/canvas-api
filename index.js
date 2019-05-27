const got = require('got')
const augmentGenerator = require('./lib/augmentGenerator')

function removeToken (err) {
  delete err.error
  delete err.options
  delete err.response
  return err
}

function getNextUrl (linkHeader) {
  const next = linkHeader.split(',').find(l => l.search(/rel="next"$/) !== -1)

  const url = next && next.match(/<(.*?)>/)
  return url && url[1]
}

module.exports = (apiUrl, apiKey, options = {}) => {
  const log = options.log || (() => {})

  const resolve = endpoint => {
    const base2 = apiUrl.slice(-1) === '/' ? apiUrl.slice(0, -1) : apiUrl
    const endpoint2 = endpoint.charAt(0) === '/' ? endpoint.slice(1) : endpoint

    return base2 + '/' + endpoint2
  }

  const canvasGot = got.extend({
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    json: true
  })

  async function requestUrl (endpoint, method = 'GET', body = {}, options = {}) {
    const url = resolve(endpoint)

    log(`Request ${method} ${url}`)
    try {
      const result = await canvasGot({
        body: body,
        url,
        method,
        ...options
      })

      log(`Response from ${method} ${url}`)
      return result
    } catch (err) {
      throw removeToken(err)
    }
  }

  async function get (endpoint, queryParams = {}) {
    return requestUrl(endpoint, 'GET', {}, { query: queryParams })
  }

  async function * list (endpoint, queryParams = {}) {
    for await (let page of listPaginated(endpoint, queryParams)) {
      log(`Traversing a page...`)

      for (let element of page) {
        yield element
      }
    }
  }

  async function * listPaginated (endpoint, queryParams = {}) {
    try {
      let url = resolve(endpoint)

      while (url) {
        log(`Request GET ${url}`)

        const response = await canvasGot.get({
          query: queryParams,
          url
        })

        log(`Response from GET ${url}`)
        yield response.body
        url = response.headers && response.headers.link && getNextUrl(response.headers.link)
        queryParams = null
      }
    } catch (err) {
      throw removeToken(err)
    }
  }

  return {
    requestUrl,
    get,
    list: augmentGenerator(list),
    listPaginated: augmentGenerator(listPaginated)
  }
}
