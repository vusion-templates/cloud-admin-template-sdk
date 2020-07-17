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
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
class Directory {
    constructor(directoryPath) {
        this.directoryPath = directoryPath;
    }
    remove() {
        return fs.removeSync(this.directoryPath);
    }
    dir(options) {
        if (!fs.existsSync(this.directoryPath)) {
            return [];
        }
        return fs.readdirSync(this.directoryPath, options);
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
        return getFiles(this.directoryPath, []);
    }
    rename(name) {
        return fs.renameSync(this.directoryPath, path.join(this.directoryPath, '..', name));
    }
}
exports.default = Directory;
