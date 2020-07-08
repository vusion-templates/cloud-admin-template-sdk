declare type Pages = {
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
declare const _default: {
    get(root: string): Pages;
    set(root: string, pages: Pages): void;
};
export default _default;
