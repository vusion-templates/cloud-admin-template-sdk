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
const service_1 = __importDefault(require("../service"));
const getRootPath = function (root) {
    return path.join(root, 'src/services');
};
function default_1(projectRoot, project) {
    const root = getRootPath(projectRoot);
    return {
        loadList() {
            return this.loadListPath().map((service) => {
                return this.load(service);
            });
        },
        loadListPath() {
            return service_1.default.getServicesPath(root);
        },
        load(name) {
            return new service_1.default(name, root, project);
        },
        remove(name) {
            return service_1.default.remove({
                root,
                name,
            });
        },
        add(name, api) {
            return service_1.default.add({
                root,
                name,
                api,
            });
        }
    };
}
exports.default = default_1;
