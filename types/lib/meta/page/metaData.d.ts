export default class MetaData {
    root: string;
    name: string;
    constructor(root: string, name: string);
    load(): object;
    save(content: any): void;
}
