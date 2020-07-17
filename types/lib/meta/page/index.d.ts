import MetaData from './metaData';
import { PlopConfig } from '../utils';
import Tree from '../common/tree';
import { ProjectPath } from '../common';
import Routes from '../routes';
import type Project from '../project';
import type { ViewOP } from './view';
export interface AddPage {
    name: string;
    title: string;
    template?: string;
    auth?: boolean;
    isIndex?: boolean;
}
export interface RemovePage {
    name: string;
}
export default class Page extends Tree implements ProjectPath {
    metaData: MetaData;
    routes: Routes;
    view: ViewOP;
    constructor(name: string, root: string, parent: Project);
    static getPagesPath: (root: string) => string[];
    getFullPath(): string;
    static add(answers: AddPage, config: PlopConfig): Promise<any>;
    static remove(answers: RemovePage, config: PlopConfig): Promise<any>;
}
