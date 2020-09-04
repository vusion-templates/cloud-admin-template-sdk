import View from '../view';
import type { ViewOptions } from '../view';
import type Page from './';
export default function (pageRoot: string, page: Page): {
    loadListPath(): string[];
    loadList(): View[];
    loadTree(): View;
    load(viewPath: string): View;
    remove(viewPath: string): void;
    add(viewPath: string, options?: ViewOptions): void;
};
