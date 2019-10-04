"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let gulp = require('gulp');
const plugin_1 = require("./plugin");
var plugin_2 = require("./plugin");
exports.handlelines = plugin_2.handlelines;
// handleLine could be the only needed piece to be replaced for most dataTube plugins
const handleLine = (lineObj) => {
    //console.log(line)
    for (let propName in lineObj) {
        let obj = lineObj;
        if (typeof (obj[propName]) == "string")
            obj[propName] = obj[propName].toUpperCase();
    }
    return lineObj;
};
function build_plumber(callback) {
    let result;
    result =
        gulp.src('../InputOutput/testdata/*', { buffer: false }) //, { buffer: false }
            .pipe(plugin_1.handlelines({ propsToAdd: { extraParam: 1 } }, { transformCallback: handleLine }))
            .on('error', console.error.bind(console))
            .pipe(gulp.dest('../InputOutput/output/processed'))
            .on('end', function () {
            console.log('end');
            callback();
        })
            .on('error', function (err) {
            console.error(err);
            callback(err);
        });
    return result;
}
exports.default = gulp.series(build_plumber);
//# sourceMappingURL=gulpfile.js.map