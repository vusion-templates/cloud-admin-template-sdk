const { Project } = require('../dist/lib/index');
const path = require('path');
async function b() {
    const project = new Project(path.join(__dirname, '../../cloud-admin-template'));
    await project.removePage({
        name: 'aaa'
    });
    console.log('removePage'); 
}
b();

