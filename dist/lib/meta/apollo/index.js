"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tree_1 = __importDefault(require("../common/tree"));
class Apollo extends tree_1.default {
    // based on path to generator gql & resolvers
    static updateApollo(root, json) {
        console.info(root);
        // generator code and write code
    }
}
exports.default = Apollo;
