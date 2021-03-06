import * as path from "path";
import type { ParseTypes } from "vusion-api/out/designer/index";
import type { loadComponentData as LoadComponentData } from "vusion-api/out/designer/index";
import { loadComponentData } from "vusion-api/out/designer/index";
export default class ModuleComponent {
  public name: string;
  public root: string;
  public fullPath: string;
  constructor(name: string, root: string) {
    this.name = name;
    this.root = root;
    this.fullPath = this.getFullPath();
  }
  getFullPath(): string {
    return path.join(this.root, "node_modules", name);
  }
  async parse(
    parseTypes: ParseTypes = {}
  ): ReturnType<typeof LoadComponentData> {
    return await loadComponentData(this.fullPath, parseTypes);
  }
}
