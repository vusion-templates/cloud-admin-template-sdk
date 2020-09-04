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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const Tree_1 = __importDefault(require("../common/Tree"));
const File_1 = __importDefault(require("../common/File"));
const common_1 = require("../common");
const Directory_1 = __importDefault(require("../common/Directory"));
const utils_1 = require("../../utils");
const index_1 = require("vusion-api/src/designer/index");
class View extends Tree_1.default {
    constructor(name, root, parent) {
        super(name, root, common_1.LEVEL_ENUM.view, parent);
        this.file = new File_1.default(this.fullPath);
    }
    getFullPath() {
        return View.getFullPath(this.root, this.name);
    }
    getContent() {
        return this.file.load();
    }
    static removeView(root, name) {
        const file = new File_1.default(View.getFullPath(root, name));
        if (!file.exists()) {
            throw new Error(`file is not exist`);
        }
        return file.remove();
    }
    static addView(root, name, options) {
        const file = new File_1.default(View.getFullPath(root, name));
        if (file.exists()) {
            throw new Error(`file is exist`);
        }
        const templateFile = new File_1.default(path.join(utils_1.templatePath, 'view/index.vue'));
        return file.save(templateFile.load());
    }
    mergeCode(code, nodePath) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield index_1.mergeCode(this.fullPath, code, nodePath);
        });
    }
    saveCode(type, content) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield index_1.saveCode(this.fullPath, type, content);
        });
    }
    addBlock(blockInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield index_1.addBlock(this.fullPath, blockInfo);
        });
    }
    getViewContent(viewInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            viewInfo.fullPath = this.fullPath;
            return yield index_1.getViewContent(viewInfo);
        });
    }
    addCustomComponent(blockInfo, content) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield index_1.addCustomComponent(this.fullPath, this.getLevel(common_1.LEVEL_ENUM.project).getFullPath(), blockInfo, content);
        });
    }
}
exports.default = View;
View.getFullPath = function (root, name) {
    return path.join(root, name, 'index.vue');
};
View.getAllViewsPath = function (root) {
    const dirOP = new Directory_1.default(root);
    console.log(root, dirOP.dirAll());
    return dirOP.dirAll().filter((item) => {
        return item.endsWith('index.vue');
    }).map((item) => '/' + item.trim().replace('index.vue', '').replace(/\/$/, ''));
};
View.getViewsPath = function (root) {
    const dirOP = new Directory_1.default(root);
    console.log(root, dirOP.dir());
    return dirOP.dir().filter((item) => {
        return item.endsWith('index.vue');
    }).map((item) => '/' + item.trim().replace('index.vue', '').replace(/\/$/, ''));
};
