"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.src = src;
exports.request = requestFunc;
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
const from2 = require('from2');
const url_1 = require("url");
/* This is a gulp plugin. It is compliant with best practices for Gulp plugins (see
https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md#what-does-a-good-plugin-look-like ) */
function src(url, options) {
    let result;
    try {
        let fileName = (0, url_1.parse)(url).pathname || "apiResult.dat";
        fileName = path.basename(fileName);
        let vinylFile;
        // create a file wrapper that will pretend to gulp that it came from the path represented by pretendFilePath
        vinylFile = new Vinyl({
            base: path.dirname(fileName),
            path: fileName
            // contents:
            // we'll set the contents below, for clarity
        });
        // from2 returns a writable stream; we put the vinyl file into the stream. This is the core of gulp: Vinyl files
        // inside streams
        result = from2.obj([vinylFile]);
        //
        // Now we set the contents of our vinyl file. For now we're using streams; we'll add buffer support later
        // We want to set our content to the stream produced by the request module:
        //
        // this doesn't work; request doesn't produce a stream when called this way. It doesn't have a .stream() function either...
        // vinylFile.contents = request(url) as any 
        // this works: set contents to a passthrough stream, and pipe the result of the request file through that passthrough stream
        // vinylFile.contents = through2.obj() // passthrough stream 
        // request(url).pipe(vinylFile.contents as unknown as any)
        // this works: same idea as above, but a cleaner
        // make a copy of configObj specific to this file, adding url and leaving original unchanged
        let optionsCopy = Object.assign({}, options, { "url": url });
        vinylFile.contents = request(optionsCopy).pipe(through2.obj());
    }
    catch (err) {
        // emitting here causes some other error: TypeError: Cannot read property 'pipe' of undefined
        // result.emit(new PluginError(PLUGIN_NAME, err))
        // For now, bubble error up to calling function
        throw new PluginError(PLUGIN_NAME, err);
    }
    return result;
}
function requestFunc(configObj) {
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
        // make a copy of configObj specific to this file, allowing gulp-data to override any shared settings and leaving original unchanged
        let config = Object.assign({}, configObj, file.data);
        if (file.basename) {
            let base = path.basename(file.basename, path.extname(file.basename));
            newFileName = base + '.response' + path.extname(file.basename);
        }
        let responseFile = new Vinyl({ path: newFileName });
        if (file.isNull() || returnErr) {
            // return empty file
            return cb(returnErr, file);
        }
        else if (file.isBuffer()) {
            // returnErr = new PluginError(PLUGIN_NAME, 'Buffer mode is not yet supported. Use gulp.src({buffer:false})...');
            config.body = file.contents;
            request.post(config, function (err, resp, body) {
                if (typeof body === "string") {
                    responseFile.contents = Buffer.from(body);
                }
                else
                    responseFile.contents = body;
                self.push(file);
                self.push(responseFile);
                return cb(returnErr);
            });
        }
        else if (file.isStream()) {
            let responseStream = through2.obj(); // passthrough stream 
            responseFile.contents = responseStream;
            file.contents
                .pipe(request(config))
                .on('response', function (response) {
                // testing
                log.debug(response.statusCode); // 200
                log.debug(response.headers['content-type']); // 'image/png'
                // log.debug(JSON.stringify(response.toJSON()))
            })
                .pipe(responseStream)
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
            self.push(file);
            self.push(responseFile);
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
//# sourceMappingURL=plugin.js.map