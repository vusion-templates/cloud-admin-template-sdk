import * as path from "path";
import * as fs from "fs-extra";
type Pages = {
  [prop: string]: {
    entry: string;
    template: string;
    filename: string;
    favicon: string;
    title: string;
    inject: boolean;
    chunks: string[];
    chunksSortMode: string;
    options: {
      auth: boolean;
      isIndex: boolean;
    };
  };
};
export default {
  get(root: string): Pages {
    return JSON.parse(
      fs.readFileSync(path.join(root, "./pages.json")).toString()
    );
  },
  set(root: string, pages: Pages): void {
    fs.writeFileSync(
      path.join(root, "./pages.json"),
      JSON.stringify(pages, null, 4)
    );
  },
};
