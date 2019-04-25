module.exports = function augmentGenerator (generator) {
  return function (...args) {
    const iterable = generator(...args)

    iterable.take = async function (count = Infinity) {
      const result = []
      const iterator = iterable[Symbol.asyncIterator]()

      while (result.length < count) {
        const { value, done } = await iterator.next()

        if (done) {
          break
        }

        result.push(value)
      }

      return result
    }

    return iterable
  }
}
