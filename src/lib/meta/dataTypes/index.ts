import * as path from "path";
import { ProjectPath, LEVEL_ENUM } from "../common";
import Tree from "../common/Tree";
import File from "../common/File";
import Directory from "../common/Directory";
import type Project from "../Project";

interface DataTypesPath {
  root: string;
  json?: Record<string, any>;
}

export default class DataTypes extends Tree implements ProjectPath {
  public subFiles: {
    dataTypes: File;
  };

  static getdataTypesPath = function (root: string): string[] {
    const dataTypes = new Directory(root).dir();
    return dataTypes;
  };

  constructor(name: string, root: string, parent: Project) {
    super(name, root, LEVEL_ENUM.service, parent);
    this.subFiles = {
      dataTypes: new File(path.join(this.fullPath, "dataTypes.json")),
    };
  }

  static update(answers?: DataTypesPath): void {
    if (answers.json) {
      const dataTypes = new File(path.join(answers.root, "dataTypes.json"));
      dataTypes.save(answers.json);
    }
  }
}
