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
const path = __importStar(require("path"));
const tree_1 = __importDefault(require("../common/tree"));
const file_1 = __importDefault(require("../common/file"));
const common_1 = require("../common");
const directory_1 = __importDefault(require("../common/directory"));
const utils_1 = require("../../utils");
class View extends tree_1.default {
    constructor(name, root, parent) {
        super(name, root, common_1.LEVEL_ENUM.view, parent);
        this.file = new file_1.default(this.fullPath);
    }
    getFullPath() {
        return View.getFullPath(this.root, this.name);
    }
    getContent() {
        return this.file.load();
    }
    static removeView(root, name) {
        const file = new file_1.default(View.getFullPath(root, name));
        if (!file.exists()) {
            throw new Error(`file is not exist`);
        }
        return file.remove();
    }
    static addView(root, name, options) {
        const file = new file_1.default(View.getFullPath(root, name));
        if (file.exists()) {
            throw new Error(`file is exist`);
        }
        const templateFile = new file_1.default(path.join(utils_1.templatePath, 'view/index.vue'));
        return file.save(templateFile.load());
    }
}
exports.default = View;
View.getFullPath = function (root, name) {
    return path.join(root, name, 'index.vue');
};
View.getViewsPath = function (root) {
    const dirOP = new directory_1.default(root);
    return dirOP.dirAll().filter((item) => {
        return item.endsWith('index.vue');
    }).map((item) => '/' + item.trim().replace('index.vue', '').replace(/\/$/, ''));
};
