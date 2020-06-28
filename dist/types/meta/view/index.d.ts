import { ProjectPath } from '../common';
export default class View<T> implements ProjectPath {
    name: string;
    module: string;
    page: string;
    root: string;
    parent?: T;
    constructor(name: string, module: string, page: string, root: string, parent?: T);
    getFullPath(): string;
}
