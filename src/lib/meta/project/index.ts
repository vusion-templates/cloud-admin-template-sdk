
import Component, { AddComponent } from '../component';
import { PlopConfig } from '../utils';
import { ProjectPath, LEVEL_ENUM } from '../common';
import Tree from '../common/tree';
import * as path from 'path';
import * as fs from 'fs-extra';
import File from '../common/file';
import configResolve from './config/resolve';
import { ParseTypes, loadCustomComponentsData, loadCustomComponentData, loadUILibrary } from './deps';
import Auth from './auth';
import getPage from './page';
import type { PageOP } from './page';
import getService from './service';
import type { ServiceOP } from './service';

const getName = function(dir): string {
    const packagePath = path.join(dir, 'package.json');
    let name = path.basename(dir);
    if (fs.existsSync(packagePath)) {
        name = new File(packagePath).loadJSON().name; 
    }
    return name;
}
export default class Project extends Tree implements ProjectPath {

    public clientPath: string;
    public serverPath: string;
    public auth: Auth;
    public page: PageOP;
    public service: ServiceOP;

    constructor(root: string) {
        const name = getName(root);
        super(name, root, LEVEL_ENUM.project, null);
        this.clientPath = this.getSubPath('client');
        const server = this.getSubPath('server');
        this.serverPath = server === root ? '' : server;
        this.auth = new Auth(this.clientPath, this);
        this.page = getPage(this.clientPath);
        this.service = getService(this.clientPath);
    }
    public async loadDeps(parseTypes: ParseTypes = {}, baseName?: string): ReturnType<typeof loadCustomComponentsData> {
        return await loadCustomComponentsData(this, parseTypes, baseName);
    }
    public async loadDep(name: string, parseTypes: ParseTypes = {}): ReturnType<typeof loadCustomComponentData> {
        return await loadCustomComponentData(this, name, parseTypes);
    }
    public getPackage(): any {
        return new File(path.join(this.clientPath, 'package.json')).loadJSON();
    }
    getFullPath(): string{
        return this.root;
    }
    public loadUILibrary(name: string, parseTypes: ParseTypes = {}): ReturnType<typeof loadUILibrary> {
        return loadUILibrary(name, this, parseTypes);
    }
    public config(): ReturnType<typeof configResolve> {
        return configResolve(path.join(this.clientPath));
    }
    private getSubPath(subPath: string): string {
        const clientPath = path.join(this.fullPath, subPath);
        if (fs.existsSync(clientPath)){
            return clientPath;
        }
        return this.fullPath;
    }
    public addComponent(answers: AddComponent, config?: PlopConfig): ReturnType<typeof Component.add> {
        return Component.add(answers, {
            root: this.clientPath,
            ...config,
        });
    }
}