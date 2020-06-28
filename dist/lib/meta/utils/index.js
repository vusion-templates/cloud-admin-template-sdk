"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_plop_1 = __importDefault(require("node-plop"));
exports.default = {
    loadPages(root) {
        return JSON.parse(fs_1.default.readFileSync(path_1.default.join(root, './pages.json')).toString());
    },
    getPlop(config) {
        let file = path_1.default.join(process.cwd(), 'plopfile.js');
        if (!fs_1.default.existsSync(file)) {
            file = path_1.default.join(__dirname, '../../cli/plopfile.js');
        }
        const plop = node_plop_1.default(file, {
            destBasePath: config.root,
            force: !!config.force,
        });
        return plop;
    }
};
