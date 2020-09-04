import { LEVEL_ENUM, LevelType } from './index';
import * as path from 'path';
import * as fs from 'fs-extra';

export default class Tree {
    public parent?: LevelType;
    public level: LEVEL_ENUM;
    /**
     * 唯一标识
     */
    public name: string;
    /**
     * 根路径
     */
    public root: string;
    public fullPath: string;

    constructor(name: string, root: string, level: LEVEL_ENUM, parent?: LevelType) {
        this.level = level;
        this.name = name;
        this.root = root;
        this.fullPath = this.getFullPath();
        this.parent = parent;
    }
    public getFullPath(): string {
        return path.join(this.root, this.name);
    }
    public exists(): boolean {
        return fs.existsSync(this.fullPath);
    }
    public getLevel(level: LEVEL_ENUM): LevelType {
        let p = this as any;
        while(p && p.level !== level) {
            p = p.parent;
        }
        return p as LevelType;
    }
}