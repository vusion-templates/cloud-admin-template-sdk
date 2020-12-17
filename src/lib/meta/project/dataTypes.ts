import * as path from "path";
import DateTypes from "../dataTypes";
import type Project from "./";

const getRootPath = function (root: string): string {
  return path.join(root, "src/global/dataTypes");
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
