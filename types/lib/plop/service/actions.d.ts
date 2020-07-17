import Project from '../../meta/project';
interface ServiceInfo {
    name: string;
}
declare const _default: {
    add(serviceInfo: ServiceInfo, project: Project): Array<Function | object | string>;
    remove(serviceInfo: ServiceInfo, project: Project): Array<Function | object | string>;
};
export default _default;
