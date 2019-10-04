const through2 = require('through2')
import Vinyl = require('vinyl')
import PluginError = require('plugin-error');
const pkginfo = require('pkginfo')(module); // project package.json info into module.exports
const PLUGIN_NAME = module.exports.name;
import * as loglevel from 'loglevel'
const log = loglevel.getLogger(PLUGIN_NAME) // get a logger instance based on the project name
log.setLevel((process.env.DEBUG_LEVEL || 'warn') as loglevel.LogLevelDesc)
import replaceExt = require('replace-ext')

const stringify = require('csv-stringify')
const split = require('split2')

/** wrap incoming recordObject in a Singer RECORD Message object*/
function createRecord(recordObject:Object, streamName: string) : any {
  return {type:"RECORD", stream:streamName, record:recordObject}
}

/* This is a gulp-etl plugin. It is compliant with best practices for Gulp plugins (see
https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md#what-does-a-good-plugin-look-like ),
and like all gulp-etl plugins it accepts a configObj as its first parameter */
export function targetCsv(configObj: any) {
  if (!configObj) configObj = {}
  if (configObj.header === undefined) configObj.header = true // we default header to true, the expected default behavior for general usage

  // creating a stream through which each file will pass - a new instance will be created and invoked for each file 
  // see https://stackoverflow.com/a/52432089/5578474 for a note on the "this" param
  const strm = through2.obj(function (this: any, file: Vinyl, encoding: string, cb: Function) {
    const self = this
    let returnErr: any = null
    let stringifier
    
    file.path=replaceExt(file.path, '.csv')

    try {
      stringifier = stringify(configObj)
    }
    catch (err) {
      returnErr = new PluginError(PLUGIN_NAME, err);
    }

    // preprocess line object
    const handleLine = (lineObj: any, _streamName : string): object | null => {
      lineObj = lineObj.record
      return lineObj
    }

    function newTransformer(streamName : string) {

      let transformer = through2.obj(); // new transform stream, in object mode
  
      // transformer is designed to follow split2, which emits one line at a time, so dataObj is an Object. We will finish by converting dataObj to a text line
      transformer._transform = function (dataLine: string, encoding: string, callback: Function) {
        let returnErr: any = null
        try {
          let dataObj
          if (dataLine.trim() != "") dataObj = JSON.parse(dataLine)
          let handledObj = handleLine(dataObj, streamName)
          if (handledObj) {
            let handledLine = JSON.stringify(handledObj)
            log.debug(handledLine)
            this.push(handledObj);
          }
        } catch (err) {
          returnErr = new PluginError(PLUGIN_NAME, err);
        }
  
        callback(returnErr)
      }
  
      return transformer
    }

    // set the stream name to the file name (without extension)
    let streamName : string = file.stem

    if (file.isNull() || returnErr) {
      // return empty file
      return cb(returnErr, file)
    }
    else if (file.isBuffer()) {
      try {
        const linesArray = (file.contents as Buffer).toString().split('\n')
        let tempLine: any
        let resultArray = [];
        // we'll call handleLine on each line
        for (let dataIdx in linesArray) {
          try {
            if (linesArray[dataIdx].trim() == "") continue
            let lineObj = JSON.parse(linesArray[dataIdx])
            tempLine = handleLine(lineObj, streamName)
            if (tempLine){
              let tempStr = JSON.stringify(tempLine)
              log.debug(tempStr)
              resultArray.push(tempLine);
            }
          } catch (err) {
            returnErr = new PluginError(PLUGIN_NAME, err);
          }
        }

        stringify(resultArray, configObj, function(err:any, data:string){
          // this callback function runs when the stringify finishes its work, returning an array of CSV lines
          if (err) returnErr = new PluginError(PLUGIN_NAME, err)
          else file.contents = Buffer.from(data)
          
          // we are done with file processing. Pass the processed file along
          log.debug('calling callback')    
          cb(returnErr, file);    
        })
      }
      catch (err) {
        returnErr = new PluginError(PLUGIN_NAME, err);
        return cb(returnErr, file)        
      }

    }
    else if (file.isStream()) {
      file.contents = file.contents
        // split plugin will split the file into lines
        .pipe(split())
        .pipe(newTransformer(streamName))
        .pipe(stringifier)
        .on('end', function () {

          // DON'T CALL THIS HERE. It MAY work, if the job is small enough. But it needs to be called after the stream is SET UP, not when the streaming is DONE.
          // Calling the callback here instead of below may result in data hanging in the stream--not sure of the technical term, but dest() creates no file, or the file is blank
          // cb(returnErr, file);
          // log.debug('calling callback')    

          log.debug('csv parser is done')
        })
        // .on('data', function (data:any, err: any) {
        //   log.debug(data)
        // })
        .on('error', function (err: any) {
          log.error(err)
          self.emit('error', new PluginError(PLUGIN_NAME, err));
        })

      // after our stream is set up (not necesarily finished) we call the callback
      log.debug('calling callback')    
      cb(returnErr, file);
    }

  })

  return strm
}