import type NodePlop from '../../plop';
export declare type PlopConfig = {
    root: string;
    force?: boolean;
};
declare const _default: {
    loadPages(root: string): object;
    getPlop(config: PlopConfig): NodePlop.API;
    getPagePath(answers: any): string;
    getModulePath(answers: any): string;
    getViewPath(answers: any): string;
};
export default _default;
