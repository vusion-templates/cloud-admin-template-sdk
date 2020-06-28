import path from 'path';
import fs from 'fs';

export const fixSlash = function (filePath: string): string {
    return filePath.split(path.sep).join('/');
};
export const getFile = function(filePath: string): object {
    let obj;
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8').trim().replace(/export default |module\.exports +=/, '');
        try {
            // eslint-disable-next-line no-eval
            obj = eval('(function(){return ' + content + '})()');
        } catch (e) {
            // do noting
        }
    }
    return obj;
}

export type AppConfig = {
    layout: string;
    [prop: string]: string;
};
export const getAppConfig = function(pagePath: string): AppConfig {
    const appConfig = getFile(path.join(pagePath, 'app.config.js')) as AppConfig;
    return appConfig;
};
