const path = require("path");
const Generator = require("yeoman-generator");
const mkdir = require("mkdirp");

const OPTIONS = {
  appName: {
    desc: "What is the name of your application?",
    alias: "n",
    default: "myapp"
  },
  version: {
    desc: "What is the version of your application?",
    alias: "v",
    default: "0.0.1"
  },
  description: {
    desc: "Your project description",
    alias: "d",
    default: "Your project description"
  },
  user: {
    desc: "Your project user",
    alias: "u",
    default: process.env.USER
  },
  repo: {
    desc: "Project repository",
    alias: "r",
    default: `github.com/${process.env.USER}`
  }
};

const DEFAULT_OPTIONS = {
  desc: "",
  alias: "",
  type: "string"
};

const isDefined = x => !!x;

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.composeWith(
      "git-init",
      {},
      {
        local: require.resolve("generator-git-init")
      }
    );

    Object.keys(OPTIONS).forEach(key => {
      const obj = OPTIONS[key];
      this.option(key, {
        ...DEFAULT_OPTIONS,
        desc: obj["desc"],
        alias: obj["alias"],
        type: obj["type"]
      });
    });
  }

  paths() {
    this.destinationRoot(process.env.GOPATH || "./");
  }

  prompting() {
    this.log(`
+---------------------+
Go cli scaffold
+---------------------+
`);

    let cb = this.async();

    let prompts = Object.keys(OPTIONS).map(key => {
      const obj = OPTIONS[key];
      return Object.assign({}, DEFAULT_OPTIONS, {
        type: obj["type"] || "input",
        name: key,
        message: obj["desc"],
        default: obj["default"] || "",
        alias: obj["alias"]
      });
    });

    return this.prompt(prompts).then(props => {
      Object.keys(OPTIONS).forEach(key => {
        this[key] = isDefined(props[key]) ? props[key] : this.options[key];
      });
      this.appName = props.appName.replace(/\s+/g, "-").toLowerCase();
      cb();
    });
  }

  writing() {
    console.log("Generating tree folders");
    let pkgDir = this.destinationPath("pkg");
    let srcDir = this.destinationPath(
      path.join("src", this.repo, this.appName)
    );
    let binDir = this.destinationPath("bin");

    mkdir.sync(pkgDir);
    mkdir.sync(srcDir);
    mkdir.sync(binDir);

    let tmplContext = {
      appName: this.appName,
      version: this.version,
      description: this.description,
      user: this.user,
      repo: this.repo
    };

    const files = {
      _gitignore: ".gitignore",
      "version/_version.go": "version/version.go",
      "config/_config.go": "config/config.go",
      "config/_config_test.go": "config/config_test.go",
      "_default_app.json": "default_app.json"
    };

    const templates = {
      "_main.go": "main.go",
      _Makefile: "Makefile",
      "_README.md": "Readme.md",
      "_go.mod": "go.mod",
      "cmd/_version.go": "cmd/version.go",
      "cmd/_root.go": "cmd/root.go"
    };

    Object.keys(files).forEach(filename => {
      this.fs.copy(
        this.templatePath(filename),
        path.join(srcDir, files[filename])
      );
    });

    Object.keys(templates).forEach(filename => {
      this.fs.copyTpl(
        this.templatePath(filename),
        path.join(srcDir, templates[filename]),
        tmplContext
      );
    });
  }
};
