import { LEVEL_ENUM, LevelType } from './index';
export default class Tree {
    parent?: LevelType;
    level: LEVEL_ENUM;
    name: string;
    root: string;
    fullPath: string;
    constructor(name: string, root: string, level: LEVEL_ENUM, parent?: LevelType);
    getFullPath(): string;
    exists(): boolean;
    getLevel(level: LEVEL_ENUM): LevelType;
}
