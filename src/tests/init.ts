import * as path from "path";
import * as fs from "fs-extra";
import * as cp from "child_process";
const tmp = path.join(__dirname, "../../tmp");
fs.removeSync(tmp);
cp.execSync(
  "git clone https://github.com/vusion-templates/cloud-admin-template.git " +
    tmp
);
