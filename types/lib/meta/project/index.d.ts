import Component, { AddComponent } from '../component';
import { PlopConfig } from '../utils';
import { ProjectPath } from '../common';
import Tree from '../common/Tree';
import configResolve from './config/resolve';
import { ParseTypes, loadCustomComponentsData, loadCustomComponentData, loadUILibrary } from './deps';
import Auth from './auth';
import type { PageOP } from './page';
import type { ServiceOP } from './service';
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
    page: PageOP;
    service: ServiceOP;
    constructor(root: string);
    loadDeps(parseTypes?: ParseTypes, baseName?: string): ReturnType<typeof loadCustomComponentsData>;
    loadDep(name: string, parseTypes?: ParseTypes): ReturnType<typeof loadCustomComponentData>;
    getPackage(): any;
    loadUILibrary(name: string, parseTypes?: ParseTypes): ReturnType<typeof loadUILibrary>;
    config(): ReturnType<typeof configResolve>;
    getFullPath(): string;
    private getSubPath;
    addComponent(answers: AddComponent, config?: PlopConfig): ReturnType<typeof Component.add>;
}
