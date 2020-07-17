import type Project from '../project';
import type Page from '../page';
export interface ProjectPath {
    getFullPath(): string;
}
export declare type LevelType = Project | Page;
export declare enum LEVEL_ENUM {
    project = "project",
    page = "page",
    service = "service",
    auth = "auth",
    view = "view"
}
