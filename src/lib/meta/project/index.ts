import Component, { AddComponent } from "../component";
import { PlopConfig } from "../utils";
import { ProjectPath, LEVEL_ENUM } from "../common";
import Tree from "../common/Tree";
import * as path from "path";
import * as fs from "fs-extra";
import File from "../common/File";
import configResolve from "./config/resolve";
import {
  ParseTypes,
  loadCustomComponentsData,
  loadCustomComponentData,
  loadUILibrary,
} from "./deps";
import Auth from "./auth";
import getPage from "./page";
import getService from "./service";
import getApollo from "./apollo";
import type { ApolloOP } from "./apollo";
import getEnums from "./enums";

const getName = function (dir: string): string {
  const packagePath = path.join(dir, "package.json");
  let name = path.basename(dir);
  if (fs.existsSync(packagePath)) {
    name = new File(packagePath).loadJSON().name;
  }
  return name;
};

/**
 * 项目类
 */
export default class Project extends Tree implements ProjectPath {
  /**
   * 前端路径
   */
  public clientPath: string;
  /**
   * BFF 层路径
   */
  public serverPath: string;
  public auth: Auth;
  public page: ReturnType<typeof getPage>;
  public service: ReturnType<typeof getService>;
  public apollo: ApolloOP;
  public enums: ReturnType<typeof getEnums>;

  constructor(root: string) {
    const name = getName(root);
    super(name, root, LEVEL_ENUM.project, null);
    this.clientPath = this.getSubPath("client");
    const server = this.getSubPath("server");
    this.serverPath = server === root ? "" : server;
    this.auth = new Auth(this.clientPath, this);
    this.page = getPage(this.clientPath, this);
    this.service = getService(this.clientPath, this);
    this.apollo = getApollo(this.clientPath, this);
    this.enums = getEnums(this.clientPath, this);
  }
  public async loadDeps(parseTypes: ParseTypes = {}, baseName?: string) {
    return await loadCustomComponentsData(this, parseTypes, baseName);
  }
  public async loadDep(name: string, parseTypes: ParseTypes = {}) {
    return await loadCustomComponentData(this, name, parseTypes);
  }
  public getPackage(): any {
    return new File(path.join(this.clientPath, "package.json")).loadJSON();
  }
  public loadUILibrary(name: string, parseTypes: ParseTypes = {}) {
    return loadUILibrary(name, this, parseTypes);
  }
  public config() {
    return configResolve(path.join(this.clientPath));
  }
  getFullPath(): string {
    return this.root;
  }
  private getSubPath(subPath: string): string {
    const clientPath = path.join(this.fullPath, subPath);
    if (fs.existsSync(clientPath)) {
      return clientPath;
    }
    return this.fullPath;
  }
  public addComponent(answers: AddComponent, config?: PlopConfig) {
    return Component.add(answers, {
      root: this.clientPath,
      ...config,
    });
  }
}
