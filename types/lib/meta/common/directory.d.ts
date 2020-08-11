import * as fs from 'fs-extra';
export default class Directory {
    directoryPath: string;
    constructor(directoryPath: string);
    remove(): ReturnType<typeof fs.removeSync>;
    dir(options?: any): string[];
    dirAll(): string[];
    rename(name: any): ReturnType<typeof fs.renameSync>;
}
