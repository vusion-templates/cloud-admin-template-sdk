import type Project from '../project';
import type Page from '../page';
export interface ProjectPath {
    getFullPath(): string;
}
export type LevelType = Project | Page ;
export enum LEVEL_ENUM {
    project= 'project',
    page= 'page',
    service= 'service',
    auth= 'auth',
    view= 'view',
}