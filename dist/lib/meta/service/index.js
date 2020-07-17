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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const utils_1 = require("../../utils");
const common_1 = require("../common");
const tree_1 = __importDefault(require("../common/tree"));
const file_1 = __importDefault(require("../common/file"));
const directory_1 = __importDefault(require("../common/directory"));
class Service extends tree_1.default {
    constructor(name, root, parent) {
        super(name, root, common_1.LEVEL_ENUM.service, parent);
        this.subFiles = {
            api: new file_1.default(path.join(this.fullPath, 'api.json')),
            config: new file_1.default(path.join(this.fullPath, 'api.config.js')),
            index: new file_1.default(path.join(this.fullPath, 'index.js')),
        };
    }
    getFullPath() {
        return path.join(this.root, this.name);
    }
    load() {
        return {
            api: this.subFiles.api.load(),
            config: this.subFiles.config.load(),
            index: this.subFiles.index.load(),
        };
    }
    save(content) {
        content.api && this.subFiles.api.save(content.api);
        content.config && this.subFiles.api.save(content.config);
        content.index && this.subFiles.api.save(content.index);
    }
    rename(newName) {
        new directory_1.default(this.fullPath).rename(newName);
    }
    static add(answers) {
        const dir = path.join(answers.root, answers.name);
        const tplPath = path.resolve(utils_1.templatePath, 'service');
        fs.copySync(tplPath, dir);
        if (answers.api) {
            const api = new file_1.default(path.join(dir, 'api.json'));
            api.save(answers.api);
        }
    }
    static remove(answers) {
        const dir = path.join(answers.root, answers.name);
        return new directory_1.default(dir).remove();
    }
}
exports.default = Service;
Service.getServicesPath = function (root) {
    const services = new directory_1.default(root).dir();
    return services;
};
