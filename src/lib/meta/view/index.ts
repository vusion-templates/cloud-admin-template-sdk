import * as path from "path";
import Tree from "../common/Tree";
import File from "../common/File";
import { ProjectPath, LEVEL_ENUM } from "../common";
import type Page from "../page";
import Directory from "../common/Directory";
import utils from "../utils";
import { templatePath } from "../../utils";
import {
  mergeCode,
  addBlock,
  addCustomComponent,
  getViewContent,
} from "vusion-api/out/designer/index";
import type { ViewInfo } from "vusion-api/out/designer/index";
import * as fs from "fs-extra";
import { VueFile } from "vusion-api";
import * as _ from "lodash";

export { ViewInfo };

export type ViewOptions = {
  title: string;
  template?: string;
};

export type BlockInfo = {
  name: string;
  title: string;
  tagName: string;
  dependencies: any;
  vusionDependencies: any;
  registry: string;
  uuid?: string;
};

export default class View extends Tree implements ProjectPath {
  public baseName: string;
  public file: File;
  public children?: Array<View>;

  constructor(name: string, root: string, parent: Page) {
    super(name, root, LEVEL_ENUM.view, parent);
    this.baseName = path.basename(name);
    this.file = new File(this.fullPath);
  }

  static getFullPath = function (root: string, name: string): string {
    return path.join(root, name, "index.vue");
  };

  static getAllViewsPath = function (root: string): string[] {
    const dirOP = new Directory(root);
    return dirOP
      .dirAll()
      .filter((filePath) => {
        return filePath.endsWith("index.vue");
      })
      .map((filePath) => "/" + filePath.replace(/[\\/]?index\.vue$/, ""));
  };

  static getViewsPath = function (root: string): string[] {
    const dirOP = new Directory(root);
    return dirOP
      .dir()
      .filter((filePath) => {
        return (
          filePath.endsWith("index.vue") ||
          fs.existsSync(path.join(root, filePath, "index.vue"))
        );
      })
      .map((filePath) => "/" + filePath.replace(/[\\/]?index\.vue$/, ""));
  };

  public getFullPath(): string {
    return View.getFullPath(this.root, this.name);
  }

  public getContent(): string {
    return this.file.load();
  }

  static removeView(root: string, name: string) {
    const file = new File(path.join(root, name));
    if (!file.exists()) {
      throw new Error(`file is not exist`);
    }
    file.remove();
    // 删除页面文件夹后，路由需要手动激活一把
    utils.ensureHotReload(path.join(root, "../routes.map.js"));
  }
  static addView(root: string, name: string, options: ViewOptions) {
    const file = new File(View.getFullPath(root, name));
    if (file.exists()) {
      throw new Error(`file is exist`);
    }
    const templateFile = new File(path.join(templatePath, "view/index.vue"));
    const content = _.template(templateFile.load())(options);
    return file.save(content);
  }

  async loadVueFile() {
    const vueFile = new VueFile(this.fullPath);
    await vueFile.open();
    return vueFile;
  }

  async savePartialCode(
    type: "template" | "script" | "style" | "definition",
    content: string
  ) {
    const vueFile = new VueFile(this.fullPath);
    await vueFile.open();

    if (type === "template") vueFile.template = content;
    else if (type === "script") vueFile.script = content;
    else if (type === "style") vueFile.style = content;
    else if (type === "definition") vueFile.definition = content;

    await vueFile.save();
  }

  async mergeCode(code: string, nodePath: string) {
    return await mergeCode(this.fullPath, code, nodePath);
  }

  async addBlock(blockInfo: BlockInfo) {
    return await addBlock(this.fullPath, blockInfo);
  }

  async getViewContent(viewInfo: ViewInfo) {
    viewInfo.fullPath = this.fullPath;
    return await getViewContent(viewInfo);
  }

  async addCustomComponent(blockInfo: BlockInfo, content: string) {
    return await addCustomComponent(
      this.fullPath,
      this.getLevel(LEVEL_ENUM.project).getFullPath(),
      blockInfo,
      content
    );
  }
}
