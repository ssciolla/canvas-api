const rp = require('request-promise')

module.exports = (apiUrl, apiKey, options = {}) => {
  return {
    async requestUrl (endpoint, method = 'GET', parameters) {
      try {
        return rp({
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
      } catch (err) {
        throw err
      }
    }
  }
}
