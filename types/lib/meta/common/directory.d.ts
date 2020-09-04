export default class Directory {
    filePath: string;
    constructor(filePath: string);
    remove(): void;
    dir(options?: any): string[];
    dirAll(): string[];
    rename(name: string): void;
}
