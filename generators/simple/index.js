const BaseGenerator = require('../app')

module.exports = class extends BaseGenerator {
  writing() {
    this.writeFiles({
      '_main.go': 'main.go',
    })

    this.writeTemplates({
      '_README.md': 'README.md',
    })
  }
}
