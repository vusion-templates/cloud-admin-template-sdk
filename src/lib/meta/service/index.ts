import * as fs from 'fs-extra';
import * as path from 'path';
import { templatePath } from '../../utils';
import { ProjectPath, LEVEL_ENUM } from '../common';
import Tree from '../common/Tree';
import File from '../common/File';
import Directory from '../common/Directory';
import type Project from '../Project';
interface ServicePath {
    root: string;
    name: string;
}
export interface AddService extends ServicePath {
    api?: string;
}
export type RemoveService = ServicePath
type serviceContent = {
    api?: string;
    config?: string;
    index?: string;
};
export default class Service extends Tree implements ProjectPath{
    public subFiles: {
        api: File;
        config: File;
        index: File;
    }
    
    static getServicesPath = function (root: string): string[] {
        const services = new Directory(root).dir();
        return services;
    }

    constructor(name: string, root: string, parent: Project) {
        super(name, root, LEVEL_ENUM.service, parent);
        this.subFiles = {
            api:  new File(path.join(this.fullPath, 'api.json')),
            config: new File(path.join(this.fullPath, 'api.config.js')),
            index: new File(path.join(this.fullPath, 'index.js')),
        };
    }
    
    getFullPath(): string {
        return path.join(this.root, this.name);
    }
    public load(): serviceContent {
        return {
            api: this.subFiles.api.load(),
            config: this.subFiles.config.load(),
            index: this.subFiles.index.load(),
        };
    }
    public save(content: serviceContent): void {
        content.api && this.subFiles.api.save(content.api);
        content.config && this.subFiles.api.save(content.config);
        content.index && this.subFiles.api.save(content.index);
    }
    public rename(newName: string): void {
        new Directory(this.fullPath).rename(newName);
    }
    static add(answers?: AddService): void {
        const dir = path.join(answers.root, answers.name);
        const tplPath = path.resolve(templatePath, 'service');
        fs.copySync(tplPath, dir);
        if (answers.api) {
            const api = new File(path.join(dir, 'api.json'));
            api.save(answers.api);
        }
    }
    static remove(answers: RemoveService): void {
        const dir = path.join(answers.root, answers.name);
        return new Directory(dir).remove();
    }
}