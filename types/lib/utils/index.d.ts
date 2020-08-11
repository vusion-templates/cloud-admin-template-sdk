export declare const fixSlash: (filePath: string) => string;
export declare const templatePath: string;
export declare const getFile: (filePath: string) => object;
export declare type AppConfig = {
    layout: string;
    [prop: string]: string;
};
export declare const getAppConfig: (pagePath: string) => AppConfig;
