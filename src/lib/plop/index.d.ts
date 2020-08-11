import nodePlop from 'node-plop';
import type Project from '../meta/project';
declare namespace NodePlop {
    export type API  = ReturnType<typeof nodePlop> & { $project: Project };
}
export default NodePlop;
