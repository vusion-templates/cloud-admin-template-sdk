import Project from '../../meta/project';
interface ServiceInfo {
    name: string;
}
export default {
    add(serviceInfo: ServiceInfo, project: Project): Array<Function|object|string> {
        const { name } = serviceInfo;
        return [
            function (): void {
                return project.service.add(name);
            },
            
        ];
    },
    remove(serviceInfo: ServiceInfo, project: Project): Array<Function|object|string> {
        const { name } = serviceInfo;
        return [
            function (): void {
                return project.service.remove(name);
            },
        ];
    }
}