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
  return {
    async requestUrl (endpoint, method = 'GET', parameters = {}) {
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
          method
        })
        return result
      } catch (err) {
        throw removeToken(err)
      }
    },

    async * requestPaginated (endpoint, parameters = {}) {
      try {
        let url = resolve(apiUrl, endpoint)

        while (url) {
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

          yield response.body

          url = getNextUrl(response.headers.link)
        }
      } catch (err) {
        throw removeToken(err)
      }
    }
  }
}
