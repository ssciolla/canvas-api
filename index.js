const rp = require('request-promise')
const { resolve } = require('url')

function removeToken (err) {
  delete err.error
  delete err.options
  delete err.response
  return err
}

function getNextUrl (linkHeader) {
  const next = linkHeader.split(',')
    .find(l => l.search(/rel=\"next\"$/))

  const url = next && next.match(/<(.*?)>/)
  return url && url[1]
}

module.exports = (apiUrl, apiKey, options = {}) => {
  const log = options.log || (() => {})

  return {
    async requestUrl (endpoint, method = 'GET', parameters = {}, extra = {}) {
      const url = resolve(apiUrl, endpoint)

      log(`Request ${method} ${url}`)
      try {
        const result = await rp({
          baseUrl: apiUrl,
          url: endpoint,
          json: true,
          resolveWithFullResponse: true,
          auth: {
            bearer: apiKey
          },
          body: parameters,
          method,
          ...extra
        })

        log(`Response from ${method} ${url}`)
        return result
      } catch (err) {
        throw removeToken(err)
      }
    },

    async get (endpoint, parameters = {}) {
      return requestUrl(endpoint, 'GET', {}, {qs: parameters})
    },

    async * list (endpoint, parameters = {}) {
      for await (let page of listPaginated(endpoint, parameters)) {
        log(`Traversing a page...`)
        for (let element of page) {
          yield element
        }
      }
    },

    async * listPaginated (endpoint, parameters = {}) {
      try {
        let url = resolve(apiUrl, endpoint)

        while (url) {
          log(`Request ${method} ${url}`)

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

          log(`Response from ${method} ${url}`)
          yield response.body

          url = getNextUrl(response.headers.link)
        }
      } catch (err) {
        throw removeToken(err)
      }
    }
  }
}
