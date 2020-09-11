import { Project } from '../lib';
import * as path from 'path';
import View from '../lib/meta/view';
import commands from '../lib/commands';

async function b() {
    const project = new Project(path.join(__dirname, '../../../cloud-admin-template'));
    // await project.addPage({
    //     name: 'aaa',
    //     title: 'xxx',
    //     auth: true,
    // });
    // console.log(View.getViewsPath(project.page.load('dashboard').fullPath + '/views'));
    
    // console.log(project.page.load('dashboard').view.loadTree());
    // console.log(await project.page.load('dashboard').view.loadSubList('/ceee'));
    console.log(await project.page.load('dashboard').view.loadSubList('/ceee'));
    // console.log(project);

    // const pages = project.page.loadList();
}
b();


