let gulp = require('gulp')
import * as apiAdapter from '../src/plugin'

import * as loglevel from 'loglevel'
const log = loglevel.getLogger('gulpfile')
log.setLevel((process.env.DEBUG_LEVEL || 'warn') as loglevel.LogLevelDesc)
// if needed, you can control the plugin's logging level separately from 'gulpfile' logging above
// const pluginLog = loglevel.getLogger(PLUGIN_NAME)
// pluginLog.setLevel('debug')

const errorHandler = require('gulp-error-handle'); // handle all errors in one handler, but still stop the stream if there are errors

const pkginfo = require('pkginfo')(module); // project package.json info into module.exports
const PLUGIN_NAME = module.exports.name;

import Vinyl = require('vinyl') 

let gulpBufferMode = false;

function switchToBuffer(callback: any) {
  gulpBufferMode = true;

  callback();
}

export function runApiRequest(callback: any) {
  log.info('gulp task starting for ' + PLUGIN_NAME)

  return gulp.src('../testdata/*.json',{buffer:gulpBufferMode})
    .pipe(errorHandler(function(err:any) {
      log.error('Error: ' + err)
      callback(err)
    }))
    .on('data', function (file:Vinyl) {
      log.info('Starting processing on ' + file.basename)
    })    
    .pipe(apiAdapter.request({url:"http://localhost:2019/data/saveChanges", method:"post", headers:{"Content-type": "application/json", 'Accept': 'application/json, text/plain, */*'}}))
    .pipe(gulp.dest('../testdata/processed'))
    .on('data', function (file:Vinyl) {
      log.info('Finished processing on ' + file.basename)
    })    
    .on('end', function () {
      log.info('gulp task complete')
      callback()
    })

}

function runApiSrc(callback: any) {
  log.info('gulp task starting for ' + PLUGIN_NAME)

  try {
    return apiAdapter.src("https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png", {buffer:gulpBufferMode})
      .pipe(errorHandler(function(err:any) {
        log.error('Error: ' + err)
        callback(err)
      }))
      .on('data', function (file:Vinyl) {
        log.info('Starting processing on ' + file.basename)
      }) 
      .pipe(gulp.dest('../testdata/processed'))
      .on('data', function (file:Vinyl) {
        log.info('Finished processing on ' + file.basename)
      })    
      .on('end', function () {
        log.info('gulp task complete')
        callback()
      })
    }
    catch (err) {
      log.error(err)
      callback(err);
    }

  }

exports.default = gulp.series(runApiRequest)
exports.runApiRequestBuffer = gulp.series(switchToBuffer, runApiRequest)
exports.runApiSrc = runApiSrc