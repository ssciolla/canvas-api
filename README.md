# Canvas API client

Node.JS HTTP client based on [got](https://github.com/sindresorhus/got) for the [Canvas LMS API](https://canvas.instructure.com/doc/api/)

[![Build Status](https://travis-ci.org/KTH/canvas-api.svg?branch=master)](https://travis-ci.org/KTH/canvas-api)

1. [Install](#install)
2. [Usage](#usage)
3. [API reference](docs/API.md)

## Install

```shell
npm i @kth/canvas-api
```

## Usage

```js
const CanvasApi = require('@kth/canvas-api')
// or, with ES modules:
// import CanvasApi from '@kth/canvas-api/esm'

async function start() {
  const canvas = CanvasApi('https://kth.instructure.com/api/v1', 'XXXX~xxxx')
  const { body } = await canvas.get('/accounts/1')
}

start()
```
