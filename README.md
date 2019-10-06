# gulp-api-adapter #

This plugin allows gulp tasks to interact with REST APIs or other http/https endpoints. It provides a .src() function which replaces gulp.src(), allowing remote files to be downloaded as the starting point for a gulp task. There is also a .dest() function, which allows files in a gulp stream to be uploaded.

Finally, there is a .transform() function, which treats the remote URL as a function which transforms the existing file (which is uploaded as the body of an HTTP request) into the returned file (the body of the response).

This plugin is a gulp wrapper for [request](https://www.npmjs.com/package/request).

## Usage ##

The plugin accepts a configObj as the first parameter; the configObj
will contain any info the plugin needs. The configObj is the "Options" object for [request](https://www.npmjs.com/package/request), described [here](https://www.npmjs.com/package/request#requestoptions-callback).

### Sample gulpfile.js ###

``` javascript
var gulp = require('gulp')
var targetCsv = require('gulp-etl-target-csv').targetCsv

exports.default = function() {
    return gulp.src('data/*.ndjson')
    .on('data', function (file) {
        console.log('Starting processing on ' + file.basename)
    })  
    .pipe(targetCsv({header:true}))
    .on('data', function (file) {
        console.log('Done processing on ' + file.basename)
    })  
    .pipe(gulp.dest('data/'));
}
```

### Quick Start for Coding on This Plugin ##

* Dependencies:
  * [git](https://git-scm.com/downloads)
  * [nodejs](https://nodejs.org/en/download/releases/) - At least v6.3 (6.9 for Windows) required for TypeScript debugging
  * npm (installs with Node)
  * typescript - installed as a development dependency
* Clone this repo and run `npm install` to install npm packages
* Debug: with [VScode](https://code.visualstudio.com/download) use `Open Folder` to open the project folder, then hit F5 to debug. This runs without compiling to javascript using [ts-node](https://www.npmjs.com/package/ts-node)
* Test: `npm test` or `npm t`
* Compile to javascript: `npm run build`

### Testing ##

We are using [Jest](https://facebook.github.io/jest/docs/en/getting-started.html) for our testing. Each of our tests are in the `test` folder.

* Run `npm test` to run the test suites

Note: This document is written in [Markdown](https://daringfireball.net/projects/markdown/). We like to use [Typora](https://typora.io/) and [Markdown Preview Plus](https://chrome.google.com/webstore/detail/markdown-preview-plus/febilkbfcbhebfnokafefeacimjdckgl?hl=en-US) for our Markdown work..
