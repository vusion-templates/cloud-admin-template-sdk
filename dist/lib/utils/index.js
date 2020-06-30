"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppConfig = exports.getFile = exports.fixSlash = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
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
