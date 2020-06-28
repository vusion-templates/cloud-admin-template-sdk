"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { PlopConfig } from '../utils';
// import * as fse from 'fs-extra';
const path_1 = __importDefault(require("path"));
class Service {
    constructor(name, module, page, root, parent) {
        this.name = name;
        this.module = module;
        this.page = page;
        this.root = root;
        if (parent) {
            this.parent = parent;
        }
    }
    getFullPath() {
        return path_1.default.join(this.root, this.page, this.module, 'service', this.name);
    }
    load() {
        // todo
    }
    save() {
        // todo
    }
    remove() {
        // todo
    }
    static add(answers) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve('');
        });
    }
    static remove(answers) {
        return Promise.resolve(true);
    }
}
exports.default = Service;
