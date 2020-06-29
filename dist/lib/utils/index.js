"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppConfig = exports.getFile = exports.fixSlash = void 0;
const path = require("path");
const fs = require("fs");
exports.fixSlash = function (filePath) {
    return filePath.split(path.sep).join('/');
};
exports.getFile = function (filePath) {
    let obj;
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8').trim().replace(/export default |module\.exports +=/, '');
        try {
            // eslint-disable-next-line no-eval
            obj = eval('(function(){return ' + content + '})()');
        }
        catch (e) {
            // do noting
        }
    }
    return obj;
};
exports.getAppConfig = function (pagePath) {
    const appConfig = exports.getFile(path.join(pagePath, 'app.config.js'));
    return appConfig;
};
