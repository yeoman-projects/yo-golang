const path = require('path')
const assert = require('yeoman-assert')
const helpers = require('yeoman-test')

describe('generator-golang-project:app', () => {
  beforeAll(() => {
    return helpers
      .run(path.join(__dirname, '..', 'generators', 'app'))
      .withPrompts({
        name: 'myApp',
      })
  })

  it('creates files', () => {
    assert.noFile(['README.md'])
  })
})
