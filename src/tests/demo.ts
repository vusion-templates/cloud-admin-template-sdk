import * as path from 'path';
import Project from '../lib/meta/project';
async function b() {
    const project = new Project(path.join(__dirname, './tmp'));
    await project.page.add({
        name: 'aaa',
        title: 'xxx',
        auth: true,
    });
    console.log('addPage');
    await project.page.remove({
        name: 'aaa'
    });
    console.log('removePage'); 
}
b();