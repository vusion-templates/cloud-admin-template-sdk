import * as path from 'path';
import Service from '../service';
import type Project from './';
const getRootPath = function (root: string): string {
    return path.join(root, 'src/global/services');
}
export interface ServiceOP {
    loadList(): Service[];
    loadListPath(): string[];
    load(name: string): Service;
    remove(name: string): ReturnType<typeof Service.remove>;
    add(name: string, api?: string): ReturnType<typeof Service.add>;
}
export default function(projectRoot: string, project: Project): ServiceOP {
    const root = getRootPath(projectRoot);
    return {
        loadList() {
            return this.loadListPath().map((service) => {
                return this.load(service);
            });
        },
        loadListPath() {
            return Service.getServicesPath(root);
        },
        load(name) {
            return new Service(name, root, project);
        },
        remove(name) {
            return Service.remove({
                root,
                name,
            });
        },
        add(name, api) {
            return Service.add({
                root,
                name,
                api,
            });
        }
    } as ServiceOP;
}