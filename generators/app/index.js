const path = require("path");
const Generator = require("yeoman-generator");
const mkdir = require("mkdirp");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.option("appName");
    this.option("version");
    this.option("description");
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

    let prompts = [
      {
        type: "input",
        name: "appName",
        message: "What is the name of your application?",
        default: "myapp"
      },
      {
        type: "input",
        name: "version",
        message: "Version",
        default: "0.0.1"
      },
      {
        type: "input",
        name: "description",
        message: "Description",
        default: `Your project description`
      }
    ];

    return this.prompt(prompts).then(props => {
      this.appName = props.appName.replace(/\s+/g, "-").toLowerCase();
      this.version = props.version;
      this.description = props.description;
      cb();
    });
  }

  writing() {
    console.log("Generating tree folders");
    let pkgDir = this.destinationPath("pkg");
    let srcDir = this.destinationPath(path.join("src", this.appName));
    let binDir = this.destinationPath("bin");

    mkdir.sync(pkgDir);
    mkdir.sync(srcDir);
    mkdir.sync(binDir);

    let tmplContext = {
      appName: this.appName,
      version: this.version,
      description: this.description
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
      this.fs.copy(
        this.templatePath(filename),
        path.join(srcDir, templates[filename]),
        tmplContext
      );
    });

    // this.fs.copy(
    //   this.templatePath("_gitignore"),
    //   path.join(srcDir, ".gitignore")
    // );

    // this.fs.copyTpl(
    //   this.templatePath("_main.go"),
    //   path.join(srcDir, "main.go"),
    //   tmplContext
    // );
  }
};
