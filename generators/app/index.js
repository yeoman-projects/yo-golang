'use strict'

const path = require('path')
const Generator = require('yeoman-generator')
const chalk = require('chalk')
const mkdir = require('mkdirp')
const yoOptionOrPrompt = require('yo-option-or-prompt').default

const DEFAULT_OPTIONS = {
  desc: '',
  alias: '',
  type: 'input',
}

const RAW_OPTIONS = {
  name: {
    desc: 'What is the name of your application?',
    alias: 'n',
    default: 'myapp',
    optionType: String,
  },
  appVersion: {
    desc: 'What is the version of your application?',
    alias: 'v',
    default: '0.0.1',
    optionType: String,
  },
  description: {
    desc: 'Your project description',
    alias: 'd',
    default: 'Your project description',
    optionType: String,
  },
  user: {
    desc: 'Your project user',
    alias: 'u',
    default: process.env.USER,
    optionType: String,
  },
  appPath: {
    desc: 'What is the root path for your project (ex: github.com/auser)',
    alias: 'r',
    optionType: String,
    default: path.join('github.com', process.env.USER),
  },
  typeToGenerate: {
    desc: 'What kind of golang project do you want to build?',
    type: 'list',
    choices: ['simple', 'cli'],
  },
}
const OPTIONS = Object.keys(RAW_OPTIONS).reduce((sum, key) => {
  return {
    ...sum,
    [key]: {
      ...DEFAULT_OPTIONS,
      ...RAW_OPTIONS[key],
    },
  }
}, {})

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts)

    Object.keys(opts).forEach(key => {
      this.config.set(key, opts[key])
    })

    this.config.save()
  }

  initializing() {
    Object.keys(OPTIONS).forEach(key => {
      const obj = OPTIONS[key]
      if (obj.optionType) {
        const optionOpts = {
          name: key,
          desc: obj.desc,
          alias: obj.alias,
          type: obj.optionType,
        }
        this.option(key, optionOpts)
      }
    })

    this._prompts = Object.keys(OPTIONS).map(key => {
      const obj = OPTIONS[key]
      return {
        name: key,
        ...obj,
      }
    })

    this.optionOrPrompt = yoOptionOrPrompt
  }

  paths() {
    this.destinationRoot(process.env.GOPATH || './')
  }

  prompting() {
    this.log(
      chalk.hex('#6fd6e3').bold(`
+---------------------+
Golang project scaffold
+---------------------+
`)
    )

    let cb = this.async()

    return this.optionOrPrompt(this._prompts).then(props => {
      Object.keys(OPTIONS).forEach(key => {
        this[key] = props[key] || this.options[key]
      })
      this.appName = this.name.replace(/\s+/g, '-').toLowerCase()
      this.appPath = path.join(this.appPath, this.appName)
      cb()
    })
  }

  configuring() {
    let pkgDir = this.destinationPath(path.join(process.env.GOPATH, 'pkg'))
    let srcDir = this.destinationPath(
      path.join(process.env.GOPATH, 'src', this.appPath)
    )
    let binDir = this.destinationPath(path.join(process.env.GOPATH, 'bin'))

    mkdir.sync(pkgDir)
    mkdir.sync(srcDir)
    mkdir.sync(binDir)

    // For later
    this.srcDir = srcDir
    this.pkgDir = pkgDir
    this.binDir = binDir

    let tmplContext = {
      appName: this.appName,
      version: this.appVersion,
      description: this.description,
      user: this.user,
      repo: this.repo,
    }

    this.tmplContext = tmplContext
  }

  default() {}
  writing() {}
  conflicts() {}
  install() {}
  end() {}

  writeFiles(files = {}) {
    Object.keys(files).forEach(filename => {
      this.fs.copy(
        this.templatePath(filename),
        path.join(this.config.get('srcDir'), files[filename])
      )
    })
  }

  writeTemplates(templates = {}) {
    Object.keys(templates).forEach(filename => {
      this.fs.copyTpl(
        this.templatePath(filename),
        path.join(this.config.get('srcDir'), templates[filename]),
        this.config.get('tmplContext')
      )
    })
  }

  exec() {
    const opts = {
      ...this.options,
      tmplContext: this.tmplContext,
      srcDir: this.srcDir,
      pkgDir: this.pkgDir,
      binDir: this.binDir,
    }
    switch (this.typeToGenerate) {
      case 'cli':
        this.log('Generating a cli')
        this.composeWith(
          {
            Generator: require('../cli'),
            path: require.resolve('../cli'),
          },
          opts
        )
        break
      case 'simple':
        this.log('Generating a simple app')
        this.composeWith(
          {
            Generator: require('../simple'),
            path: require.resolve('../simple'),
          },
          opts
        )
        break
      default:
        this.log('Unknown type')
    }
  }
}
