/**
 * Converts a "normal generator" function to an "extended generator" function
 *
 * - A input (a normal generator) is a function that returns an
 *   Iterable object.
 * - The output (an "extended" generator) is a function that returns an
 *   ExtendedIterable, which is like a normal Iterable but with extra methods.
 */
module.exports = (generator) => function extendedGenerator (...args) {
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
