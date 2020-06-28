const { Project } = require('../dist/lib/index');
const path = require('path');
async function b() {
    const project = new Project(path.join(__dirname, '../../cloud-admin-template'));
    await project.addPage({
        name: 'aaa',
        title: 'xxx',
        auth: true,
    });
    console.log('addPage');
    await project.removePage({
        name: 'aaa'
    });
    console.log('removePage'); 
}
b();

