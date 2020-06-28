export declare type NodePlop = any;
export declare type PlopConfig = {
    root: string;
    force?: boolean;
};
declare const _default: {
    loadPages(root: string): object;
    getPlop(config: PlopConfig): NodePlop;
};
export default _default;
