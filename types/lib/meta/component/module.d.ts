import type { ParseTypes } from 'vusion-api/out/designer/index';
import type { loadComponentData as LoadComponentData } from 'vusion-api/out/designer/index';
export default class ModuleComponent {
    name: string;
    root: string;
    fullPath: string;
    constructor(name: string, root: string);
    getFullPath(): string;
    parse(parseTypes?: ParseTypes): ReturnType<typeof LoadComponentData>;
}
