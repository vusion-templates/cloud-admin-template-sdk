import * as path from "path";
import File from "../common/File";
export interface PageMeta {
  options?: {
    auth: boolean;
    isIndex: boolean;
  };
}
export default class MetaData {
  public root: string;
  public name: string;
  public isIndex: boolean;
  constructor(root: string, name: string) {
    this.root = root;
    this.name = name;
    try {
      const context = this.load();
      this.isIndex = context.options.isIndex;
    } catch (error) {
      console.log(error);
    }
  }
  public load(): PageMeta {
    const pages = new File(path.join(this.root, "pages.json"));
    const json = pages.loadJSON();
    if (!json[this.name]) {
      throw new Error(`page:${this.name} isn't exists`);
    }
    return json[this.name];
  }
  public save(content: PageMeta): void {
    const pages = new File(path.join(this.root, "pages.json"));
    const json = pages.loadJSON();
    if (content.options) {
      content.options = {
        ...(json[this.name] || {}).options,
        ...content.options,
      };
    }
    json[this.name] = Object.assign({}, json[this.name], content);
    pages.save(json);
  }
}
