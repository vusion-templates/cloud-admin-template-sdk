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
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
/**
 * 同步处理文件夹
 */
class Directory {
    constructor(filePath) {
        this.filePath = filePath;
    }
    remove() {
        return fs.removeSync(this.filePath);
    }
    dir(options) {
        if (!fs.existsSync(this.filePath)) {
            return [];
        }
        return fs.readdirSync(this.filePath, options);
    }
    dirAll() {
        function getFiles(dir, result, prefix = '') {
            fs.readdirSync(dir, { withFileTypes: true }).forEach((file) => {
                if (file.isDirectory()) {
                    getFiles(path.join(dir, file.name), result, path.join(prefix, file.name));
                }
                else {
                    result.push(path.join(prefix, file.name));
                }
            });
            return result;
        }
        return getFiles(this.filePath, []);
    }
    rename(name) {
        return fs.renameSync(this.filePath, path.join(this.filePath, '..', name));
    }
}
exports.default = Directory;
