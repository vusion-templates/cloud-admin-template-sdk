import * as path from 'path';
import Service from '../service';
import type Project from './';

const getRootPath = function (root: string): string {
    return path.join(root, 'src/global/services');
}

export default function(projectRoot: string, project: Project) {
    const root = getRootPath(projectRoot);
    return {
        loadList() {
            return this.loadListPath().map((service: string) => {
                return this.load(service);
            });
        },
        loadListPath() {
            return Service.getServicesPath(root);
        },
        load(name: string) {
            return new Service(name, root, project);
        },
        remove(name: string) {
            return Service.remove({
                root,
                name,
            });
        },
        add(name: string, api?: string) {
            return Service.add({
                root,
                name,
                api,
            });
        }
    };
}