import * as path from 'path';
import View  from '../view';
import type { ViewOptions } from '../view';
import type Page from './';
export interface ViewOP {
    loadListPath(): ReturnType<typeof View.getViewsPath>;
    loadList(): Array<View>;
    load(viewPath: string): View;
    remove(view: string): ReturnType<typeof View.removeView>;
    add(view: string, options?: ViewOptions): ReturnType<typeof View.addView>;
}
const getRootPath = function (root: string): string {
    return path.join(root, 'views');
}
export default function(pageRoot: string, page: Page): ViewOP{
    const root = getRootPath(pageRoot);
    return {
        loadListPath() {
            return View.getViewsPath(root);
        },
        loadList(){
            return this.loadListPath().map((view: string) => {
                return this.load(view);
            });
        },
        load(viewPath: string) {
            return new View(viewPath, root, page);
        },
        remove(view: string) {
            return View.removeView(root, view);
        },
        add(view: string, options) {
            return View.addView(root, view, options);
        },
    } as ViewOP;
}