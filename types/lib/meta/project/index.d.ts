import { AddComponent } from '../component';
import { PlopConfig } from '../utils';
import { ProjectPath } from '../common';
import Tree from '../common/Tree';
import { ParseTypes } from './deps';
import Auth from './auth';
import type { PageOP } from './page';
import type { ServiceOP } from './service';
import type { ApolloOP } from './apollo';
export default class Project extends Tree implements ProjectPath {
    /**
     * 前端路径
     */
    clientPath: string;
    /**
     * BFF 层路径
     */
    serverPath: string;
    auth: Auth;
    page: PageOP;
    service: ServiceOP;
    apollo: ApolloOP;
    constructor(root: string);
    loadDeps(parseTypes?: ParseTypes, baseName?: string): Promise<Promise<{}>[]>;
    loadDep(name: string, parseTypes?: ParseTypes): Promise<{}>;
    getPackage(): any;
    loadUILibrary(name: string, parseTypes?: ParseTypes): Promise<import("vusion-api").Library>;
    config(): import("./config/getDefaults").VusionConfig;
    getFullPath(): string;
    private getSubPath;
    addComponent(answers: AddComponent, config?: PlopConfig): Promise<any>;
}
