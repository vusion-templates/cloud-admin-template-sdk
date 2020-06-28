import promptDirectory from 'inquirer-directory';
import componentGenerator from '../plop/component/add';
import addPageGenerator from '../plop/page/add';
import removePageGenerator from '../plop/page/remove';

module.exports = function (plop): void {
    plop.setPrompt('directory', promptDirectory);
    plop.setGenerator('global component', componentGenerator(plop));
    plop.setGenerator('add-page', addPageGenerator(plop));
    plop.setGenerator('remove-page', removePageGenerator(plop));
};
