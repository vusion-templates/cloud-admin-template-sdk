import { ProjectPath } from "../common";
import Tree from "../common/Tree";
import File from "../common/File";
import { TransforDSL } from "./dsl-to-all";

export default class Apollo extends Tree implements ProjectPath {
  public subFiles: {
    api: File;
    config: File;
    index: File;
  };
  /**
   * 1. generator schema and resolvers
   * 2. write file to right path
   *
   */
  static async updateApollo(root: string, json: any) {
    await TransforDSL(json, root);
  }
}
