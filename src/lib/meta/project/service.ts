import * as path from 'path';
import Service from '../service';
const getRootPath = function (root: string): string {
    return path.join(root, 'src/services');
}
export interface ServiceOP {
    loadList(): Service[];
    loadListPath(): string[];
    load(name: string): Service;
    remove(name: string): ReturnType<typeof Service.remove>;
    add(name: string, api?: string): ReturnType<typeof Service.add>;
}
export default function(projectRoot: string): ServiceOP {
    const root = getRootPath(projectRoot);
    return {
        loadList() {
            return this.loadServicesPath().map((service) => {
                return this.loadService(service);
            });
        },
        loadListPath() {
            return Service.getServicesPath(root);
        },
        load(name) {
            return new Service(name, root, this);
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