"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const node_plop_1 = require("node-plop");
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
    }
};
