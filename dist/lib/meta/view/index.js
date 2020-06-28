"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
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
        return path_1.default.join(this.root, this.page, this.module, 'views', this.name);
    }
}
exports.default = View;
