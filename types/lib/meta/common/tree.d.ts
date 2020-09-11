import { LEVEL_ENUM, LevelType } from './index';
export default class Tree {
    parent?: LevelType;
    level: LEVEL_ENUM;
    /**
     * 唯一标识
     */
    name: string;
    /**
     * 根路径
     */
    root: string;
    fullPath: string;
    constructor(name: string, root: string, level: LEVEL_ENUM, parent?: LevelType);
    getFullPath(): string;
    exists(): boolean;
    getLevel(level: LEVEL_ENUM): LevelType;
}
