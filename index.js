const rp = require('request-promise')

function removeToken (err) {
  delete err.error
  delete err.options
  delete err.response
  return err
}

function getNextUrl (linkHeader) {
  const next = linkHeader.split(',').find(l => l.search(/rel="next"$/))

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

  async function requestUrl (endpoint, method = 'GET', parameters = {}, extra = {}) {
    const url = resolve(endpoint)

    log(`Request ${method} ${url}`)
    try {
      const result = await rp({
        json: true,
        resolveWithFullResponse: true,
        auth: {
          bearer: apiKey
        },
        body: parameters,
        url,
        method,
        ...extra
      })

      log(`Response from ${method} ${url}`)
      return result
    } catch (err) {
      throw removeToken(err)
    }
  }

  async function get (endpoint, parameters = {}) {
    return requestUrl(endpoint, 'GET', {}, { qs: parameters })
  }

  async function * list (endpoint, parameters = {}) {
    for await (let page of listPaginated(endpoint, parameters)) {
      log(`Traversing a page...`)
      for (let element of page) {
        yield element
      }
    }
  }

  async function * listPaginated (endpoint, parameters = {}) {
    try {
      let url = resolve(endpoint)

      while (url) {
        log(`Request GET ${url}`)

        const response = await rp({
          method: 'GET',
          json: true,
          resolveWithFullResponse: true,
          auth: {
            bearer: apiKey
          },
          qs: {
            per_page: 100,
            ...parameters
          },
          url
        })

        log(`Response from GET ${url}`)
        yield response.body

        url = getNextUrl(response.headers.link)
      }
    } catch (err) {
      throw removeToken(err)
    }
  }

  return {
    requestUrl,
    get,
    list,
    listPaginated
  }
}
