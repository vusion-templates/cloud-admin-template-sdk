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
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
class Tree {
    constructor(name, root, level, parent) {
        this.level = level;
        this.name = name;
        this.root = root;
        this.fullPath = this.getFullPath();
        this.parent = parent;
    }
    getFullPath() {
        return path.join(this.root, this.name);
    }
    exists() {
        return fs.existsSync(this.fullPath);
    }
    getLevel(level) {
        let p = this;
        while (p.level !== level) {
            p = p.parent;
        }
        return p;
    }
}
exports.default = Tree;
