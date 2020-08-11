import View from '../view';
import type { ViewOptions } from '../view';
import type Page from './';
export interface ViewOP {
    loadListPath(): ReturnType<typeof View.getViewsPath>;
    load(viewPath: string): View;
    remove(view: string): ReturnType<typeof View.removeView>;
    add(view: string, options?: ViewOptions): ReturnType<typeof View.addView>;
}
export default function (pageRoot: string, page: Page): ViewOP;
