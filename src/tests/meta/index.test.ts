import * as path from 'path';
import * as fs from 'fs';
import { rootPath, project } from '../global';
describe('Project', () => {
    test('path', () => {
        expect(project.fullPath).toBe(rootPath);
        expect(project.clientPath).toBe(rootPath);
    });
    const json = fs.readFileSync(path.join(project.clientPath, 'package.json')).toString();
    test('package.json', () => {
        expect(project.getPackage()).toEqual(JSON.parse(json));
    });
});