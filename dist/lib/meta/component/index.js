"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __importDefault(require("../utils"));
class Component {
    static add(answers, config) {
        const plop = utils_1.default.getPlop(config);
        return plop.getGenerator('add-component').runActions(answers);
    }
}
exports.default = Component;
