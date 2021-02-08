const got = require("got");
const queryString = require("query-string");
const FormData = require("form-data");
const fs = require("fs");
const { augmentGenerator } = require("./utils");

function removeToken(err) {
  delete err.gotOptions;
  delete err.response;
  return err;
}

function getNextUrl(linkHeader) {
  const next = linkHeader
    .split(",")
    .find((l) => l.search(/rel="next"$/) !== -1);

  const url = next && next.match(/<(.*?)>/);
  return url && url[1];
}

module.exports = class CanvasAPI {
  constructor(apiUrl, apiKey, options = {}) {
    this.gotClient = got.extend({
      prefixUrl: apiUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      responseType: "json",
      ...options,
    });
  }

  async requestUrl(endpoint, method, body = {}, options = {}) {
    if (method === "GET") {
      throw new Error(
        "You cannot make a GET request with `requestUrl`. Use `get`, `list` or `listPaginated` instead"
      );
    }

    try {
      const result = await this.gotClient(endpoint, {
        method,
        body,
        ...options,
      });

      return result;
    } catch (err) {
      throw removeToken(err);
    }
  }

  async get(endpoint, queryParams = {}) {
    try {
      const result = await this.gotClient.get(endpoint, {
        searchParams: queryString.stringify(queryParams, {
          arrayFormat: "bracket",
        }),
      });

      return result;
    } catch (err) {
      throw removeToken(err);
    }
  }

  async *_listPaginated(endpoint, queryParams = {}, options = {}) {
    try {
      const first = await this.gotClient.get(endpoint, {
        searchParams: queryString.stringify(queryParams, {
          arrayFormat: "bracket",
        }),
        ...options,
      });

      yield first.body;
      let url =
        first.headers && first.headers.link && getNextUrl(first.headers.link);

      while (url) {
        const response = await this.gotClient.get(url, {
          prefixUrl: "",
          ...options,
        });

        yield response.body;
        url =
          response.headers &&
          response.headers.link &&
          getNextUrl(response.headers.link);
      }
    } catch (err) {
      throw removeToken(err);
    }
  }

  async *_list(endpoint, queryParams = {}, options = {}) {
    for await (const page of this._listPaginated(
      endpoint,
      queryParams,
      options
    )) {
      if (!Array.isArray(page)) {
        throw new Error(
          `The function ".list()" should be used with endpoints that return arrays. Use "get()" or "listPaginated" instead with the endpoint ${endpoint}.`
        );
      }

      for (const element of page) {
        yield element;
      }
    }
  }

  async sendSis(endpoint, attachment, body = {}) {
    const form = new FormData();

    for (const key in body) {
      form.append(key, body[key]);
    }

    form.append("attachment", fs.createReadStream(attachment));

    return this.gotClient
      .post(endpoint, {
        body: form,
      })
      .then((response) => {
        return response;
      });
  }

  listPaginated(endpoint, queryParams = {}, options = {}) {
    return augmentGenerator(
      this._listPaginated(endpoint, queryParams, options)
    );
  }

  list(endpoint, queryParams = {}, options = {}) {
    return augmentGenerator(this._list(endpoint, queryParams, options));
  }
};
