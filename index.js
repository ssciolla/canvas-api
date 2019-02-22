const rp = require('request-promise')

function removeToken (err) {
  delete err.error
  delete err.options
  delete err.response
  return err
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
    }
  }
}
