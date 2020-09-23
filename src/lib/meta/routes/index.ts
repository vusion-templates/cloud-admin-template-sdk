import * as path from "path";
import File from "../common/File";
export default class Route {
  public root: string;
  public fullPath: string;
  public subFiles: {
    index: File;
  };
  constructor(root: string) {
    this.root = root;
    const fullPath = (this.fullPath = path.join(root, "routes.map.js"));
    this.subFiles = {
      index: new File(fullPath),
    };
  }
}
