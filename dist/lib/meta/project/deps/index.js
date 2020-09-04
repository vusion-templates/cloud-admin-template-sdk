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
exports.loadUILibrary = exports.loadCustomComponentData = exports.loadCustomComponentsData = void 0;
const module_1 = __importDefault(require("../../component/module"));
const path = __importStar(require("path"));
const designer_1 = require("vusion-api/src/designer");
exports.loadCustomComponentsData = function loadCustomComponentsData(project, parseTypes = {}, baseName) {
    return __awaiter(this, void 0, void 0, function* () {
        const pkg = project.getPackage();
        const pkgDeps = pkg.dependencies || {};
        const components = Object.keys(pkgDeps).filter((name) => {
            if (baseName)
                return name.includes(baseName + '.vue');
            else
                return name.endsWith('.vue');
        });
        const tasks = components.map((name) => __awaiter(this, void 0, void 0, function* () { return yield new module_1.default(name, project.clientPath).parse(parseTypes); }));
        return yield Promise.all(tasks);
    });
};
exports.loadCustomComponentData = function loadCustomComponentData(project, name, parseTypes = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new module_1.default(name, project.clientPath).parse(parseTypes);
    });
};
exports.loadUILibrary = function (name, project, parseTypes = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield designer_1.loadExternalLibrary(path.join(project.clientPath, 'node_modules', name), parseTypes);
    });
};
