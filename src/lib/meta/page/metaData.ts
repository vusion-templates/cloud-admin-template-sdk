import * as path from 'path';
import File from '../common/file';
export default class MetaData {
    public root: string;
    public name: string;
    constructor(root: string, name: string) {
        this.root = root;
        this.name = name;
    }
    public load(): object {
        const pages = new File(path.join(this.root, 'pages.json'));
        const json = pages.loadJSON();
        if (!json[this.name]) {
            throw new Error(`page:${this.name} isn't exists`);
        }
        return json[this.name];
    }
    public save(content): void {
        const pages = new File(path.join(this.root, 'pages.json'));
        const json = pages.loadJSON();
        json[this.name] = Object.assign({}, json[this.name], content);
        pages.save(json);
    }
}