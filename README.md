# gulp-rest #

*(this plugin is being developed from *[gulp-etl-target-csv](https://github.com/gulpetl/gulp-etl-target-csv/)*. The original readme from gulp-etl-target-csv is below)*

This plugin creates CSV files from **gulp-etl** **Message Stream** files; originally adapted from the [gulp-etl-handlelines](https://github.com/gulpetl/gulp-etl-handlelines) model plugin. It is a **gulp-etl** wrapper for [csv-stringify](https://csv.js.org/stringify/).

This is a **[gulp-etl](https://gulpetl.com/)** plugin, and as such it is a [gulp](https://gulpjs.com/) plugin. **gulp-etl** plugins work with [ndjson](http://ndjson.org/) data streams/files which we call **Message Streams** and which are compliant with the [Singer specification](https://github.com/singer-io/getting-started/blob/master/docs/SPEC.md#output). Message Streams look like this:

``` ndjson
{"type": "SCHEMA", "stream": "users", "key_properties": ["id"], "schema": {"required": ["id"], "type": "object", "properties": {"id": {"type": "integer"}}}}
{"type": "RECORD", "stream": "users", "record": {"id": 1, "name": "Chris"}}
{"type": "RECORD", "stream": "users", "record": {"id": 2, "name": "Mike"}}
{"type": "SCHEMA", "stream": "locations", "key_properties": ["id"], "schema": {"required": ["id"], "type": "object", "properties": {"id": {"type": "integer"}}}}
{"type": "RECORD", "stream": "locations", "record": {"id": 1, "name": "Philadelphia"}}
{"type": "STATE", "value": {"users": 2, "locations": 1}}
```

## Usage ##

**gulp-etl** plugins accept a configObj as the first parameter; the configObj
will contain any info the plugin needs. For this plugin the configObj is the "Options" object for [csv-stringify](https://csv.js.org/stringify/), described [here](https://csv.js.org/stringify/options/). *Note: `header` property is defaulted to true by this plugin.*

### Sample gulpfile.js ###

``` javascript
var gulp = require('gulp')
var rename = require('gulp-rename')
var targetCsv = require('gulp-etl-target-csv').targetCsv

exports.default = function() {
    return gulp.src('data/*.ndjson')
    .on('data', function (file) {
        console.log('Starting processing on ' + file.basename)
    })  
    .pipe(targetCsv({header:true}))
    .pipe(rename({ extname: ".csv" })) // rename to *.csv
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
