"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
class View {
    constructor(name, module, page, root, parent) {
        this.name = name;
        this.module = module;
        this.page = page;
        this.root = root;
        if (parent) {
            this.parent = parent;
        }
    }
    getFullPath() {
        return path.join(this.root, this.page, this.module, 'views', this.name);
    }
}
exports.default = View;
