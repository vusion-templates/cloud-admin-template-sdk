import * as path from "path";
import * as fs from "fs-extra";

export const fixSlash = function (filePath: string): string {
  return filePath.split(path.sep).join("/");
};
export const templatePath = path.join(__dirname, "../../../template");
export const getFile = function (filePath: string): object {
  let obj;
  if (fs.existsSync(filePath)) {
    const content = fs
      .readFileSync(filePath, "utf8")
      .trim()
      .replace(/export default |module\.exports +=/, "");
    try {
      // eslint-disable-next-line no-eval
      obj = eval("(function(){return " + content + "})()");
    } catch (e) {
      // do noting
    }
  }
  return obj;
};

export type AppConfig = {
  layout: string;
  [prop: string]: string;
};
export const getAppConfig = function (pagePath: string): AppConfig {
  const appConfig = getFile(path.join(pagePath, "app.config.js")) as AppConfig;
  return appConfig;
};

import * as os from "os";
import * as shell from "shelljs";

const { spawn } = require("child_process");

function exec(command: string, options = {}) {
  // const command = args.join(' ');
  console.log(command);

  return new Promise((resolve, reject) => {
    const result = spawn(
      command,
      Object.assign(
        {
          shell: true,
          stdio: "inherit",
        },
        options
      )
    );
    result.on("error", reject);
    result.on("close", (code: number) =>
      code === 0 ? resolve(code) : reject()
    );
  });
}

/**
 * 下载 NPM 包，默认以 package@version 的文件名命名
 * @param info.registry For example: https://registry.npm.taobao.org
 * @param info.name Package name. For example: lodash
 * @param info.version For example: lodash
 * @param dir For example: ./blocks
 * @param name If you want to rename. Defaults to package@version
 * @param clearExisting
 */
export async function npmDownload(
  info: {
    registry?: string;
    name: string;
    version?: string;
  },
  dir: string,
  name?: string,
  clearExisting?: boolean
) {
  const registry = info.registry || "https://registry.npmjs.org";
  const version = info.version || "latest";

  name = name || info.name.replace(/\//, "__");
  const dest = path.join(dir, name);
  if (fs.existsSync(dest)) {
    if (clearExisting) fs.removeSync(dest);
    else return dest;
  }

  const temp = path.resolve(
    os.tmpdir(),
    name +
      "-" +
      new Date()
        .toJSON()
        .replace(/[-:TZ]/g, "")
        .slice(0, -4)
  );
  await fs.ensureDir(temp);

  await exec(`cd ${temp} && npm i ${info.name}@${version}`);
  await fs.move(path.join(temp, "node_modules", info.name), dest);
  fs.removeSync(temp);

  return dest;
}
