import File from '../../common/file';
import { ProjectPath } from '../../common';
import Tree from '../../common/tree';
import type Project from '..';
export default class Auth extends Tree implements ProjectPath {
    private fileOP;
    constructor(root: string, parent: Project);
    getFullPath(): string;
    load(): string;
    removeItem(name: string): ReturnType<File["remove"]>;
    addItem(name: string): ReturnType<File["save"]>;
}
