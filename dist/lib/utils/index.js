"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppConfig = exports.getFile = exports.fixSlash = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
exports.fixSlash = function (filePath) {
    return filePath.split(path_1.default.sep).join('/');
};
exports.getFile = function (filePath) {
    let obj;
    if (fs_1.default.existsSync(filePath)) {
        const content = fs_1.default.readFileSync(filePath, 'utf8').trim().replace(/export default |module\.exports +=/, '');
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
    const appConfig = exports.getFile(path_1.default.join(pagePath, 'app.config.js'));
    return appConfig;
};
