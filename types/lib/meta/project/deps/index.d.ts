import ModuleComponent from '../../component/module';
import type { ParseTypes } from 'vusion-api/src/designer';
import type { loadExternalLibrary as LoadExternalLibrary } from 'vusion-api/src/designer';
import Project from '../index';
export { ParseTypes };
export declare const loadCustomComponentsData: (project: Project, parseTypes?: ParseTypes, baseName?: string) => Promise<ReturnType<ModuleComponent["parse"]>[]>;
export declare const loadCustomComponentData: (project: Project, name: string, parseTypes?: ParseTypes) => ReturnType<ModuleComponent["parse"]>;
export declare const loadUILibrary: (name: string, project: Project, parseTypes?: ParseTypes) => ReturnType<typeof LoadExternalLibrary>;
