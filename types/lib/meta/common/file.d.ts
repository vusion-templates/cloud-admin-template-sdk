import * as fs from 'fs-extra';
declare type Options = {
    willCreate?: boolean;
    defaultContent?: string;
};
export default class File {
    fileName: string;
    willCreate: string;
    constructor(fileName: string, options?: Options);
    exists(): ReturnType<typeof fs.existsSync>;
    loadOrCreate(content: any): string;
    loadJSONOrCreate(content: any): string;
    load(): string;
    save(content: string | object): ReturnType<typeof fs.writeFileSync>;
    loadJSON(): ReturnType<typeof JSON.parse>;
    remove(): ReturnType<typeof fs.removeSync>;
}
export {};
