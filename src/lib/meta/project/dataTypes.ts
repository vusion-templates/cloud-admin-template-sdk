import * as path from "path";
import DateTypes from "../datatypes";
import type Project from "./";

const getRootPath = function (root: string): string {
  return path.join(root, "src/global/datatypes");
};

export default function (projectRoot: string, project: Project) {
  const root = getRootPath(projectRoot);
  return {
    update(json: object) {
      return DateTypes.update({
        root,
        json,
      });
    },
  };
}
