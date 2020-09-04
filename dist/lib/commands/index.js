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
        'config.resolve': function () {
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
        'view.list'(page) {
            return project.page.load(page).view.loadList();
        },
        'view.add': function (page, view, options) {
            return project.page.load(page).view.add(view, options);
        },
        'view.remove': function (page, view) {
            return project.page.load(page).view.remove(view);
        },
        'view.detail': function (page, view, viewInfo) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield project.page.load(page).view.load(view).getViewContent(viewInfo);
            });
        },
        'view.mergeCode': function (page, view, code, nodePath) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield project.page.load(page).view.load(view).mergeCode(code, nodePath);
            });
        },
        'view.saveCode': function (page, view, type, content) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield project.page.load(page).view.load(view).saveCode(type, content);
            });
        },
        'view.addBlock': function (page, view, blockInfo) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield project.page.load(page).view.load(view).addBlock(blockInfo);
            });
        },
        'view.addCustomComponent': function (page, view, blockInfo, content) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield project.page.load(page).view.load(view).addCustomComponent(blockInfo, content);
            });
        },
    };
}
exports.default = default_1;
