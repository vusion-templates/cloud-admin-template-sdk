import * as path from 'path';
import View  from '../view';
import type { ViewOptions } from '../view';
import type Page from './';

const getRootPath = function (root: string): string {
    return path.join(root, 'views');
}

export default function(pageRoot: string, page: Page) {
    const root = getRootPath(pageRoot);

    return {
        loadListPath() {
            return View.getViewsPath(root);
        },
        loadList() {
            return this.loadListPath().map((viewPath: string) => {
                return this.load(viewPath);
            });
        },
        loadTree() {
            function getChildren(view: View) {
                view.children = View.getViewsPath(path.join(root, view.name))
                    .filter((subPath) => subPath !== '/')
                    .map((subPath) => {
                        const viewPath = path.join(view.name, subPath);
                        const newView = new View(viewPath, root, page);
                        getChildren(newView);
                        return newView;
                    });
            }

            const rootView = new View('/', root, page);
            getChildren(rootView);

            return rootView;
        },
        load(viewPath: string) {
            return new View(viewPath, root, page);
        },
        remove(viewPath: string) {
            return View.removeView(root, viewPath);
        },
        add(viewPath: string, options?: ViewOptions) {
            return View.addView(root, viewPath, options);
        },
    };
}