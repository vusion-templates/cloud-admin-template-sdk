import { AddComponent } from '../component';
import { PlopConfig } from '../utils';
import { ProjectPath } from '../common';
import Tree from '../common/Tree';
import { ParseTypes } from './deps';
import Auth from './auth';
import getPage from './page';
import getService from './service';
/**
 * 项目类
 */
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
    page: ReturnType<typeof getPage>;
    service: ReturnType<typeof getService>;
    constructor(root: string);
    loadDeps(parseTypes?: ParseTypes, baseName?: string): Promise<any[]>;
    loadDep(name: string, parseTypes?: ParseTypes): Promise<any>;
    getPackage(): any;
    loadUILibrary(name: string, parseTypes?: ParseTypes): any;
    config(): import("./config/getDefaults").VusionConfig;
    getFullPath(): string;
    private getSubPath;
    addComponent(answers: AddComponent, config?: PlopConfig): Promise<any>;
}
