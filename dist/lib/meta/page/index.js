"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __importDefault(require("../utils"));
const path_1 = __importDefault(require("path"));
class Page {
    constructor(name, root, parent) {
        this.name = name;
        this.root = root;
        if (parent) {
            this.parent = parent;
        }
    }
    getFullPath() {
        return path_1.default.join(this.root, this.name);
    }
    static add(answers, config) {
        const plop = utils_1.default.getPlop(config);
        return plop.getGenerator('add-page').runActions(answers);
    }
    static remove(answers, config) {
        const plop = utils_1.default.getPlop(config);
        return plop.getGenerator('remove-page').runActions(answers);
    }
}
exports.default = Page;
