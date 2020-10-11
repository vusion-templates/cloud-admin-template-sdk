import * as path from "path";
import Enums from "../enums";
import type Project from "./";

const getRootPath = function (root: string): string {
  return path.join(root, "src/global/enums");
};

export default function (projectRoot: string, project: Project) {
  const root = getRootPath(projectRoot);
  return {
    remove(name: string) {
      return Enums.remove({
        root,
        name,
      });
    },
    add(name: string, enums?: string) {
      return Enums.add({
        root,
        name,
        enums,
      });
    },
  };
}
