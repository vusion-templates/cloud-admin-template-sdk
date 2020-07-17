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
const component_1 = __importDefault(require("../component"));
const common_1 = require("../common");
const tree_1 = __importDefault(require("../common/tree"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const file_1 = __importDefault(require("../common/file"));
const resolve_1 = __importDefault(require("./config/resolve"));
const deps_1 = require("./deps");
const auth_1 = __importDefault(require("./auth"));
const page_1 = __importDefault(require("./page"));
const service_1 = __importDefault(require("./service"));
const getName = function (dir) {
    const packagePath = path.join(dir, 'package.json');
    let name = path.basename(dir);
    if (fs.existsSync(packagePath)) {
        name = new file_1.default(packagePath).loadJSON().name;
    }
    return name;
};
class Project extends tree_1.default {
    constructor(root) {
        const name = getName(root);
        super(name, root, common_1.LEVEL_ENUM.project, null);
        this.clientPath = this.getSubPath('client');
        const server = this.getSubPath('server');
        this.serverPath = server === root ? '' : server;
        this.auth = new auth_1.default(this.clientPath, this);
        this.page = page_1.default(this.clientPath);
        this.service = service_1.default(this.clientPath);
    }
    loadDeps(parseTypes = {}, baseName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield deps_1.loadCustomComponentsData(this, parseTypes, baseName);
        });
    }
    loadDep(name, parseTypes = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield deps_1.loadCustomComponentData(this, name, parseTypes);
        });
    }
    getPackage() {
        return new file_1.default(path.join(this.clientPath, 'package.json')).loadJSON();
    }
    getFullPath() {
        return this.root;
    }
    loadUILibrary(name, parseTypes = {}) {
        return deps_1.loadUILibrary(name, this, parseTypes);
    }
    config() {
        return resolve_1.default(path.join(this.clientPath));
    }
    getSubPath(subPath) {
        const clientPath = path.join(this.fullPath, subPath);
        if (fs.existsSync(clientPath)) {
            return clientPath;
        }
        return this.fullPath;
    }
    addComponent(answers, config) {
        return component_1.default.add(answers, Object.assign({ root: this.clientPath }, config));
    }
}
exports.default = Project;
