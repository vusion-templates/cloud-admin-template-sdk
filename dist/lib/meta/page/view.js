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
const view_1 = __importDefault(require("../view"));
const getRootPath = function (root) {
    return path.join(root, 'views');
};
function default_1(pageRoot, page) {
    const root = getRootPath(pageRoot);
    return {
        loadListPath() {
            return view_1.default.getViewsPath(root);
        },
        loadList() {
            return this.loadListPath().map((viewPath) => {
                return this.load(viewPath);
            });
        },
        loadTree() {
            function getChildren(view) {
                console.log(path.join(root, view.name));
                view.children = view_1.default.getViewsPath(path.join(root, view.name))
                    .filter((subPath) => subPath !== '/')
                    .map((subPath) => {
                    const viewPath = path.join(view.name, subPath);
                    const newView = new view_1.default(viewPath, root, page);
                    getChildren(newView);
                    return newView;
                });
            }
            const rootView = new view_1.default('/', root, page);
            getChildren(rootView);
            return rootView;
        },
        load(viewPath) {
            return new view_1.default(viewPath, root, page);
        },
        remove(viewPath) {
            return view_1.default.removeView(root, viewPath);
        },
        add(viewPath, options) {
            return view_1.default.addView(root, viewPath, options);
        },
    };
}
exports.default = default_1;
