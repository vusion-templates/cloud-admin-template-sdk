import Project from "../lib/meta/project";
import * as path from 'path';
export const rootPath = path.join(__dirname, '../../tmp');
export const project = new Project(rootPath);