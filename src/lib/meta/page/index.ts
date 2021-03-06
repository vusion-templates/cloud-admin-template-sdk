import * as path from "path";
import MetaData from "./MetaData";
import Utils, { PlopConfig } from "../utils";
import Tree from "../common/Tree";
import Directory from "../common/Directory";
import { ProjectPath, LEVEL_ENUM } from "../common";
import Routes from "../routes";
import type Project from "../project";
import getView from "./view";

export interface AddPage {
  name: string;
  title: string;
  template?: string; // 页面模板，当前先直接使用区块代替
  auth?: boolean;
  isIndex?: boolean;
}
export interface RemovePage {
  name: string;
}

export default class Page extends Tree implements ProjectPath {
  public metaData: MetaData;
  public routes: Routes;
  public view: ReturnType<typeof getView>;

  constructor(name: string, root: string, parent: Project) {
    super(name, root, LEVEL_ENUM.page, parent);
    this.metaData = new MetaData(parent.clientPath, name);
    this.routes = new Routes(this.fullPath);
    this.view = getView(this.fullPath, this);
  }

  static getPagesPath = function (root: string): string[] {
    return new Directory(root).dir();
  };

  public getFullPath(): string {
    return path.join(this.root, this.name);
  }

  static add(answers: AddPage, config: PlopConfig): Promise<any> {
    const plop = Utils.getPlop(config);
    return plop
      .getGenerator("page.add")
      .runActions(answers)
      .then((data) => {
        if (data.failures && data.failures.length) {
          throw data.failures
            .map((e) => {
              if (!e) {
                return "";
              } else if (e.message) {
                return e;
              } else {
                return JSON.stringify(e);
              }
            })
            .join("\n");
        }
        return data;
      });
  }
  static remove(answers: RemovePage, config: PlopConfig): Promise<any> {
    const plop = Utils.getPlop(config);
    return plop
      .getGenerator("page.remove")
      .runActions(answers)
      .then((data) => {
        if (data.failures && data.failures.length) {
          throw data.failures
            .map((e) => {
              if (!e) {
                return "";
              } else if (e.message) {
                return e;
              } else {
                return JSON.stringify(e);
              }
            })
            .join("\n");
        }
        return data;
      });
  }
}
