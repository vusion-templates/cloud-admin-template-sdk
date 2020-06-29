"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_directory_1 = require("inquirer-directory");
const add_1 = require("../plop/component/add");
const add_2 = require("../plop/page/add");
const remove_1 = require("../plop/page/remove");
module.exports = function (plop) {
    plop.setPrompt('directory', inquirer_directory_1.default);
    plop.setGenerator('global component', add_1.default(plop));
    plop.setGenerator('add-page', add_2.default(plop));
    plop.setGenerator('remove-page', remove_1.default(plop));
};
