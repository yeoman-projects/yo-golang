const BaseGenerator = require('../app')

module.exports = class extends BaseGenerator {
  writing() {
    this.writeFiles({
      _gitignore: '.gitignore',
      'config/_config.go': 'config/config.go',
      'config/_config_test.go': 'config/config_test.go',
      '_default_app.json': 'default_app.json',
    })

    this.writeTemplates({
      '_main.go': 'main.go',
      _Makefile: 'Makefile',
      '_README.md': 'Readme.md',
      '_go.mod': 'go.mod',
      'version/_version.go': 'version/version.go',
      'cmd/_version.go': 'cmd/version.go',
      'cmd/_root.go': 'cmd/root.go',
    })
  }

  end() {
    const opts = { cwd: this.config.get('srcDir') }
    this.log(`Getting dependencies`)
    this.spawnCommandSync('make', ['get-deps'], opts)

    this.log('Initializing git repository')
    this.spawnCommandSync('git', ['init', '--quiet'], opts)
    this.log('Adding all files')
    this.spawnCommandSync('git', ['add', '--all'], opts)
    this.spawnCommandSync('git', ['commit', '-am', 'initial commit'], opts)
  }
}
