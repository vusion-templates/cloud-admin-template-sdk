import ModuleComponent from '../../component/module';
import type { ParseTypes } from 'vusion-api/out/designer/index';
import * as path from 'path';
import type { loadExternalLibrary as LoadExternalLibrary } from 'vusion-api/out/designer/index';
import { loadExternalLibrary } from 'vusion-api/out/designer/index';
import Project from '../index';
export {
    ParseTypes
}
export const loadCustomComponentsData =  async function loadCustomComponentsData (project: Project, parseTypes: ParseTypes = {}, baseName?: string): Promise<ReturnType<ModuleComponent["parse"]>[]>{
    const pkg = project.getPackage();
    const pkgDeps = pkg.dependencies || {};
    const components = Object.keys(pkgDeps).filter((name) => {
        if(baseName)
            return name.includes(baseName + '.vue');
        else
            return name.endsWith('.vue');
    });
    const tasks = components.map(async (name): ReturnType<ModuleComponent["parse"]> => await new ModuleComponent(name, project.clientPath).parse(parseTypes));
    return await Promise.all<ReturnType<ModuleComponent["parse"]>>(tasks);
}
export const loadCustomComponentData = async function loadCustomComponentData(project: Project, name: string, parseTypes: ParseTypes = {}): ReturnType<ModuleComponent["parse"]> {
    return await new ModuleComponent(name, project.clientPath).parse(parseTypes);
}
export const loadUILibrary = async function(name: string, project: Project, parseTypes: ParseTypes = {}): ReturnType<typeof LoadExternalLibrary> {
    return await loadExternalLibrary(path.join(project.clientPath, 'node_modules', name), parseTypes);
}
