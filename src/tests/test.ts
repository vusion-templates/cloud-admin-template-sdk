import { Project } from '../lib';
import * as path from 'path';

async function b() {
    const project = new Project(path.join(__dirname, '../../../cloud-admin-template'));
    // await project.addPage({
    //     name: 'aaa',
    //     title: 'xxx',
    //     auth: true,
    // });
    console.log(project.page.load('dashboard').view.loadList());
    // console.log(project);

    // const pages = project.page.loadList();
}
b();


