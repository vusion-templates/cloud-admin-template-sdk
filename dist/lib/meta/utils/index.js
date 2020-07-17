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
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const node_plop_1 = __importDefault(require("node-plop"));
exports.default = {
    loadPages(root) {
        return JSON.parse(fs.readFileSync(path.join(root, './pages.json')).toString());
    },
    getPlop(config) {
        let file = path.join(process.cwd(), 'plopfile.js');
        if (!fs.existsSync(file)) {
            file = path.join(__dirname, '../../cli/plopfile.js');
        }
        const plop = node_plop_1.default(file, {
            destBasePath: config.root,
            force: !!config.force,
        });
        return plop;
    },
    getPagePath(answer) {
        return path.join(answer.root, answer.page);
    },
    getModulePath(answer) {
        return path.join(answer.root, answer.page, answer.module);
    },
    getViewPath(answer) {
        return path.join(answer.root, answer.page, answer.module, 'views');
    },
};
