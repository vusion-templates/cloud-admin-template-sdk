import * as path from 'path';
import * as fs from 'fs-extra';
type Options = {
    willCreate?: boolean;
    defaultContent?: string;
};
export default class File {
    fileName: string;
    willCreate: string;
    constructor(fileName: string, options?: Options) {
        this.fileName = fileName;
        if (options && options.willCreate && !fs.existsSync(fileName)) {
            fs.mkdirpSync(path.dirname(fileName));
            fs.writeFileSync(fileName, options.defaultContent);
        }
    }
    exists(): ReturnType<typeof fs.existsSync> {
        return fs.existsSync(this.fileName);
    }
    loadOrCreate(content: any): string {
        if (!fs.existsSync(this.fileName)) {
            this.save(content || '');
        }
        return this.load();
    }
    loadJSONOrCreate(content: any): string {
        if (!fs.existsSync(this.fileName)) {
            this.save(content || '');
        }
        return this.loadJSON();
    }
    load(): string {
        return fs.readFileSync(this.fileName).toString();
    }
    save(content: string | object): ReturnType<typeof fs.writeFileSync> {
        fs.mkdirpSync(path.dirname(this.fileName));
        return fs.writeFileSync(this.fileName, typeof content === 'string' ? content : JSON.stringify(content, null, 4));
    }
    loadJSON(): ReturnType<typeof JSON.parse>{
        const content = this.load();
        return JSON.parse(content);
    }
    remove(): ReturnType<typeof fs.removeSync> {
        return fs.removeSync(this.fileName);
    }
}