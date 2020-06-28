"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const page_1 = require("../page");
const component_1 = require("../component");
const path = require("path");
class Project {
    constructor(root) {
        this.root = root;
    }
    getFullPath() {
        return path.join(this.root);
    }
    addComponent(answers, config) {
        return component_1.default.add(answers, Object.assign({ root: this.root }, config));
    }
    addPage(answers, config) {
        return page_1.default.add(answers, Object.assign({ root: this.root }, config));
    }
    removePage(answers, config) {
        return page_1.default.remove(answers, Object.assign({ root: this.root }, config));
    }
    getPage(page) {
        return new page_1.default(page, this.root, this);
    }
    getPages(page) {
        return [new page_1.default(page, this.root, this)];
    }
}
exports.default = Project;
