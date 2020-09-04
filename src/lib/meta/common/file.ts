import * as path from 'path';
import * as fs from 'fs-extra';

type Options = {
    willCreate?: boolean;
    defaultContent?: string;
};

/**
 * 同步处理文件类
 */
export default class File {
    filePath: string;
    constructor(filePath: string, options?: Options) {
        this.filePath = filePath;
        if (options && options.willCreate && !fs.existsSync(filePath)) {
            fs.ensureFileSync(filePath);
            fs.writeFileSync(filePath, options.defaultContent);
        }
    }
    exists() {
        return fs.existsSync(this.filePath);
    }
    loadOrCreate(content: any): string {
        if (!fs.existsSync(this.filePath)) {
            this.save(content || '');
        }
        return this.load();
    }
    loadJSONOrCreate(content: any): any {
        if (!fs.existsSync(this.filePath)) {
            this.save(content || '');
        }
        return this.loadJSON();
    }
    load(): string {
        return fs.readFileSync(this.filePath).toString();
    }
    save(content: string | object) {
        fs.ensureFileSync(this.filePath);
        return fs.writeFileSync(this.filePath, typeof content === 'string' ? content : JSON.stringify(content, null, 4));
    }
    loadJSON() {
        const content = this.load();
        return JSON.parse(content);
    }
    remove() {
        return fs.removeSync(this.filePath);
    }
}