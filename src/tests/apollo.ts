import * as path from 'path';
import Project from '../lib/meta/project';
async function b(): Promise<void> {
    const project = new Project(path.join(__dirname, './tmp'));
    await project.apollo.updateApollo([
      
    ]);
}
b();
