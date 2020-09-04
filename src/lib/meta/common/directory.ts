import * as path from 'path';
import * as fs from 'fs-extra';

export default class Directory {
    public filePath: string;
    constructor(filePath: string) {
        this.filePath = filePath;
    }
    remove() {
        return fs.removeSync(this.filePath);
    }
    dir(options?: any): string[] {
        if (!fs.existsSync(this.filePath)) {
            return [];
        }
        return fs.readdirSync(this.filePath, options);
    }
    dirAll(): string[] {
        function getFiles (dir: string, result: string[], prefix = ''): string[] {
            fs.readdirSync(dir, { withFileTypes: true }).forEach((file) => {
                    if (file.isDirectory()) {
                        getFiles(path.join(dir, file.name), result, path.join(prefix, file.name));
                    } else {
                        result.push(path.join(prefix, file.name));
                    }
            });
            return result;
        }
        return getFiles(this.filePath, []);
    }
    rename(name: string) {
        return fs.renameSync(this.filePath, path.join(this.filePath, '..', name));
    }
}