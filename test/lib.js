const test = require('ava')
const augmentGenerator = require('../lib/augmentGenerator')

test('augmentGenerator does not mutate the original generator', t => {
  async function * gen () {
    yield 1
  }

  augmentGenerator(gen())

  t.falsy(gen().take)
})

test('augmentGenerator returns a valid generator', async t => {
  async function * gen () {
    yield 1
  }

  const g2 = augmentGenerator(gen)

  for await (const v of g2()) {
    t.is(v, 1)
  }
})

test('AugmentedIterator.take works without arguments', async t => {
  const gen = augmentGenerator(async function * () {
    yield 1
    yield 2
    yield 3
  })

  t.deepEqual(await gen().take(), [1, 2, 3])
})
