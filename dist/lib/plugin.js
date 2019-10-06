"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const through2 = require('through2');
const Vinyl = require("vinyl");
const PluginError = require("plugin-error");
const pkginfo = require('pkginfo')(module); // project package.json info into module.exports
const PLUGIN_NAME = module.exports.name;
const loglevel = require("loglevel");
const log = loglevel.getLogger(PLUGIN_NAME); // get a logger instance based on the project name
log.setLevel((process.env.DEBUG_LEVEL || 'warn'));
const request = require("request");
const path = require("path");
/* This is a gulp plugin. It is compliant with best practices for Gulp plugins (see
https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md#what-does-a-good-plugin-look-like ) */
function transform(configObj) {
    if (!configObj)
        configObj = {};
    // override configObj defaults here, if needed
    // if (configObj.header === undefined) configObj.header = true
    // creating a stream through which each file will pass - a new instance will be created and invoked for each file 
    // see https://stackoverflow.com/a/52432089/5578474 for a note on the "this" param
    const strm = through2.obj(function (file, encoding, cb) {
        const self = this;
        let returnErr = null;
        let newFileName = "";
        if (file.basename) {
            let base = path.basename(file.basename, path.extname(file.basename));
            newFileName = base + '.response' + path.extname(file.basename);
        }
        if (file.isNull() || returnErr) {
            // return empty file
            return cb(returnErr, file);
        }
        else if (file.isBuffer()) {
            returnErr = new PluginError(PLUGIN_NAME, 'Buffer mode is not yet supported. Use gulp.src({buffer:false})...');
            // return unchanged file
            return cb(returnErr, file);
        }
        else if (file.isStream()) {
            let newStream = through2.obj(function (file, encoding, cb) {
                cb(null, file);
            });
            let newFile = new Vinyl({ path: newFileName, contents: newStream });
            file.contents
                .pipe(request(configObj))
                .on('response', function (response) {
                // testing
                log.debug(response.statusCode); // 200
                log.debug(response.headers['content-type']); // 'image/png'
                // log.debug(JSON.stringify(response.toJSON()))
            })
                .pipe(newStream)
                .on('end', function () {
                // DON'T CALL THIS HERE. It MAY work, if the job is small enough. But it needs to be called after the stream is SET UP, not when the streaming is DONE.
                // Calling the callback here instead of below may result in data hanging in the stream--not sure of the technical term, but dest() creates no file, or the file is blank
                // cb(returnErr, file);
                // log.debug('calling callback')    
                log.debug(PLUGIN_NAME + ' is done');
            })
                .on('error', function (err) {
                log.error(err);
                self.emit('error', new PluginError(PLUGIN_NAME, err));
            });
            // In this order, both files are written correctly by dest();
            this.push(file);
            this.push(newFile);
            // in THIS order newFile is still written correctly, and file
            // is written but is blank. If either line is commented 
            // out, the other line writes correctly
            // this.push(newFile)
            // this.push(file)
            // after our stream is set up (not necesarily finished) we call the callback
            log.debug('calling callback');
            cb(returnErr);
        }
    });
    return strm;
}
exports.transform = transform;
//# sourceMappingURL=plugin.js.map