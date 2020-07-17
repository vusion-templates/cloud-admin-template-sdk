import Project from '../../meta/project';
interface ViewInfo {
    path: string;
    title: string;
    template?: string;
    page: string;
}
declare const _default: {
    add(viewInfo: ViewInfo, project: Project): Array<Function | object | string>;
    remove(viewInfo: ViewInfo, project: Project): Array<Function | object | string>;
};
export default _default;
