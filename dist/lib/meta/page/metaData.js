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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const File_1 = __importDefault(require("../common/File"));
class MetaData {
    constructor(root, name) {
        this.root = root;
        this.name = name;
    }
    load() {
        const pages = new File_1.default(path.join(this.root, 'pages.json'));
        const json = pages.loadJSON();
        if (!json[this.name]) {
            throw new Error(`page:${this.name} isn't exists`);
        }
        return json[this.name];
    }
    save(content) {
        const pages = new File_1.default(path.join(this.root, 'pages.json'));
        const json = pages.loadJSON();
        json[this.name] = Object.assign({}, json[this.name], content);
        pages.save(json);
    }
}
exports.default = MetaData;
