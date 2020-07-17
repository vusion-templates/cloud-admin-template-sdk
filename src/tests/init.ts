import * as path from 'path';
import * as cp from 'child_process';
cp.execSync('git clone https://github.com/vusion-templates/cloud-admin-template.git ' + path.join(__dirname, '../../tmp'));
