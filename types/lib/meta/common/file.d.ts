declare type Options = {
    willCreate?: boolean;
    defaultContent?: string;
};
/**
 * 同步处理文件类
 */
export default class File {
    filePath: string;
    constructor(filePath: string, options?: Options);
    exists(): boolean;
    loadOrCreate(content: any): string;
    loadJSONOrCreate(content: any): any;
    load(): string;
    save(content: string | object): void;
    loadJSON(): any;
    remove(): void;
}
export {};
