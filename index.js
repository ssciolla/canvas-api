const rp = require('request-promise')
require('colors')
const fs = require('fs')

let apiKey, apiUrl, rootAccount

function requestCanvas (url, method = 'GET', data) {
  return requestUrl(url, method, data).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors)
    } else {
      return Promise.resolve(result)
    }
  })
}

function requestUrl (subUrl, method = 'GET', json) {
  const url = `${apiUrl}/${subUrl}`

  console.log('url', url)
  return rp({
    url,
    auth: {
      'bearer': apiKey
    },
    resolveWithFullResponse: true,
    method,
    json,
    headers: {
      'content-type': 'application/json'
    }

  })
    .then(res => json ? res.body : JSON.parse(res.body))
    // dont log entire error since that includes the access token
    .catch(e => {
      // Don't include everything in the error, since the request object
      // contain the access token. And we do not wan´t to log that.
      const strippedError = new Error(e.message)
      strippedError.statusCode = e.statusCode
      strippedError.statusMessage = e.statusMessage
      throw strippedError
    })
}

function getRootAccount () {
  return listAccounts()
          .then(accounts => accounts.find(account => account.name === 'KTH Royal Institute of Technology' && account.workflow_state == 'active'))
          .then(account => account.id)
}

function listAccounts () {
  return requestCanvas('accounts')
}

function recursePages (url, out) {
  function _getPage (url) {
    console.log('get page'.yellow, url)
    return rp({
      transform: (body, response) => {
        return {body, headers: response.headers} },
      url,
      auth: {
        'bearer': apiKey
      },
      headers: {
        'content-type': 'application/json'
      }
    })
  }

  return _getPage(url)
    .then(({body, headers}) => {
      out.push(JSON.parse(body))

      const arrayOfRelHeaders = headers.link.split(',').map(rel => rel.split(';'))

      const nextPageHeader = arrayOfRelHeaders.filter(([urlTag, rel]) => /next/.test(rel))
      if (nextPageHeader && nextPageHeader.length && nextPageHeader[0].length) {
        const [[nextUrlTag]] = nextPageHeader
        console.log('recurse',nextUrlTag.slice(1, nextUrlTag.length - 1))
        return recursePages(nextUrlTag.slice(1, nextUrlTag.length - 1), out)
      } else {
        return out
      }
    })
}

function listUsers () {
  const result = []
  return rootAccount
    .then(accountId => recursePages(`${apiUrl}/accounts/${accountId}/users?per_page=100`, result))
    .then(users => [].concat.apply([], users)) // flatten array
}

function createUser (user) {
  return rootAccount
    .then(accountId => {
      console.log('requestCanvas', user)
      return requestCanvas(`accounts/${accountId}/users`, 'POST', user) })
}

function updateUser (user, id) {
  return requestCanvas(`users/${id}`, 'PUT', user)
}

function createCourse (course, accountId) {
  console.log(`creating course
${JSON.stringify(course, null, 4)}
    on account ${accountId}`)
  return requestCanvas(`accounts/${accountId}/courses`, 'POST', course)
}

function listCourses () {
  const result = []

  return rootAccount
    .then(accountId => recursePages(`${apiUrl}/accounts/${accountId}/courses?per_page=100`, result))
    .then(() => [].concat.apply([], result)) // flatten array
}

function listSubaccounts (parentAccountId) {
  const result = []
  return rootAccount
    .then(accountId => recursePages(`${apiUrl}/accounts/${parentAccountId}/sub_accounts?per_page=100`, result))
    .then(() => [].concat.apply([], result)) // flatten array
}

/**
usage example:

canvasApi.findCourse('ML1318HT161')
  .then(result => console.log('course found', result))
  .catch(e => { if (e.statusCode === 404) {
    // not found
    console.log('course not found')
  } else {
    // something else went wrong
  } })
*/
function findCourse (sisCourseId) {
  return requestCanvas(`courses/sis_course_id:${sisCourseId}`)
}

function findUser (userName) {
  return requestCanvas(`search/recipients?search=${userName}`)
    .then(foundUsers => {
      if (foundUsers.length === 1) {
        return foundUsers[0]
      } else {
        return Promise.reject(`Couldn't return exactly one user, since the query returned ${foundUsers.length} users`)
      }
    })
}

function enrollUser (course, user, type) {
  const body = {enrollment: {'user_id': user.id, type, 'notify': true}}
  return requestCanvas(`courses/${course.id}/enrollments `, 'POST', body)
}

function getUser (kth_id) {
  return requestCanvas(`users/sis_user_id:${kth_id}`)
}

function getCourse (unique_id) {
  return requestCanvas(`courses/sis_course_id:${unique_id}`)
}

function sendCsvFile (filename, json=false,account=1, options={}) {
  const {batchMode, batchTerm} = options
  console.log('Ready to send CSV file: ' + filename, batchMode, batchTerm)
  var formData = {
    attachment: [
      fs.createReadStream(filename)
    ]
  }
  const url = `${apiUrl}/accounts/${account}/sis_imports${batchMode?'?batch_mode=1':''}${batchTerm?'&batch_mode_term_id='+batchTerm:''}`
  console.log('url', url)

  return rp({
    url,
    auth: {
      'bearer': apiKey
    },
    method: 'POST',
    headers: {
      'content-type': 'multipart/form-data'
    },
    formData,
    json
  })
}

/*
This function returns an object with all the exported functions,
but has to be called with apiKey and apiUrl.

example:
const canvasApi = require('./canvasApi')('http://my.canvas.api', 'my canvas key')
*/

module.exports = function init (_apiUrl, _apiKey) {
  apiUrl = _apiUrl
  apiKey = _apiKey

  rootAccount = getRootAccount()

  return {
    getUser,
    getCourse,
    getRootAccount,
    listAccounts,
    listUsers,
    createUser,
    createCourse,
    listSubaccounts,
    updateUser,
    requestCanvas,
    listCourses,
    findCourse,
    enrollUser,
    sendCsvFile
  }
}
