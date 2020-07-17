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
class File {
    constructor(fileName, options) {
        this.fileName = fileName;
        if (options && options.willCreate && !fs.existsSync(fileName)) {
            fs.mkdirpSync(path.dirname(fileName));
            fs.writeFileSync(fileName, options.defaultContent);
        }
    }
    exists() {
        return fs.existsSync(this.fileName);
    }
    loadOrCreate(content) {
        if (!fs.existsSync(this.fileName)) {
            this.save(content || '');
        }
        return this.load();
    }
    loadJSONOrCreate(content) {
        if (!fs.existsSync(this.fileName)) {
            this.save(content || '');
        }
        return this.loadJSON();
    }
    load() {
        return fs.readFileSync(this.fileName).toString();
    }
    save(content) {
        fs.mkdirpSync(path.dirname(this.fileName));
        return fs.writeFileSync(this.fileName, typeof content === 'string' ? content : JSON.stringify(content, null, 4));
    }
    loadJSON() {
        const content = this.load();
        return JSON.parse(content);
    }
    remove() {
        return fs.removeSync(this.fileName);
    }
}
exports.default = File;
