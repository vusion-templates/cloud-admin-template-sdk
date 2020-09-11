"use strict";
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
const project_1 = __importDefault(require("../meta/project"));
function default_1(root) {
    const project = new project_1.default(root);
    return {
        'config.resolve'() {
            return project.config();
        },
        'page.list'() {
            return project.page.loadList();
        },
        'page.add'(answers) {
            return project.page.add(answers);
        },
        'page.remove'(answers) {
            return project.page.remove(answers);
        },
        'auth.load': function () {
            return project.auth.load();
        },
        'auth.saveItem': function (...args) {
            return project.auth.addItem(...args);
        },
        'auth.removeItem': function (...args) {
            return project.auth.removeItem(...args);
        },
        'client.package': function () {
            return project.getPackage();
        },
        'component.module.list': function (...args) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield project.loadDeps(...args);
            });
        },
        'component.module': function (...args) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield project.loadDep(...args);
            });
        },
        'ui.library': function (...args) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield project.loadUILibrary(...args);
            });
        },
        'service.list': function () {
            return project.service.loadListPath();
        },
        'service.add': function (...args) {
            return project.service.add(...args);
        },
        'service.remove': function (...args) {
            return project.service.remove(...args);
        },
        'view.list'(pageName) {
            return project.page.load(pageName).view.loadList();
        },
        'view.subList'(pageName, viewPath) {
            return project.page.load(pageName).view.loadSubList(viewPath);
        },
        'view.tree'(pageName) {
            return project.page.load(pageName).view.loadTree();
        },
        'view.add': function (pageName, viewPath, options) {
            return project.page.load(pageName).view.add(viewPath, options);
        },
        'view.remove': function (pageName, viewPath) {
            return project.page.load(pageName).view.remove(viewPath);
        },
        'view.detail': function (pageName, viewPath) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield project.page.load(pageName).view.load(viewPath).getContent();
            });
        },
        'view.vueFile': function (pageName, viewPath) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield project.page.load(pageName).view.load(viewPath).loadVueFile();
            });
        },
        'view.savePartialCode': function (pageName, viewPath, type, content) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield project.page.load(pageName).view.load(viewPath).savePartialCode(type, content);
            });
        },
        'view.mergeCode': function (pageName, viewPath, code, nodePath) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield project.page.load(pageName).view.load(viewPath).mergeCode(code, nodePath);
            });
        },
        'view.addBlock': function (pageName, viewPath, blockInfo) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield project.page.load(pageName).view.load(viewPath).addBlock(blockInfo);
            });
        },
        'view.addCustomComponent': function (pageName, viewPath, blockInfo, content) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield project.page.load(pageName).view.load(viewPath).addCustomComponent(blockInfo, content);
            });
        },
    };
}
exports.default = default_1;
