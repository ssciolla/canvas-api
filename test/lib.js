const test = require('ava')
const augmentGenerator = require('../lib/augmentGenerator')

test('augmentGenerator does not mutate the original generator', t => {
  function * gen () {
    yield 1
  }

  augmentGenerator(gen())

  t.falsy(gen().take)
})

test('augmentGenerator returns a valid generator', t => {
  function * gen () {
    yield 1
  }

  const g2 = augmentGenerator(gen)

  for (const v of g2()) {
    t.is(v, 1)
  }
})
