interface PageInfo {
    name: string;
    title: string;
    template: string;
    auth: boolean;
}
declare const _default: {
    add(pageInfo: PageInfo, root: string): Array<Function | object | string>;
    remove(pageInfo: PageInfo, root: string): Array<Function | object | string>;
};
export default _default;
