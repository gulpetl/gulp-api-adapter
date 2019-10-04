"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Vinyl = require("vinyl");
const plugin_1 = require("../plugin");
const from2 = require('from2');
class lambdaResponse {
    constructor() {
        this.statusCode = 200;
        this.isBase64Encoded = false;
        this.headers = {
            // TODO: limit to a whitelist of allowed sites
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
        };
        this.body = ''; // set response body here
    }
}
function doParse(event, context, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(event);
        const response = new lambdaResponse();
        response.body = JSON.stringify({ message: 'this is a dummy body and should be replaced.' });
        const body = JSON.parse(event.body);
        const config = body.config;
        const toParse = body.toParse;
        let file;
        if (Vinyl.isVinyl(toParse)) {
            file = toParse;
        }
        else {
            file = new Vinyl({
                contents: Buffer.from(toParse)
            });
        }
        let result = '';
        try {
            from2.obj([file]).pipe(plugin_1.targetCsv({}))
                .on('data', function (data) {
                console.log(data.contents.toString());
                result += JSON.stringify(data) + '\n';
            })
                .on('error', function (err) {
                response.body = JSON.stringify(file);
                callback(err, response);
            })
                .on('end', function () {
                response.body = result;
                callback(null, response);
            });
        }
        catch (err) {
            callback(err, response);
        }
    });
}
exports.doParse = doParse;
//# sourceMappingURL=handler.js.map