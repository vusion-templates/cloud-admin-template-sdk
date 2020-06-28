"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_directory_1 = __importDefault(require("inquirer-directory"));
const add_1 = __importDefault(require("../plop/component/add"));
const add_2 = __importDefault(require("../plop/page/add"));
const remove_1 = __importDefault(require("../plop/page/remove"));
module.exports = function (plop) {
    plop.setPrompt('directory', inquirer_directory_1.default);
    plop.setGenerator('global component', add_1.default(plop));
    plop.setGenerator('add-page', add_2.default(plop));
    plop.setGenerator('remove-page', remove_1.default(plop));
};
