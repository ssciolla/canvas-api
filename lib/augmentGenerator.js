module.exports = function augmentGenerator (generator) {
  return function (...args) {
    const iterator = generator(...args)

    iterator.take = async function () {
      return 1
    }

    return iterator
  }
}
