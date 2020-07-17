import * as fs from 'fs-extra';
import * as path from 'path';
export default class Directory {
    public directoryPath: string;
    constructor(directoryPath: string) {
        this.directoryPath = directoryPath;
    }
    remove(): ReturnType<typeof fs.removeSync> {
        return fs.removeSync(this.directoryPath);
    }
    dir(options?): string[]{
        if (!fs.existsSync(this.directoryPath)) {
            return [];
        }
        return fs.readdirSync(this.directoryPath, options);
    }
    dirAll(): string[]{
        function getFiles (dir, result, prefix = ''): string[] {
            fs.readdirSync(dir, {withFileTypes: true}).forEach((file) => {
                    if (file.isDirectory()) {
                        getFiles(path.join(dir, file.name), result, path.join(prefix, file.name));
                    } else {
                        result.push(path.join(prefix, file.name));
                    }
            });
            return result;
        }
        return getFiles(this.directoryPath, []);
    }
    rename(name): ReturnType<typeof fs.renameSync> {
        return fs.renameSync(this.directoryPath, path.join(this.directoryPath, '..', name));
    }
}