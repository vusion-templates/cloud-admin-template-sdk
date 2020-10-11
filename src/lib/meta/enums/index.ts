import * as path from "path";
import { ProjectPath, LEVEL_ENUM } from "../common";
import Tree from "../common/Tree";
import File from "../common/File";
import Directory from "../common/Directory";
import type Project from "../Project";

interface EnumsPath {
  root: string;
  name: string;
  enums?: string;
}

export default class Enums extends Tree implements ProjectPath {
  public subFiles: {
    enums: File;
  };

  static getEnumsPath = function (root: string): string[] {
    const enums = new Directory(root).dir();
    return enums;
  };

  constructor(name: string, root: string, parent: Project) {
    super(name, root, LEVEL_ENUM.service, parent);
    this.subFiles = {
      enums: new File(path.join(this.fullPath, "enum.json")),
    };
  }
  static add(answers?: EnumsPath): void {
    const dir = path.join(answers.root, answers.name);
    if (answers.enums) {
      const enums = new File(path.join(dir, "enums.json"));
      enums.save(answers.enums);
    }
  }
  static remove(answers: EnumsPath): void {
    const dir = path.join(answers.root, answers.name);
    return new Directory(dir).remove();
  }
}
