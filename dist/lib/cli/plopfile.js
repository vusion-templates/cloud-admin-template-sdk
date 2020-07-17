"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_directory_1 = __importDefault(require("inquirer-directory"));
const add_1 = __importDefault(require("../plop/component/add"));
const add_2 = __importDefault(require("../plop/page/add"));
const remove_1 = __importDefault(require("../plop/page/remove"));
const add_3 = __importDefault(require("../plop/view/add"));
const remove_2 = __importDefault(require("../plop/view/remove"));
const add_4 = __importDefault(require("../plop/service/add"));
const remove_3 = __importDefault(require("../plop/service/remove"));
const project_1 = __importDefault(require("../meta/project"));
module.exports = function (plop) {
    plop.$project = new project_1.default(plop.getDestBasePath());
    plop.setPrompt('directory', inquirer_directory_1.default);
    plop.setGenerator('global component', add_1.default(plop));
    plop.setGenerator('page.add', add_2.default(plop));
    plop.setGenerator('page.remove', remove_1.default(plop));
    plop.setGenerator('view.add', add_3.default(plop));
    plop.setGenerator('view.remove', remove_2.default(plop));
    plop.setGenerator('service.add', add_4.default(plop));
    plop.setGenerator('service.remove', remove_3.default(plop));
};
