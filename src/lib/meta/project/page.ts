import * as path from "path";
import Page, { AddPage, RemovePage } from "../page";
import { PlopConfig } from "../utils";
import type Project from "./";
const getRootPath = function (root: string): string {
  return path.join(root, "src/views");
};

export default function (projectRoot: string, project: Project) {
  const root = getRootPath(projectRoot);
  return {
    add(answers: AddPage, config?: PlopConfig) {
      return Page.add(answers, {
        root: projectRoot,
        ...config,
      });
    },
    remove(answers: RemovePage, config?: PlopConfig) {
      return Page.remove(answers, {
        root: projectRoot,
        ...config,
      });
    },
    loadList(): Page[] {
      const subDirList = this.loadListPath();
      return subDirList.map((pageName: string) => {
        return this.load(pageName);
      });
    },
    loadListPath(): string[] {
      return Page.getPagesPath(root);
    },
    load(pageName: string): Page {
      return new Page(pageName, root, project);
    },
  };
}
