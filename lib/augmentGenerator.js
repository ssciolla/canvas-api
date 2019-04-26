module.exports = function augmentGenerator (generator) {
  return function (...args) {
    const iterable = generator(...args)

    iterable.toArray = async function () {
      const result = []

      for await (const v of iterable) {
        result.push(v)
      }

      return result
    }

    return iterable
  }
}
