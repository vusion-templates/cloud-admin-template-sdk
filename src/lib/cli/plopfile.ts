import promptDirectory from 'inquirer-directory';

import componentGenerator from '../plop/component/add';
import addPageGenerator from '../plop/page/add';
import removePageGenerator from '../plop/page/remove';

import addViewGenerator from '../plop/view/add';
import removeViewGenerator from '../plop/view/remove';

import addServiceGenerator from '../plop/service/add';
import removeServiceGenerator from '../plop/service/remove';

import Project from '../meta/project';
import type NodePlop from '../plop';

module.exports = function (plop: NodePlop.API): void {
    plop.$project = new Project(plop.getDestBasePath());
    plop.setPrompt('directory', promptDirectory);
    plop.setGenerator('global component', componentGenerator(plop));
    plop.setGenerator('page.add', addPageGenerator(plop));
    plop.setGenerator('page.remove', removePageGenerator(plop));
    plop.setGenerator('view.add', addViewGenerator(plop));
    plop.setGenerator('view.remove', removeViewGenerator(plop));
    plop.setGenerator('service.add', addServiceGenerator(plop));
    plop.setGenerator('service.remove', removeServiceGenerator(plop));
};
