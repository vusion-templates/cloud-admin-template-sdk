import Service from '../service';
import type Project from './';
export interface ServiceOP {
    loadList(): Service[];
    loadListPath(): string[];
    load(name: string): Service;
    remove(name: string): ReturnType<typeof Service.remove>;
    add(name: string, api?: string): ReturnType<typeof Service.add>;
}
export default function (projectRoot: string, project: Project): ServiceOP;
