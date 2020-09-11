import Service from '../service';
import type Project from './';
export default function (projectRoot: string, project: Project): {
    loadList(): Service[];
    loadListPath(): string[];
    load(name: string): Service;
    remove(name: string): void;
    add(name: string, api?: string): void;
};
