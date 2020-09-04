import MetaData from './MetaData';
import { PlopConfig } from '../utils';
import Tree from '../common/Tree';
import { ProjectPath } from '../common';
import Routes from '../routes';
import type Project from '../project';
import getView from './view';
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
    view: ReturnType<typeof getView>;
    constructor(name: string, root: string, parent: Project);
    static getPagesPath: (root: string) => string[];
    getFullPath(): string;
    static add(answers: AddPage, config: PlopConfig): Promise<any>;
    static remove(answers: RemovePage, config: PlopConfig): Promise<any>;
}
