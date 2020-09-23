import * as path from "path";
import Apollo from "../apollo";
import type Project from "./";
const getRootPath = function (root: string): string {
  return path.join(root, "src/global/apollo");
};

export interface ApolloOP {
  // 能转化 schema 的 JSON
  updateApollo(JSON: any): void;
}

export default function (projectRoot: string, project: Project): ApolloOP {
  const root = getRootPath(projectRoot);
  return {
    updateApollo(json) {
      return Apollo.updateApollo(root, json);
    },
  } as ApolloOP;
}
