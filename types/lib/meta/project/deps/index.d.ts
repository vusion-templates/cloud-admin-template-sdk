import ModuleComponent from '../../component/module';
import type { ParseTypes } from 'vusion-api/out/designer/index';
import type { loadExternalLibrary as LoadExternalLibrary } from 'vusion-api/out/designer/index';
import Project from '../index';
export { ParseTypes };
export declare const loadCustomComponentsData: (project: Project, parseTypes?: any, baseName?: string) => Promise<ReturnType<ModuleComponent["parse"]>[]>;
export declare const loadCustomComponentData: (project: Project, name: string, parseTypes?: any) => ReturnType<ModuleComponent["parse"]>;
export declare const loadUILibrary: (name: string, project: Project, parseTypes?: any) => ReturnType<typeof LoadExternalLibrary>;
